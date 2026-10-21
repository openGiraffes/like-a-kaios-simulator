using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace KaiosSim
{
    // A loopback-only server avoids HttpListener URL ACL / administrator setup.
    // Every HTML response is bootstrapped before any application script runs.
    public sealed class BridgeServer : IDisposable
    {
        readonly TcpListener listener;
        readonly BridgeHost host;
        readonly string token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        readonly string bundle;
        volatile bool stopped;
        public string Origin { get; private set; }
        public int Port { get; private set; }
        public bool Diagnostics { get; set; }
        public string Bootstrap { get { return "window.__kaiosHost=" + new JObject { ["token"] = token, ["endpoint"] = Origin + "/__sim/rpc", ["parentOrigin"] = Origin, ["appOrigin"] = host.App.VirtualOrigin }.ToString(Newtonsoft.Json.Formatting.None) + ";window.__kaiosBootErrors=[];window.addEventListener('error',function(e){window.__kaiosBootErrors.push({message:e.message,file:e.filename,line:e.lineno,stack:e.error&&e.error.stack});});"; } }
        public BridgeServer(BridgeHost host, int preferredPort)
        {
            this.host = host;
            bundle = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Polyfills", "kaios-gecko.js");
            if (!File.Exists(bundle)) throw new FileNotFoundException("缺少 Gecko polyfill，请重新构建项目。", bundle);
            listener = new TcpListener(IPAddress.Loopback, preferredPort);
            try { listener.Start(); }
            catch (SocketException) { listener = new TcpListener(IPAddress.Loopback, 0); listener.Start(); }
            Port = ((IPEndPoint)listener.LocalEndpoint).Port; Origin = "http://127.0.0.1:" + Port;
            host.Origin = Origin;
            Task.Run((Action)Accept);
        }
        void Accept()
        {
            while (!stopped)
            {
                try { var c = listener.AcceptTcpClient(); Task.Run(() => Serve(c)); }
                catch (SocketException) { if (!stopped) Thread.Sleep(20); }
                catch (ObjectDisposedException) { break; }
            }
        }
        static string Line(Stream stream)
        {
            var bytes = new List<byte>(); int c;
            while ((c = stream.ReadByte()) != -1 && c != 10) { if (c != 13) bytes.Add((byte)c); if (bytes.Count > 16384) throw new InvalidDataException("HTTP header too long"); }
            return Encoding.ASCII.GetString(bytes.ToArray());
        }
        void Serve(TcpClient client)
        {
            using (client)
            {
                client.ReceiveTimeout = 30000; client.SendTimeout = 30000;
                var stream = client.GetStream();
                try
                {
                    var request = Line(stream).Split(' '); if (request.Length < 2) return;
                    if (Diagnostics && request[0] == "GET") host.Command("shell:log", new JObject { ["text"] = "HTTP GET " + request[1].Split('?')[0] });
                    var headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                    string line; int count = 0;
                    while (!String.IsNullOrEmpty(line = Line(stream))) { if (++count > 100) throw new InvalidDataException("Too many headers"); int i = line.IndexOf(':'); if (i > 0) headers[line.Substring(0, i)] = line.Substring(i + 1).Trim(); }
                    if (request[0] == "OPTIONS") { Reply(stream, 204, "text/plain", new byte[0]); return; }
                    string resource = Uri.UnescapeDataString(request[1].Split('?')[0]);
                    if (resource == "/__sim/rpc" && request[0] == "POST")
                    {
                        string rawLength; int length;
                        if (!headers.TryGetValue("Content-Length", out rawLength) || !Int32.TryParse(rawLength, out length) || length < 0 || length > 32 * 1024 * 1024) throw new InvalidDataException("Invalid request length");
                        var bytes = new byte[length]; int got = 0; while (got < length) { var n = stream.Read(bytes, got, length - got); if (n == 0) throw new EndOfStreamException(); got += n; }
                        var req = JObject.Parse(Encoding.UTF8.GetString(bytes));
                        if ((string)req["token"] != token) { Reply(stream, 403, "text/plain", Encoding.UTF8.GetBytes("Forbidden")); return; }
                        JObject result;
                        try { var value = host.Call((string)req["channel"], req["payload"], (string)req["client"]); result = new JObject { ["value"] = value == null ? JValue.CreateNull() : JToken.FromObject(value) }; }
                        catch (Exception ex) { result = new JObject { ["error"] = ex.Message }; }
                        Reply(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes(result.ToString(Newtonsoft.Json.Formatting.None))); return;
                    }
                    if (resource == "/__sim/bootstrap.js")
                    {
                        Reply(stream, 200, "text/javascript; charset=utf-8", Encoding.UTF8.GetBytes(Bootstrap)); return;
                    }
                    if (resource == "/__sim/polyfill.js") { Reply(stream, 200, "text/javascript; charset=utf-8", File.ReadAllBytes(bundle)); return; }
                    if (request[0] != "GET" && request[0] != "HEAD") { Reply(stream, 405, "text/plain", new byte[0]); return; }
                    if (resource.StartsWith("/__sim/external-api/")) { Reply(stream, 200, "text/javascript", Encoding.UTF8.GetBytes("/* System services supplied by the KaiOS polyfill. */")); return; }
                    var path = resource.StartsWith("/__sim/shared/") ? AppRegistry.SafePath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Polyfills", "shared"), resource.Substring(14))
                        : resource == "/__sim/ads.js" ? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Polyfills", "kaiads.js")
                        : AppRegistry.SafePath(host.App.Root, resource.TrimStart('/'));
                    if (Directory.Exists(path)) path = Path.Combine(path, "index.html");
                    if (!File.Exists(path)) { Reply(stream, 404, "text/plain", Encoding.UTF8.GetBytes("File not found")); return; }
                    var content = File.ReadAllBytes(path); string mime = Mime(path);
                    if (mime.StartsWith("text/html"))
                    {
                        var html = File.ReadAllText(path);
                        string boot = "<script src=\"/__sim/bootstrap.js\"></script><script src=\"/__sim/polyfill.js\"></script>";
                        var doctype = Regex.Match(html, @"^\s*<!doctype[^>]*>", RegexOptions.IgnoreCase);
                        html = doctype.Success ? html.Insert(doctype.Length, boot) : boot + html;
                        content = Encoding.UTF8.GetBytes(html);
                    }
                    string range;
                    if (!mime.StartsWith("text/html") && headers.TryGetValue("Range", out range))
                    {
                        var m = Regex.Match(range, @"^bytes=(\d+)-(\d*)$"); long start, end;
                        if (m.Success && Int64.TryParse(m.Groups[1].Value, out start) && start < content.LongLength)
                        {
                            end = m.Groups[2].Length == 0 ? content.LongLength - 1 : Math.Min(Int64.Parse(m.Groups[2].Value), content.LongLength - 1);
                            if (end >= start) { var slice = new byte[end - start + 1]; Array.Copy(content, start, slice, 0, slice.LongLength); Reply(stream, 206, mime, slice, request[0] == "HEAD", "Content-Range: bytes " + start + "-" + end + "/" + content.Length + "\r\n"); return; }
                        }
                        Reply(stream, 416, "text/plain", new byte[0]); return;
                    }
                    Reply(stream, 200, mime, content, request[0] == "HEAD");
                }
                catch (Exception ex) { try { Reply(stream, 500, "text/plain; charset=utf-8", Encoding.UTF8.GetBytes(ex.Message)); } catch { } }
            }
        }
        static void Reply(Stream s, int code, string mime, byte[] body, bool head = false, string extra = "")
        {
            var headers = Encoding.ASCII.GetBytes("HTTP/1.1 " + code + " " + (code == 200 ? "OK" : "Response") + "\r\nContent-Type: " + mime + "\r\nContent-Length: " + body.Length + "\r\nConnection: close\r\nCache-Control: no-store\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Content-Type\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccept-Ranges: bytes\r\n" + extra + "\r\n");
            s.Write(headers, 0, headers.Length); if (!head) s.Write(body, 0, body.Length);
        }
        public static string Mime(string p)
        {
            switch (Path.GetExtension(p).ToLowerInvariant())
            {
                case ".html": case ".htm": return "text/html; charset=utf-8";
                case ".js": case ".mjs": return "text/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".json": case ".webapp": case ".webmanifest": return "application/json";
                case ".png": return "image/png"; case ".jpg": case ".jpeg": return "image/jpeg"; case ".gif": return "image/gif";
                case ".svg": return "image/svg+xml"; case ".woff": return "application/font-woff"; case ".woff2": return "font/woff2";
                case ".mp3": return "audio/mpeg"; case ".ogg": return "audio/ogg"; case ".mp4": return "video/mp4"; case ".webm": return "video/webm";
                default: return "application/octet-stream";
            }
        }
        public void Dispose() { stopped = true; listener.Stop(); host.Dispose(); }
    }
}
