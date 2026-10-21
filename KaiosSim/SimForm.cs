using Gecko;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

namespace KaiosSim
{
    public sealed class SimForm : Form
    {
        readonly AppRegistry registry;
        readonly AppRecord app;
        readonly GeckoWebBrowser browser = new GeckoWebBrowser();
        readonly Panel stage = new Panel(), screen = new Panel();
        readonly Label deviceStatus = new Label();
        readonly Label bottom = new Label();
        readonly TextBox console = new TextBox();
        readonly Timer clock = new Timer();
        readonly BridgeHost host;
        readonly BridgeServer server;
        readonly FlowLayoutPanel toolbar = new FlowLayoutPanel();
        readonly Panel keypad = new Panel();
        int width = 240, height = 320;
        float zoom = 1.5F;
        bool windowFullscreen, closing;
        string lastLog;
        ResponseObserver observer;
        DocumentBootstrapObserver documentObserver;
        public AppRecord NextApp { get; private set; }
        public GeckoWebBrowser Browser { get { return browser; } }
        public string Origin { get { return server.Origin; } }
        public event Action<string, JToken> HostMessage;
        public event Action<string> DiagnosticMessage;
        public SimForm(AppRegistry registry, AppRecord app, bool diagnostics = false)
        {
            this.registry = registry; this.app = app;
            Text = app.Name + " · Gecko 45"; Font = new Font("Microsoft YaHei UI", 9F); AutoScaleMode = AutoScaleMode.None;
            ClientSize = new Size(770, 660); MinimumSize = new Size(600, 500); StartPosition = FormStartPosition.CenterParent; BackColor = Color.FromArgb(242, 244, 249); KeyPreview = true;
            host = new BridgeHost(registry, app);
            host.Command = (name, value) => { try { if (!closing && IsHandleCreated) BeginInvoke(new Action(() => HostCommand(name, value))); } catch (InvalidOperationException) { } };
            host.Interaction = (name, value) => Invoke(new Func<object>(() => Interact(name, value)));
            server = new BridgeServer(host, app.Port); server.Diagnostics = diagnostics; app.Port = server.Port; registry.Save(app);
            GeckoPreferences.User["general.useragent.override"] = (string)host.Mode()["ua"];
            BuildUi();
            browser.ConsoleMessage += (s, e) => Log(e.Message);
            browser.DOMContentLoaded += (s, e) => { bottom.Text = "运行中  ·  " + width + " × " + height + "  ·  Gecko 45"; LayoutScreen(); browser.Focus(); };
            browser.DocumentCompleted += (s, e) => { bottom.Text = "运行中  ·  " + width + " × " + height + "  ·  Gecko 45"; LayoutScreen(); };
            browser.Navigated += (s, e) => bottom.Text = "正在加载…";
            observer = new ResponseObserver(server.Origin); ObserverService.AddObserver(observer);
            documentObserver = new DocumentBootstrapObserver(server, Log);
            Shown += (s, e) => BeginInvoke(new Action(() => { if (!closing) { LayoutScreen(); browser.Navigate(server.Origin + app.StartUrl); } }));
            Resize += (s, e) => LayoutScreen();
            clock.Interval = 1000; clock.Tick += (s, e) => UpdateClock(); clock.Start(); UpdateClock();
            KeyDown += (s, e) => { if (e.KeyCode == Keys.F5) { browser.Reload(); e.Handled = true; } else if (e.KeyCode == Keys.F12) { ToggleConsole(); e.Handled = true; } };
        }
        void BuildUi()
        {
            toolbar.Dock = DockStyle.Top; toolbar.Height = 52; toolbar.Padding = new Padding(12, 10, 0, 0); toolbar.BackColor = Color.White;
            toolbar.Controls.Add(Form1.MakeButton("返回应用库", Close));
            toolbar.Controls.Add(Form1.MakeButton("刷新 F5", () => browser.Reload()));
            toolbar.Controls.Add(Form1.MakeButton("旋转", () => { int w = width; width = height; height = w; LayoutScreen(); Eval("window.dispatchEvent(new Event('orientationchange')); window.dispatchEvent(new Event('resize'));"); }));
            toolbar.Controls.Add(Form1.MakeButton("分辨率", () => { using (var d = new SelectFBL(width, height)) if (d.ShowDialog(this) == DialogResult.OK) { width = d.outwidth; height = d.outheight; LayoutScreen(); } }));
            var scales = new ComboBox { Width = 85, DropDownStyle = ComboBoxStyle.DropDownList }; scales.Items.AddRange(new object[] { "100%", "150%", "200%" }); scales.SelectedIndex = 1; scales.SelectedIndexChanged += (s, e) => { zoom = scales.SelectedIndex == 0 ? 1 : scales.SelectedIndex == 1 ? 1.5F : 2; LayoutScreen(); }; toolbar.Controls.Add(scales);
            toolbar.Controls.Add(Form1.MakeButton("日志 F12", ToggleConsole)); Controls.Add(toolbar);
            toolbar.WrapContents = false;
            foreach (Control control in toolbar.Controls) control.Width = control is ComboBox ? 70 : 76;
            toolbar.Controls[0].Width = 92;
            bottom.Click += (s, e) => ActivateNotification();
            bottom.Dock = DockStyle.Bottom; bottom.Height = 30; bottom.Padding = new Padding(12, 7, 0, 0); bottom.BackColor = Color.White; bottom.ForeColor = Color.DimGray; Controls.Add(bottom);
            console.Multiline = true; console.ReadOnly = true; console.ScrollBars = ScrollBars.Vertical; console.Dock = DockStyle.Bottom; console.Height = 140; console.Visible = false; console.Font = new Font("Consolas", 9); console.BackColor = Color.FromArgb(25, 31, 51); console.ForeColor = Color.FromArgb(205, 217, 238); Controls.Add(console);
            keypad.Dock = DockStyle.Right; keypad.Width = 214; keypad.Padding = new Padding(14); keypad.BackColor = Color.FromArgb(231, 234, 243); Controls.Add(keypad);
            keypad.Controls.Add(new Label { Text = "虚拟按键", Location = new Point(18, 18), AutoSize = true, Font = new Font(Font, FontStyle.Bold) });
            var keys = new[] { "SoftLeft", "ArrowUp", "SoftRight", "ArrowLeft", "Enter", "ArrowRight", "Back", "ArrowDown", "Exit", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#" };
            var names = new[] { "左软键", "↑", "右软键", "←", "OK", "→", "返回", "↓", "挂断", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#" };
            for (int i = 0; i < keys.Length; i++) { string key = keys[i]; var b = Form1.MakeButton(names[i], () => SendKey(key), key == "Enter"); b.TabStop = false; b.SetBounds(16 + i % 3 * 61, 55 + i / 3 * 49, 56, 42); keypad.Controls.Add(b); }
            var minus = Form1.MakeButton("音量 −", () => SendKey("VolumeDown")); minus.SetBounds(16, 410, 84, 32); keypad.Controls.Add(minus);
            var plus = Form1.MakeButton("音量 ＋", () => SendKey("VolumeUp")); plus.SetBounds(108, 410, 84, 32); keypad.Controls.Add(plus);
            keypad.Controls.Add(new Label { Text = "F1 / F2 软键\nEsc 返回 · 挂断关闭应用\n文本框内 Backspace 正常删除", Location = new Point(18, 460), Size = new Size(186, 70), ForeColor = Color.DimGray });
            stage.Dock = DockStyle.Fill; Controls.Add(stage); stage.BringToFront(); stage.Controls.Add(screen); screen.BackColor = Color.Black;
            browser.NoDefaultContextMenu = true; screen.Controls.Add(browser);
            deviceStatus.TextAlign = ContentAlignment.MiddleRight; deviceStatus.Padding = new Padding(5, 0, 5, 0); deviceStatus.Font = new Font("Segoe UI", 9, FontStyle.Bold);
            try { deviceStatus.BackColor = ColorTranslator.FromHtml(app.Theme); } catch { deviceStatus.BackColor = Color.FromArgb(75, 46, 131); }
            deviceStatus.ForeColor = deviceStatus.BackColor.GetBrightness() > 0.65 ? Color.Black : Color.White; screen.Controls.Add(deviceStatus); deviceStatus.BringToFront();
        }
        void LayoutScreen()
        {
            if (closing || stage.ClientSize.Width < 10) return;
            var effective = Math.Max(0.25F, Math.Min(zoom, Math.Min((stage.ClientSize.Width - 32F) / width, (stage.ClientSize.Height - 32F) / height)));
            int w = (int)Math.Round(width * effective), h = (int)Math.Round(height * effective);
            screen.SetBounds((stage.ClientSize.Width - w) / 2, (stage.ClientSize.Height - h) / 2, w, h);
            bool visible = !app.Fullscreen && !windowFullscreen; deviceStatus.Visible = visible;
            int bar = visible ? (int)Math.Round(20 * effective) : 0; deviceStatus.SetBounds(0, 0, w, bar);
            int offset = visible && !app.Overlap ? bar : 0; browser.SetBounds(0, offset, w, h - offset);
            try { browser.GetDocShellAttribute().GetContentViewerAttribute().SetFullZoomAttribute(effective); } catch { }
        }
        void UpdateClock()
        {
            var battery = SystemInformation.PowerStatus; deviceStatus.Text = "▂▄▆  Wi-Fi   " + (battery.BatteryLifePercent < 0 ? "100" : Math.Round(battery.BatteryLifePercent * 100).ToString()) + "%   " + DateTime.Now.ToString("HH:mm");
            host.Emit("kaios:battery", new { level = battery.BatteryLifePercent < 0 ? 1 : battery.BatteryLifePercent, charging = battery.PowerLineStatus != PowerLineStatus.Offline });
        }
        public string Eval(string script, bool focusedFrame = false)
        {
            try
            {
                var document = browser.Document;
                if (focusedFrame)
                {
                    for (int depth = 0; depth < 16; depth++)
                    {
                        var frame = document.ActiveElement as Gecko.DOM.GeckoIFrameElement;
                        if (frame == null || frame.ContentWindow == null) break;
                        var child = frame.ContentWindow.Document as GeckoDocument;
                        if (child == null) break;
                        document = child;
                    }
                }
                var root = document.DocumentElement;
                var node = document.CreateElement("script");
                node.TextContent = "try { document.documentElement.setAttribute('data-kaios-eval', String((0,eval)(" + JsonConvert.SerializeObject(script) + "))); } catch(e) { document.documentElement.setAttribute('data-kaios-eval', 'EvalError: '+String(e)); }";
                root.AppendChild(node); var result = root.GetAttribute("data-kaios-eval"); root.RemoveChild(node); root.RemoveAttribute("data-kaios-eval"); return result;
            }
            catch (Exception e) { Log("脚本调用：" + e.Message); return null; }
        }
        public void SendKey(string key)
        {
            if (key == "Exit") { Close(); return; }
            if (key == "Back")
            {
                if (Eval("String(typeof __kaiosTap === 'function' && __kaiosTap('EndCall'))", true) == "true") return;
                if (browser.CanGoBack) browser.GoBack(); else Close(); return;
            }
            if (key == "VolumeUp" || key == "VolumeDown") { host.Call(key == "VolumeUp" ? "volume:up" : "volume:down", null, "native-ui"); }
            Eval("typeof __kaiosTap === 'function' && __kaiosTap(" + JsonConvert.SerializeObject(key) + ")", true);
        }
        void HostCommand(string name, JToken value)
        {
            if (closing) return;
            switch (name)
            {
                case "shell:log": Log((string)value["text"]); break;
                case "bridge:ready": bottom.Text = "API 已就绪  ·  " + (string)value["mode"] + "  ·  Gecko 45"; break;
                case "kaios-app-close": Close(); break;
                case "apps:launch": NextApp = registry.Find((string)value); if (NextApp != null) Close(); break;
                case "shell:kaios-key": SendKey((string)value["key"]); break;
                case "kaios:fullscreen": windowFullscreen = (bool?)value["on"] == true; LayoutScreen(); break;
                case "kaios:battery:request": UpdateClock(); break;
                case "notify": bottom.Tag = value; bottom.Cursor = Cursors.Hand; bottom.Text = (string)value["title"] + "  " + (string)value["body"]; Log(bottom.Text); break;
                case "volume": bottom.Text = "音量 " + Math.Round((double)value * 100) + "%"; Eval("Array.prototype.forEach.call(document.querySelectorAll('audio,video'),function(m){m.volume=" + ((double)value).ToString(System.Globalization.CultureInfo.InvariantCulture) + "})"); break;
            }
            if (HostMessage != null) HostMessage(name, value);
        }
        public void ActivateNotification()
        {
            var notification = bottom.Tag as JToken; if (notification == null) return;
            host.Emit("kaios-notif-click", new { tag = (string)notification["tag"] }); bottom.Tag = null; bottom.Cursor = Cursors.Default;
        }
        object Interact(string name, JToken value)
        {
            if (name == "share") { var text = (string)(value["text"] ?? value["url"]); if (!String.IsNullOrEmpty(text)) Clipboard.SetText(text); return true; }
            using (var dialog = new OpenFileDialog { Title = "选择文件", Filter = "所有文件|*.*" })
            {
                if (dialog.ShowDialog(this) != DialogResult.OK) return new { canceled = true };
                var bytes = File.ReadAllBytes(dialog.FileName); return new { base64 = Convert.ToBase64String(bytes), name = Path.GetFileName(dialog.FileName), type = BridgeServer.Mime(dialog.FileName), size = bytes.Length };
            }
        }
        void ToggleConsole() { console.Visible = !console.Visible; LayoutScreen(); }
        public void Log(string text) { if (String.IsNullOrEmpty(text) || text == lastLog) return; lastLog = text; if (text.Contains("[JavaScript Warning:") && (text.Contains("Declaration dropped") || text.Contains("Loading mixed (insecure) active content"))) return; if (DiagnosticMessage != null) DiagnosticMessage(text); if (console.TextLength > 120000) console.Text = console.Text.Substring(console.TextLength - 60000); console.AppendText(DateTime.Now.ToString("HH:mm:ss") + " " + text + Environment.NewLine); }
        public string DiagnosticLog { get { return console.Text; } }
        protected override void Dispose(bool disposing)
        {
            if (disposing && !closing) { closing = true; clock.Stop(); clock.Dispose(); if (observer != null) { ObserverService.RemoveObserver(observer); observer = null; } if (documentObserver != null) { documentObserver.Dispose(); documentObserver = null; } browser.Dispose(); server.Dispose(); }
            base.Dispose(disposing);
        }
    }
}
