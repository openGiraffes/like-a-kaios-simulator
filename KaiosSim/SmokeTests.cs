using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace KaiosSim
{
    // Explicit --smoke mode only; always uses an isolated profile and registry.
    internal static class SmokeTests
    {
        public static void Run(string manifest, string output, string mode)
        {
            var data = Path.Combine(Path.GetTempPath(), "KaiosSim-smoke-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(data); Directory.CreateDirectory(Path.GetDirectoryName(output));
            var tcp = new TcpListener(IPAddress.Loopback, 0); tcp.Start();
            var udp = new UdpClient(new IPEndPoint(IPAddress.Loopback, 0));
            Task.Run(() => { try { using (var c = tcp.AcceptTcpClient()) { var stream = c.GetStream(); var b = new byte[1024]; int n; while ((n = stream.Read(b, 0, b.Length)) > 0) stream.Write(b, 0, n); } } catch { } });
            Task.Run(() => { try { var end = new IPEndPoint(IPAddress.Any, 0); var b = udp.Receive(ref end); udp.Send(b, b.Length, end); } catch { } });
            var frameServer = new TcpListener(IPAddress.Loopback, 0); frameServer.Start();
            Task.Run(() => { try { while (true) { var accepted = frameServer.AcceptTcpClient(); Task.Run(() => { try { using (var c = accepted) { c.ReceiveTimeout = 3000; var stream = c.GetStream(); var reader = new StreamReader(stream); string line; while (!String.IsNullOrEmpty(line = reader.ReadLine())) { } var body = System.Text.Encoding.UTF8.GetBytes("<!doctype html><script>window.addEventListener('keydown',function(e){if(e.key==='#'){e.preventDefault();parent.postMessage({smokeKey:true},'http://compat-lab.localhost');}});window.addEventListener('message',function(e){if(e.data==='ping')parent.postMessage({smokeReply:true,origin:e.origin},'http://compat-lab.localhost');});parent.postMessage({smokeFrame:true,ready:window.__kaiosGeckoReady===true},'http://compat-lab.localhost');</script>"); var head = System.Text.Encoding.ASCII.GetBytes("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nConnection: close\r\nContent-Length: " + body.Length + "\r\n\r\n"); stream.Write(head, 0, head.Length); stream.Write(body, 0, body.Length); } } catch { } }); } } catch { } });
            var form = new Form1(data);
            form.Registry.SetSettings(new JObject { ["apiMode"] = mode, ["smoke.tcp"] = ((IPEndPoint)tcp.LocalEndpoint).Port, ["smoke.frame"] = ((IPEndPoint)frameServer.LocalEndpoint).Port, ["smoke.udp"] = ((IPEndPoint)udp.Client.LocalEndPoint).Port });
            TestInstall(form.Registry, Path.GetDirectoryName(manifest));
            var app = form.Registry.Import(manifest);
            bool completed = false;
            var timer = new Timer { Interval = 90000 };
            SimForm sim = null;
            Action finish = () => { timer.Stop(); if (sim != null) { sim.Close(); sim.Dispose(); } form.Close(); };
            form.Shown += (s, e) => form.BeginInvoke(new Action(() => {
                sim = new SimForm(form.Registry, app);
                sim.HostMessage += (name, value) => {
                    if (name == "notify" && value != null && ((string)value["tag"] ?? "").StartsWith("smoke-")) sim.ActivateNotification();
                    if (name != "shell:log" || value == null) return;
                    string text = (string)value["text"] ?? ""; File.AppendAllText(output + ".log", text + Environment.NewLine);
                    if (text.Contains("SMOKE_FRAME_KEY")) { sim.Log("KEY_FOCUS:" + sim.Eval("document.activeElement.tagName") + " FRAME:" + sim.Eval("location.href", true)); sim.SendKey("#"); return; }
                    int at = text.IndexOf("SMOKE_RESULT:", StringComparison.Ordinal);
                    if (at < 0 || completed) return;
                    completed = true; var result = JObject.Parse(text.Substring(at + 13)); result["log"] = sim.DiagnosticLog; result["mode"] = mode; result["installTests"] = true;
                    result["nativeEvalPassed"] = sim.Eval("String(6 * 7)") == "42"; result["ok"] = (bool)result["ok"] && (bool)result["nativeEvalPassed"];
                    result["settingsPersisted"] = (int?)new AppRegistry(data).Settings()["smoke.value"] == 42;
                    File.WriteAllText(output, result.ToString()); Environment.ExitCode = (bool)result["ok"] && (bool)result["settingsPersisted"] ? 0 : 1;
                    form.BeginInvoke(finish);
                };
                timer.Start(); sim.ShowDialog(form);
            }));
            timer.Tick += (s, e) => { File.WriteAllText(output, new JObject { ["ok"] = false, ["error"] = "90 second timeout", ["bootErrors"] = sim == null ? "no window" : sim.Eval("JSON.stringify(window.__kaiosBootErrors)"), ["log"] = sim == null ? "" : sim.DiagnosticLog, ["page"] = sim == null ? "no window" : sim.Eval("document.documentElement.outerHTML") }.ToString()); Environment.ExitCode = 1; finish(); };
            try { Application.Run(form); }
            finally { timer.Dispose(); tcp.Stop(); udp.Close(); frameServer.Stop(); form.Dispose(); }
        }
        public static void Diagnose(string source, string output, string mode)
        {
            var data = Path.Combine(Path.GetTempPath(), "KaiosSim-diagnose-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(Path.GetDirectoryName(output));
            var form = new Form1(data); form.Registry.SetSettings(new JObject { ["apiMode"] = mode });
            var app = form.Registry.Import(source); SimForm sim = null;
            var timer = new Timer { Interval = 120000 };
            form.Shown += (sender, args) => form.BeginInvoke(new Action(() => {
                sim = new SimForm(form.Registry, app, true);
                sim.DiagnosticMessage += text => File.AppendAllText(output + ".live.log", DateTime.Now.ToString("HH:mm:ss") + " " + text + Environment.NewLine);
                timer.Start(); sim.ShowDialog(form);
            }));
            timer.Tick += (sender, args) => {
                timer.Stop();
                var state = sim.Eval("JSON.stringify({url:location.href,ready:window.__kaiosGeckoReady,mode:window.__kaiosMode&&window.__kaiosMode.mode,errors:window.__kaiosBootErrors,body:document.body.innerText||document.body.textContent,frames:Array.prototype.map.call(document.querySelectorAll('iframe'),function(f){return {src:f.src,hidden:f.className};}),scripts:Array.prototype.map.call(document.scripts,function(s){return s.src;})})");
                File.WriteAllText(output + ".log", sim.DiagnosticLog);
                File.WriteAllText(output, new JObject { ["mode"] = mode, ["state"] = state, ["log"] = sim.DiagnosticLog }.ToString());
                sim.Close(); sim.Dispose(); form.Close();
            };
            try { Application.Run(form); } finally { timer.Dispose(); form.Dispose(); }
        }
        static void TestInstall(AppRegistry registry, string folder)
        {
            var zipPath = Path.Combine(registry.DataRoot, "test.zip"); ZipFile.CreateFromDirectory(folder, zipPath);
            var first = registry.Import(zipPath); string sd = Path.Combine(registry.Storage(first.Id), "sdcard", "keep.txt"); File.WriteAllText(sd, "keep");
            var second = registry.Import(zipPath);
            if (first.Id != second.Id || registry.List().Length != 1 || File.ReadAllText(sd) != "keep") throw new Exception("Update must retain identity and storage");
            var bad = Path.Combine(registry.DataRoot, "bad.zip");
            using (var archive = ZipFile.Open(bad, ZipArchiveMode.Create)) { var entry = archive.CreateEntry("../outside.txt"); using (var w = new StreamWriter(entry.Open())) w.Write("bad"); }
            bool rejected = false; try { registry.Import(bad); } catch (InvalidDataException) { rejected = true; }
            if (!rejected || !File.Exists(Path.Combine(second.Root, "index.html"))) throw new Exception("Bad package damaged existing install");
            File.Delete(bad); File.Delete(zipPath);
        }
    }
}
