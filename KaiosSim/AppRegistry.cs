using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace KaiosSim
{
    public sealed class AppRecord
    {
        public string Id, Name, Root, ManifestFile, StartUrl, Source;
        public bool Managed;
        public int Port;
        public DateTime LastRun;
        public JObject Manifest = new JObject();
        public string VirtualOrigin
        {
            get
            {
                var declared = (string)(Manifest.SelectToken("b2g_features.origin") ?? Manifest["origin"]);
                if (String.IsNullOrEmpty(declared)) return "app://" + Id;
                if (declared.Contains("://")) return declared.TrimEnd('/');
                return "http://" + declared + (declared.EndsWith(".localhost", StringComparison.OrdinalIgnoreCase) ? "" : ".localhost");
            }
        }
        public bool Fullscreen { get { return (bool?)Manifest["fullscreen"] == true || (string)Manifest["display"] == "fullscreen" || (string)(Manifest.SelectToken("b2g_features.chrome.statusbar") ?? Manifest.SelectToken("chrome.statusbar")) == "hidden"; } }
        public bool Overlap { get { return (string)(Manifest.SelectToken("b2g_features.chrome.statusbar") ?? Manifest.SelectToken("chrome.statusbar")) == "overlap"; } }
        public string Theme { get { return (string)(Manifest["theme_color"] ?? Manifest.SelectToken("b2g_features.focus_color")) ?? "#4b2e83"; } }
        public JObject ToApi(string origin = null)
        {
            return new JObject { ["id"] = Id, ["name"] = Name, ["shortName"] = (string)Manifest["short_name"] ?? Name,
                ["version"] = (string)(Manifest["version"] ?? Manifest.SelectToken("b2g_features.version")) ?? "",
                ["description"] = (string)Manifest["description"] ?? "", ["type"] = (string)(Manifest["type"] ?? Manifest.SelectToken("b2g_features.type")) ?? "web",
                ["developer"] = Manifest["developer"] ?? Manifest.SelectToken("b2g_features.developer") ?? new JObject(),
                ["icons"] = Manifest["icons"] ?? new JArray(), ["startUrl"] = StartUrl, ["origin"] = origin ?? "app://" + Id,
                ["manifestURL"] = (string)Manifest["__manifestURL"] ?? "app://" + Id + "/" + (ManifestFile ?? "manifest.webapp"), ["manifest"] = Manifest.DeepClone() };
        }
    }

    public sealed class AppRegistry
    {
        public readonly string DataRoot;
        readonly object gate = new object();
        List<AppRecord> records;
        public static readonly string[] ManifestNames = { "manifest.webmanifest", "manifest.webapp", "appmanifest.json", "manifest.json" };
        public AppRegistry(string root)
        {
            DataRoot = Path.GetFullPath(root); Directory.CreateDirectory(root);
            records = File.Exists(DbPath) ? JsonConvert.DeserializeObject<List<AppRecord>>(File.ReadAllText(DbPath)) : new List<AppRecord>();
            if (records == null) records = new List<AppRecord>();
        }
        string DbPath { get { return Path.Combine(DataRoot, "apps.json"); } }
        public AppRecord[] List() { lock (gate) return records.OrderByDescending(a => a.LastRun).ThenBy(a => a.Name).ToArray(); }
        public AppRecord Find(string id) { lock (gate) return records.FirstOrDefault(a => a.Id == id || (string)a.Manifest["__manifestURL"] == id || a.ToApi()["manifestURL"].ToString() == id); }
        public void Save(AppRecord app) { lock (gate) { var next = records.Where(a => a.Id != app.Id).ToList(); next.Add(app); AtomicWrite(DbPath, JsonConvert.SerializeObject(next, Formatting.Indented)); records = next; } }
        public void Remove(string id)
        {
            lock (gate)
            {
                var rec = Find(id); if (rec == null) return;
                var next = records.Where(a => a.Id != rec.Id).ToList();
                AtomicWrite(DbPath, JsonConvert.SerializeObject(next, Formatting.Indented)); records = next;
                if (rec.Managed && IsWithin(Path.Combine(DataRoot, "apps"), rec.Root) && Directory.Exists(rec.Root)) Directory.Delete(rec.Root, true);
                // Keep browser profile and SD card unless the user explicitly clears data.
            }
        }
        public JObject Settings()
        {
            lock (gate) { var p = Path.Combine(DataRoot, "settings.json"); return File.Exists(p) ? JObject.Parse(File.ReadAllText(p)) : new JObject(); }
        }
        public void SetSettings(JObject changes)
        {
            lock (gate) { var obj = Settings(); foreach (var p in changes.Properties()) obj[p.Name] = p.Value; AtomicWrite(Path.Combine(DataRoot, "settings.json"), obj.ToString()); }
        }
        public string Storage(string id) { var p = SafePath(Path.Combine(DataRoot, "storage"), id); Directory.CreateDirectory(Path.Combine(p, "sdcard")); return p; }
        public AppRecord Import(string source)
        {
            source = Path.GetFullPath(source);
            if (Path.GetExtension(source).Equals(".zip", StringComparison.OrdinalIgnoreCase)) return ImportZip(source);
            string root = Directory.Exists(source) ? source : Path.GetDirectoryName(source);
            string manifest = Directory.Exists(source) ? FindManifest(root) : (Path.GetExtension(source).Equals(".html", StringComparison.OrdinalIgnoreCase) || Path.GetExtension(source).Equals(".htm", StringComparison.OrdinalIgnoreCase) ? null : source);
            var rec = ReadRecord(root, manifest, manifest == null && File.Exists(source) ? Path.GetFileName(source) : null);
            rec.Source = source; var old = Find(rec.Id); if (old != null) { rec.Port = old.Port; rec.LastRun = old.LastRun; }
            Save(rec); if (old != null && old.Managed && old.Root != rec.Root && IsWithin(Path.Combine(DataRoot, "apps"), old.Root)) Cleanup(old.Root); return rec;
        }
        AppRecord ImportZip(string zipPath)
        {
            var apps = Path.Combine(DataRoot, "apps"); Directory.CreateDirectory(apps);
            var stage = Path.Combine(apps, ".install-" + Guid.NewGuid().ToString("N")); Directory.CreateDirectory(stage);
            string backup = null, dest = null; bool moved = false, committed = false;
            try
            {
                using (var zip = ZipFile.OpenRead(zipPath))
                {
                    long total = 0;
                    foreach (var entry in zip.Entries)
                    {
                        total += entry.Length; if (total > 1024L * 1024 * 1024) throw new InvalidDataException("应用包解压后超过 1 GB。");
                        var name = entry.FullName.Replace('\\', '/');
                        if (name.StartsWith("/") || name.Contains(":") || name.Split('/').Contains("..")) throw new InvalidDataException("ZIP 包含非法路径。");
                        var file = SafePath(stage, name);
                        if (name.EndsWith("/")) Directory.CreateDirectory(file);
                        else { Directory.CreateDirectory(Path.GetDirectoryName(file)); entry.ExtractToFile(file, true); }
                    }
                }
                var root = stage;
                var manifest = FindManifest(root);
                if (manifest == null)
                {
                    var matches = Directory.GetFiles(stage, "*", SearchOption.AllDirectories).Where(f => ManifestNames.Contains(Path.GetFileName(f))).GroupBy(Path.GetDirectoryName).OrderBy(g => g.Key.Length).ToArray();
                    if (matches.Length > 0) { root = matches[0].Key; manifest = FindManifest(root); }
                }
                var rec = ReadRecord(root, manifest, null);
                rec.Managed = true; rec.Source = zipPath;
                var old = Find(rec.Id); if (old != null) { rec.Port = old.Port; rec.LastRun = old.LastRun; }
                dest = SafePath(apps, rec.Id); backup = dest + ".backup-" + Guid.NewGuid().ToString("N");
                if (Directory.Exists(dest)) Directory.Move(dest, backup);
                Directory.Move(root, dest); moved = true; rec.Root = dest;
                Save(rec); committed = true;
                return rec;
            }
            finally
            {
                if (!committed && moved && Directory.Exists(dest)) Directory.Delete(dest, true);
                if (!committed && backup != null && Directory.Exists(backup)) Directory.Move(backup, dest);
                if (committed && backup != null) Cleanup(backup);
                Cleanup(stage);
            }
        }
        static void Cleanup(string directory) { try { if (Directory.Exists(directory)) Directory.Delete(directory, true); } catch (IOException e) { System.Diagnostics.Trace.WriteLine("Cleanup deferred: " + e.Message); } catch (UnauthorizedAccessException e) { System.Diagnostics.Trace.WriteLine("Cleanup deferred: " + e.Message); } }
        static AppRecord ReadRecord(string root, string manifestPath, string html)
        {
            var manifest = manifestPath == null ? new JObject { ["name"] = Path.GetFileName(root), ["start_url"] = html ?? "index.html", ["fullscreen"] = true } : JObject.Parse(File.ReadAllText(manifestPath));
            var launch = ((string)(manifest["start_url"] ?? manifest["launch_path"]) ?? "index.html").TrimStart('/');
            if (String.IsNullOrWhiteSpace(launch)) launch = "index.html";
            var file = launch.Split('?', '#')[0];
            if (!File.Exists(SafePath(root, Uri.UnescapeDataString(file)))) throw new FileNotFoundException("找不到应用入口：" + file);
            var name = (string)manifest["name"] ?? Path.GetFileName(root);
            var identity = (string)(manifest["id"] ?? manifest["origin"]) ?? name;
            string hash; using (var sha = SHA256.Create()) hash = BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(identity))).Replace("-", "").Substring(0, 16).ToLowerInvariant();
            return new AppRecord { Id = "app-" + hash, Name = name, Root = Path.GetFullPath(root), Manifest = manifest, ManifestFile = manifestPath == null ? null : Path.GetFileName(manifestPath), StartUrl = "/" + launch };
        }
        public void ImportHistory(string file, Action<string> log)
        {
            if (!File.Exists(file) || (bool?)Settings()["historyMigrated"] == true) return;
            JToken history; try { history = JToken.Parse(File.ReadAllText(file)); } catch (JsonException e) { log("历史记录无法读取：" + e.Message); return; }
            var paths = history is JArray ? history.Values<string>() : ((JObject)history).Properties().Select(p => p.Name);
            foreach (var p in paths) { try { if (File.Exists(p)) Import(p); } catch (Exception e) { log("历史记录跳过：" + p + " — " + e.Message); } }
            SetSettings(new JObject { ["historyMigrated"] = true });
        }
        static string FindManifest(string root) { return ManifestNames.Select(n => Path.Combine(root, n)).FirstOrDefault(File.Exists); }
        public static bool IsWithin(string root, string path) { return Path.GetFullPath(path).StartsWith(Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase); }
        public static string SafePath(string root, string relative)
        {
            if (relative == null || relative.Contains(":")) throw new InvalidDataException("非法文件路径。");
            var p = Path.GetFullPath(Path.Combine(root, relative.Replace('/', Path.DirectorySeparatorChar)));
            if (p != Path.GetFullPath(root) && !IsWithin(root, p)) throw new InvalidDataException("路径超出应用目录。");
            return p;
        }
        public static void AtomicWrite(string path, string body)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path)); var tmp = path + ".tmp";
            File.WriteAllText(tmp, body, new UTF8Encoding(false));
            if (File.Exists(path)) File.Replace(tmp, path, null); else File.Move(tmp, path);
        }
    }
}
