using Gecko;
using Newtonsoft.Json.Linq;
using System;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Windows.Forms;

namespace KaiosSim
{
    public sealed class Form1 : Form
    {
        readonly AppRegistry registry;
        readonly ListView library = new ListView();
        readonly TextBox search = new TextBox();
        readonly Label status = new Label();
        readonly Label empty = new Label();
        readonly ImageList icons = new ImageList();
        readonly ComboBox mode = new ComboBox();
        public AppRegistry Registry { get { return registry; } }
        public Form1(string testDataRoot = null)
        {
            Text = "Like a KaiOS Simulator"; Font = new Font("Microsoft YaHei UI", 9F); AutoScaleMode = AutoScaleMode.Dpi;
            BackColor = Color.FromArgb(246, 247, 251); ClientSize = new Size(900, 620); MinimumSize = new Size(760, 480); StartPosition = FormStartPosition.CenterScreen;
            var data = Path.Combine(Application.StartupPath, "data", "simulator");
            try { Directory.CreateDirectory(data); File.WriteAllText(Path.Combine(data, ".write-test"), ""); File.Delete(Path.Combine(data, ".write-test")); }
            catch { data = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "LikeAKaiosSimulator"); }
            if (testDataRoot != null) data = testDataRoot;
            registry = new AppRegistry(data);
            var profile = Path.Combine(data, "gecko-profile"); Directory.CreateDirectory(profile);
            Xpcom.ProfileDirectory = profile;
            Xpcom.Initialize(Path.Combine(Application.StartupPath, "Firefox"));
            GeckoPreferences.User["browser.cache.disk.enable"] = false;
            GeckoPreferences.User["browser.cache.memory.enable"] = false;
            GeckoPreferences.User["media.autoplay.enabled"] = true;
            BuildUi();
            registry.ImportHistory(Path.Combine(Application.StartupPath, "config.json"), message => status.Text = message);
            RefreshLibrary(); AllowDrop = true;
            DragEnter += (s, e) => { if (e.Data.GetDataPresent(DataFormats.FileDrop)) e.Effect = DragDropEffects.Copy; };
            DragDrop += (s, e) => { foreach (var path in (string[])e.Data.GetData(DataFormats.FileDrop)) Import(path, false); };
        }
        void BuildUi()
        {
            var rail = new Panel { Dock = DockStyle.Left, Width = 214, BackColor = Color.FromArgb(25, 31, 51), Padding = new Padding(22) };
            rail.Controls.Add(new Label { Text = "LIKE A\nKaiOS", Font = new Font(Font.FontFamily, 25, FontStyle.Bold), ForeColor = Color.White, Location = new Point(22, 32), Size = new Size(178, 95) });
            rail.Controls.Add(new Label { Text = "应用实验室\n\nGecko 45 原生内核\nKE 兼容 API 补齐", ForeColor = Color.FromArgb(180, 188, 210), Location = new Point(24, 152), Size = new Size(170, 100) });
            var open = MakeButton("＋  导入应用", OpenFile, true); open.SetBounds(22, 280, 170, 40); rail.Controls.Add(open);
            var folder = MakeButton("打开应用目录", OpenFolder); folder.SetBounds(22, 332, 170, 36); rail.Controls.Add(folder);
            rail.Controls.Add(new Label { Text = "支持 ZIP / manifest / HTML\n也可直接拖入窗口\n\nF1 / F2 软键 · 方向键移动\nEnter 确认 · Esc 返回", ForeColor = Color.FromArgb(165, 175, 198), Dock = DockStyle.Bottom, Height = 120 }); Controls.Add(rail);
            var body = new Panel { Dock = DockStyle.Fill, Padding = new Padding(28) }; Controls.Add(body); body.BringToFront();
            var header = new Panel { Dock = DockStyle.Top, Height = 108 };
            header.Controls.Add(new Label { Text = "我的应用", Font = new Font(Font.FontFamily, 22, FontStyle.Bold), AutoSize = true });
            header.Controls.Add(new Label { Text = "选择应用开始调试，安装记录和数据自动保存。", AutoSize = true, ForeColor = Color.DimGray, Location = new Point(2, 45) });
            search.SetBounds(0, 77, 270, 28); search.TextChanged += (s, e) => RefreshLibrary(); search.AccessibleName = "搜索应用"; header.Controls.Add(search);
            mode.DropDownStyle = ComboBoxStyle.DropDownList; mode.Items.AddRange(new object[] { "KaiOS 2.5", "KaiOS 3.x / 4.x" });
            mode.SelectedIndex = (string)registry.Settings()["apiMode"] == "new" ? 1 : 0; mode.SetBounds(290, 77, 190, 28);
            mode.SelectedIndexChanged += (s, e) => { registry.SetSettings(new JObject { ["apiMode"] = mode.SelectedIndex == 1 ? "new" : "legacy" }); RefreshLibrary(); }; header.Controls.Add(mode); body.Controls.Add(header);
            var footer = new FlowLayoutPanel { Dock = DockStyle.Bottom, Height = 48, Padding = new Padding(0, 8, 0, 0) };
            footer.Controls.Add(MakeButton("启动应用", LaunchSelected, true)); footer.Controls.Add(MakeButton("打开 SD 卡", () => { if (Selected != null) System.Diagnostics.Process.Start(registry.Storage(Selected.Id)); })); footer.Controls.Add(MakeButton("移除记录", RemoveSelected)); body.Controls.Add(footer);
            status.Dock = DockStyle.Bottom; status.Height = 28; status.ForeColor = Color.DimGray; body.Controls.Add(status);
            var content = new Panel { Dock = DockStyle.Fill, Padding = new Padding(0, 16, 0, 10) }; body.Controls.Add(content); content.BringToFront();
            library.Dock = DockStyle.Fill; library.View = View.Details; library.FullRowSelect = true; library.MultiSelect = false; library.HideSelection = false; library.BorderStyle = BorderStyle.None; library.HeaderStyle = ColumnHeaderStyle.Nonclickable;
            library.Columns.Add("应用", 230); library.Columns.Add("版本", 80); library.Columns.Add("最近运行", 130);
            icons.ImageSize = new Size(40, 40); icons.ColorDepth = ColorDepth.Depth32Bit; library.SmallImageList = icons;
            library.DoubleClick += (s, e) => LaunchSelected(); library.KeyDown += (s, e) => { if (e.KeyCode == Keys.Enter) { LaunchSelected(); e.Handled = true; } }; content.Controls.Add(library);
            empty.Text = "还没有应用\n\n点击「导入应用」，或把应用包拖到这里。"; empty.TextAlign = ContentAlignment.MiddleCenter; empty.Dock = DockStyle.Fill; empty.ForeColor = Color.DimGray; content.Controls.Add(empty);
        }
        public static Button MakeButton(string text, Action click, bool primary = false)
        {
            var b = new Button { Text = text, Width = 112, Height = 32, FlatStyle = FlatStyle.Flat, BackColor = primary ? Color.FromArgb(100, 64, 195) : Color.White, ForeColor = primary ? Color.White : Color.FromArgb(43, 48, 65), Cursor = Cursors.Hand, Margin = new Padding(0, 0, 8, 0) };
            b.FlatAppearance.BorderColor = primary ? b.BackColor : Color.FromArgb(217, 221, 231); b.Click += (s, e) => click(); return b;
        }
        void OpenFile() { using (var d = new OpenFileDialog { Title = "导入 KaiOS 应用", Filter = "KaiOS 应用|*.zip;*.webapp;*.webmanifest;*.json;*.html;*.htm|所有文件|*.*", Multiselect = true }) if (d.ShowDialog(this) == DialogResult.OK) foreach (var file in d.FileNames) Import(file, false); }
        void OpenFolder() { using (var d = new FolderBrowserDialog { Description = "选择包含 manifest 或 index.html 的目录" }) if (d.ShowDialog(this) == DialogResult.OK) Import(d.SelectedPath, false); }
        public void Import(string path, bool launch)
        {
            try { UseWaitCursor = true; var record = registry.Import(path); RefreshLibrary(); status.Text = "已导入：" + record.Name; if (launch) Launch(record); }
            catch (Exception e) { MessageBox.Show(this, e.Message, "导入失败", MessageBoxButtons.OK, MessageBoxIcon.Warning); }
            finally { UseWaitCursor = false; }
        }
        AppRecord Selected { get { return library.SelectedItems.Count == 0 ? null : (AppRecord)library.SelectedItems[0].Tag; } }
        void LaunchSelected() { if (Selected != null) Launch(Selected); else status.Text = "请先选中一个应用。"; }
        public void Launch(AppRecord record)
        {
            try { AppRecord next = record; while (next != null) { next.LastRun = DateTime.Now; registry.Save(next); using (var sim = new SimForm(registry, next)) { sim.ShowDialog(this); next = sim.NextApp; } } }
            catch (Exception e) { MessageBox.Show(this, e.Message, "启动失败", MessageBoxButtons.OK, MessageBoxIcon.Error); }
            RefreshLibrary();
        }
        void RemoveSelected()
        {
            var rec = Selected; if (rec == null) return;
            if (MessageBox.Show(this, "移除「" + rec.Name + "」？ZIP 安装副本会删除，原始文件和 SD 卡数据会保留。", "移除应用", MessageBoxButtons.OKCancel, MessageBoxIcon.Question) != DialogResult.OK) return;
            try { registry.Remove(rec.Id); RefreshLibrary(); } catch (Exception e) { status.Text = e.Message; }
        }
        public void RefreshLibrary()
        {
            string selected = Selected == null ? null : Selected.Id; library.BeginUpdate(); library.Items.Clear(); icons.Images.Clear();
            var records = registry.List().Where(a => String.IsNullOrEmpty(search.Text) || a.Name.IndexOf(search.Text, StringComparison.CurrentCultureIgnoreCase) >= 0).ToArray();
            foreach (var app in records) { using (var image = AppIcon(app)) icons.Images.Add(app.Id, image); var item = new ListViewItem(app.Name, app.Id) { Tag = app }; item.SubItems.Add((string)(app.Manifest["version"] ?? app.Manifest.SelectToken("b2g_features.version")) ?? "—"); item.SubItems.Add(app.LastRun == default(DateTime) ? "尚未运行" : app.LastRun.ToString("MM-dd HH:mm")); library.Items.Add(item); if (app.Id == selected) item.Selected = true; }
            library.EndUpdate(); empty.Visible = records.Length == 0; if (empty.Visible) empty.BringToFront(); status.Text = registry.List().Length + " 个应用  ·  Gecko 45  ·  " + (mode.SelectedIndex == 1 ? "API 3.0" : "API 2.0");
        }
        static Image AppIcon(AppRecord app)
        {
            try { var list = app.Manifest["icons"]; string rel = list is JArray ? (string)list.Last["src"] : list is JObject ? (string)((JObject)list).Properties().Last().Value : null; if (rel != null) using (var source = Image.FromFile(AppRegistry.SafePath(app.Root, rel.TrimStart('/')))) return new Bitmap(source); } catch { }
            var image = new Bitmap(40, 40); using (var g = Graphics.FromImage(image)) { g.Clear(Color.FromArgb(237, 231, 250)); using (var font = new Font("Segoe UI", 18, FontStyle.Bold)) using (var brush = new SolidBrush(Color.FromArgb(100, 64, 195))) g.DrawString(String.IsNullOrEmpty(app.Name) ? "?" : app.Name.Substring(0, 1).ToUpper(), font, brush, 6, 5); } return image;
        }
        protected override void Dispose(bool disposing) { if (disposing) icons.Dispose(); base.Dispose(disposing); }
    }
}
