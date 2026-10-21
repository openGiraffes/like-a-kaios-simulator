using Newtonsoft.Json.Linq;
using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;

namespace KaiosSim
{
    public sealed class BridgeHost : IDisposable
    {
        public readonly AppRecord App;
        readonly AppRegistry registry;
        readonly SocketHub sockets;
        readonly ConcurrentDictionary<string, ConcurrentQueue<JObject>> clients = new ConcurrentDictionary<string, ConcurrentQueue<JObject>>();
        readonly HttpClient http = new HttpClient(new HttpClientHandler { AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate });
        public string Origin;
        public Action<string, JToken> Command;
        public Func<string, JToken, object> Interaction;
        public BridgeHost(AppRegistry registry, AppRecord app)
        {
            this.registry = registry; App = app; http.Timeout = TimeSpan.FromSeconds(30);
            sockets = new SocketHub((client, data) => Emit("socket:event", data, client));
            Directory.CreateDirectory(Path.Combine(registry.DataRoot, "temp", app.Id));
        }
        public JObject Mode()
        {
            string name = (string)registry.Settings()["apiMode"] == "new" ? "new" : "legacy";
            var profiles = JObject.Parse(File.ReadAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Polyfills", "profiles.json")));
            var p = (JObject)profiles[name]; p["mode"] = name; return p;
        }
        public void Emit(string name, object value, string client = null)
        {
            var message = new JObject { ["channel"] = name, ["payload"] = value == null ? JValue.CreateNull() : JToken.FromObject(value) };
            foreach (var pair in clients)
            {
                if (client != null && pair.Key != client) continue;
                // Bound queued notifications if a page stops polling.
                if (pair.Value.Count < 4096) pair.Value.Enqueue(message);
            }
        }
        void Ui(string command, JToken payload = null) { if (Command != null) Command(command, payload); }
        public object Call(string name, JToken value, string client)
        {
            if (String.IsNullOrEmpty(client)) throw new InvalidOperationException("Missing page identity");
            var queue = clients.GetOrAdd(client, _ => new ConcurrentQueue<JObject>());
            var p = value as JObject ?? new JObject();
            if (name.StartsWith("fs:")) return FileCall(name.Substring(3), p);
            switch (name)
            {
                case "events:poll": var events = new JArray(); JObject e; while (events.Count < 256 && queue.TryDequeue(out e)) events.Add(e); return events;
                case "client:close": sockets.CloseClient(client); ConcurrentQueue<JObject> removed; clients.TryRemove(client, out removed); return true;
                case "mode:get-sync": return Mode();
                case "bridge:ready": Ui(name, p); return true;
                case "shell:log": Ui(name, p); return true;
                case "apps:self": return App.ToApi(Origin);
                case "apps:list": case "kaios-list-apps": return new JArray(registry.List().Select(a => a.ToApi(a.Id == App.Id ? Origin : null)));
                case "apps:uninstall": case "kaios-uninstall":
                    var id = value is JObject ? (string)p["manifestURL"] : (string)value; var rec = registry.Find(id);
                    if (rec == null) return new { ok = false, error = "应用未安装" };
                    registry.Remove(rec.Id); Ui("apps:changed"); if (rec.Id == App.Id) Ui("kaios-app-close"); return new { ok = true };
                case "kaios-launch-app": Ui("apps:launch", value); return true;
                case "kaios-launch-by-manifest": var target = registry.Find((string)p["url"]); if (target == null) return false; Ui("apps:launch", new JValue(target.Id)); return true;
                case "kaios-install-url": return InstallUrl((string)value);
                case "kaios-install-file":
                    var installed = registry.Import(VirtualPath((string)p["zipPath"]));
                    if (p["manifestURL"] != null) { installed.Manifest["__manifestURL"] = p["manifestURL"]; registry.Save(installed); }
                    Ui("apps:changed"); return new { ok = true, app = installed.ToApi(), mapped = true };
                case "kaios:apps-event": Emit(name, p); return true;
                case "kaios-register-handler": return true;
                case "kaios-activity-result": Emit("kaios-message", new { type = "activity-result", message = p }); return true;
                case "kaios-activity": return Activity(p);
                case "pick-file": return Interaction == null ? new { canceled = true } : Interaction("pick-file", value);
                case "settings:get":
                    var settings = registry.Settings(); var keys = value is JArray ? value.Values<string>().ToArray() : new[] { (string)value ?? "*" };
                    if (keys.Contains("*")) return settings;
                    var subset = new JObject(); foreach (var key in keys) subset[key] = settings[key] ?? JValue.CreateNull(); return subset;
                case "settings:set": registry.SetSettings(p); return true;
                case "storage:path": return "/storage";
                case "notify": Ui(name, p); return true;
                case "volume:get": return (double?)registry.Settings()["volume"] ?? 0.6;
                case "volume:up": case "volume:down": case "volume:set": case "volume:show":
                    double volume = (double?)registry.Settings()["volume"] ?? 0.6;
                    if (name == "volume:set") volume = (double)value;
                    else if (name == "volume:up") volume += 0.1; else if (name == "volume:down") volume -= 0.1;
                    volume = Math.Max(0, Math.Min(1, volume)); registry.SetSettings(new JObject { ["volume"] = volume });
                    Emit("kaios-volume", volume); Ui("volume", new JValue(volume)); return volume;
                case "kaios:battery:request": Ui(name); return true;
                case "kaios-open-url": OpenExternal((string)p["url"]); return true;
                case "kaios-app-close": case "kaios:fullscreen": case "shell:kaios-key": Ui(name, value); return true;
                case "kaios-vibrate": return true;
                case "kaios-http": return Http(p);
                case "crypto:random": var random = new byte[Math.Max(0, Math.Min(65536, (int)p["count"]))]; using (var rng = RandomNumberGenerator.Create()) rng.GetBytes(random); return Convert.ToBase64String(random);
                case "crypto:hmac":
                    if ((string)p["algorithm"] != "sha256") throw new InvalidOperationException("Unsupported HMAC algorithm");
                    using (var hmac = new HMACSHA256(Convert.FromBase64String((string)p["key"]))) return Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes((string)p["text"])));
                case "socket:create": return sockets.Create(client, p);
                case "socket:action": return sockets.Action(client, p);
                default: throw new InvalidOperationException("Unknown host channel: " + name);
            }
        }
        object Activity(JObject p)
        {
            var data = p["data"] as JObject ?? new JObject();
            switch ((string)p["name"])
            {
                case "pick": return new { __pick = true };
                case "open-page": case "view": case "open":
                    if (data["url"] != null) { OpenExternal((string)data["url"]); return true; }
                    return new { error = "This activity requires a URL", errorName = "NotSupportedError" };
                case "share": return Interaction == null ? null : Interaction("share", data);
                case "dial": Ui("notify", new JObject { ["title"] = "模拟拨号", ["body"] = (string)data["number"] ?? "" }); return true;
                default: return new { error = "No activity handler: " + (string)p["name"], errorName = "NO_PROVIDER" };
            }
        }
        static void OpenExternal(string text)
        {
            Uri url; if (!Uri.TryCreate(text, UriKind.Absolute, out url) || (url.Scheme != "https" && url.Scheme != "http" && url.Scheme != "mailto")) throw new InvalidOperationException("Unsupported external URL");
            Process.Start(new ProcessStartInfo(url.AbsoluteUri) { UseShellExecute = true });
        }
        JObject Http(JObject p)
        {
            Uri url; if (!Uri.TryCreate((string)p["url"], UriKind.Absolute, out url) || (url.Scheme != "http" && url.Scheme != "https")) throw new InvalidOperationException("Invalid HTTP URL");
            using (var req = new HttpRequestMessage(new HttpMethod((string)p["method"] ?? "GET"), url))
            {
                if (p["bodyBase64"] != null) req.Content = new ByteArrayContent(Convert.FromBase64String((string)p["bodyBase64"]));
                var headers = p["headers"] as JObject;
                if (headers != null) foreach (var header in headers.Properties()) if (!req.Headers.TryAddWithoutValidation(header.Name, header.Value.ToString()) && req.Content != null) req.Content.Headers.TryAddWithoutValidation(header.Name, header.Value.ToString());
                if (!req.Headers.Contains("User-Agent")) req.Headers.TryAddWithoutValidation("User-Agent", (string)Mode()["ua"]);
                using (var response = http.SendAsync(req).GetAwaiter().GetResult())
                {
                    var responseHeaders = new JObject(); foreach (var h in response.Headers) responseHeaders[h.Key] = String.Join(", ", h.Value); foreach (var h in response.Content.Headers) responseHeaders[h.Key] = String.Join(", ", h.Value);
                    return new JObject { ["ok"] = response.IsSuccessStatusCode, ["status"] = (int)response.StatusCode, ["headers"] = responseHeaders, ["bodyBase64"] = Convert.ToBase64String(response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()) };
                }
            }
        }
        object InstallUrl(string url)
        {
            var reply = Http(new JObject { ["url"] = url });
            if (!(bool)reply["ok"]) return new { ok = false, error = "HTTP " + reply["status"] };
            var file = VirtualPath("/tmp/install-" + Guid.NewGuid().ToString("N") + ".zip");
            try { File.WriteAllBytes(file, Convert.FromBase64String((string)reply["bodyBase64"])); var rec = registry.Import(file); rec.Manifest["__manifestURL"] = url; registry.Save(rec); Ui("apps:changed"); return new { ok = true, app = rec.ToApi() }; }
            finally { if (File.Exists(file)) File.Delete(file); }
        }
        string VirtualPath(string virtualPath)
        {
            string path = (virtualPath ?? "").Replace('\\', '/');
            if (path == "/storage" || path.StartsWith("/storage/")) return AppRegistry.SafePath(registry.Storage(App.Id), path.Substring(8).TrimStart('/'));
            if (path == "/tmp" || path.StartsWith("/tmp/")) return AppRegistry.SafePath(Path.Combine(registry.DataRoot, "temp", App.Id), path.Substring(4).TrimStart('/'));
            throw new InvalidDataException("File access is limited to the app's virtual storage");
        }
        object FileCall(string action, JObject p)
        {
            var file = VirtualPath((string)p["path"]);
            switch (action)
            {
                case "read": return Convert.ToBase64String(File.ReadAllBytes(file));
                case "write": Directory.CreateDirectory(Path.GetDirectoryName(file)); File.WriteAllBytes(file, Convert.FromBase64String((string)p["base64"])); return true;
                case "exists": return File.Exists(file) || Directory.Exists(file);
                case "mkdir": Directory.CreateDirectory(file); return true;
                case "unlink": File.Delete(file); return true;
                case "stat": if (!File.Exists(file) && !Directory.Exists(file)) throw new FileNotFoundException(file); return new { name = Path.GetFileName(file), directory = Directory.Exists(file), size = File.Exists(file) ? new FileInfo(file).Length : 0 };
                case "readdir": return Directory.GetFileSystemEntries(file).Select(f => new { name = Path.GetFileName(f), directory = Directory.Exists(f), size = File.Exists(f) ? new FileInfo(f).Length : 0 }).ToArray();
                default: throw new InvalidOperationException("Unknown filesystem operation");
            }
        }
        public void Dispose() { sockets.Dispose(); http.Dispose(); clients.Clear(); }
    }
}
