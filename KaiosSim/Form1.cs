using Gecko;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using TouchSocket.Core;
using TouchSocket.Http;
using TouchSocket.Sockets;

namespace KaiosSim
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            string path = Path.Combine(Application.StartupPath, "data");
            if (!Directory.Exists(path))
            {
                try
                {
                    Directory.CreateDirectory(path);
                }
                catch { }
            }
            Xpcom.ProfileDirectory = path;

            Xpcom.Initialize("Firefox");

            GeckoPreferences.User["security.fileuri.strict_origin_policy"] = false;

            GeckoPreferences.User["network.http.use-cache"] = false;

            GeckoPreferences.User["browser.cache.disk.enable"] = false;

            GeckoPreferences.User["browser.cache.check_doc_frequency"] = 1;

            GeckoPreferences.User["browser.cache.memory.enable"] = false;


            this.Load += Form1_Load;
            ////Gecko.GeckoPreferences.User["security.fileuri.strict_origin_policy"] = false;
            //Gecko.GeckoPreferences.User.SetBoolPref("security.fileuri.strict_origin_policy", false);
            //Gecko.GeckoPreferences.User.SetLocked("security.fileuri.strict_origin_policy", true);
            ////Gecko.GeckoPreferences.Default["security.fileuri.strict_origin_policy"] = false;
            //Gecko.GeckoPreferences.Default.SetBoolPref("security.fileuri.strict_origin_policy", false);
            //bool? o = false;
            //var t = Gecko.GeckoPreferences.Default.GetBoolPref("security.fileuri.strict_origin_policy", out o);
            //Gecko.GeckoPreferences.Default.SetLocked("security.fileuri.strict_origin_policy", true);
        }

        HttpService service;
        HttpStaticPagePlugin plug;

        public static int Port = 7989;
        public static string baseUrl = "";
        private void Form1_Load(object sender, EventArgs e)
        {
            loadHistory();
            bool success = false;
            for (int i = 0; i < 10; i++)
            {
                try
                {
                    service = new HttpService();
                    var config = new TouchSocketConfig();
                    config.UsePlugin()
                        .SetReceiveType(ReceiveType.Auto)
                        .SetListenIPHosts(new IPHost[] { new IPHost("127.0.0.1:" + Port) });
                    baseUrl = "http://127.0.0.1:" + Port;
                    service.Setup(config).Start();
                    success = true;
                    break;
                }
                catch (Exception ex)
                {
                    Port++;
                }
            }
            if (success == false)
            {
                MessageBox.Show("什么狗屁电脑，一个端口都不能用！");
                return;
            }
            //service.AddPlugin<MyHttpPlug>();//添加自定义插件。
            plug = service.AddPlugin<HttpStaticPagePlugin>();

            //AddFolder("./");//添加静态页面文件夹

            Console.WriteLine("Http服务器已启动");

        }

        private void loadHistory()
        {
            try
            {
                if (!File.Exists("config.json"))
                {
                    return;
                }
                var str = File.ReadAllText("config.json");
                JArray jobj = JArray.Parse(str);

                foreach (var job in jobj)
                {
                    try
                    {
                        string key = job.ToString();
                        addToPanel(key);
                    }
                    catch (Exception ex)
                    {

                        Console.WriteLine(ex.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        private void addToPanel(string key, bool first = false)
        {
            if (!File.Exists(key))
            {
                Console.WriteLine(key + " 不存在！");
                return;
            }
            ListViewItem item = new ListViewItem();


            item.Tag = key;
            var path = Path.GetDirectoryName(key);
            var kaios25main = Path.Combine(path, "manifest.webapp");
            string iconppath = Path.Combine(path, "icon.png");

            if (!File.Exists(kaios25main))
            {
                kaios25main = Path.Combine(path, "appmanifest.json");
                if (!File.Exists(kaios25main))
                {
                    Console.WriteLine(kaios25main + " 不存在！");
                }
            }

            var mainfest = File.ReadAllText(kaios25main);
            JObject mainobj = JObject.Parse(mainfest);
            var name = mainobj["name"].ToString();
            string icon;
            if (kaios25main.EndsWith("appmanifest.json"))
            {
                icon = ((JObject)mainobj["icons"].LastOrDefault())["src"].ToString().Replace("/", "\\");
            }
            else
            {
                icon = mainobj["icons"]["128"].ToString().Replace("/", "\\");
            }
            iconppath = path + "\\" + icon;

            byte[] bytescion = File.ReadAllBytes(iconppath);
            Image img = Image.FromStream(new MemoryStream(bytescion));
            item.Text = name;
            if (listView1.LargeImageList == null)
            {
                listView1.LargeImageList = new ImageList();
                listView1.LargeImageList.ImageSize = new Size(64, 64);
            }

            listView1.LargeImageList.Images.Add(iconppath, img);
            item.ImageIndex = listView1.LargeImageList.Images.Count - 1;
            if (first)
            {

                listView1.Items.Insert(0, item);
            }
            else
            {

                listView1.Items.Add(item);
            }
        }

        private void saveHistory(string key)
        {
            try
            {
                string str = "[]";
                if (File.Exists("config.json"))
                {
                    str = File.ReadAllText("config.json");
                }
                JArray jobj = JArray.Parse(str);
                jobj.Insert(0, key);
                File.WriteAllText("config.json", jobj.ToString(Newtonsoft.Json.Formatting.None));
                addToPanel(key, true);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
        private void removeHistory(string key)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            OpenFileDialog dialog = new OpenFileDialog();
            dialog.Multiselect = false;//该值确定是否可以选择多个文件
            dialog.Title = "请选择文件";
            dialog.Filter = "网页文件(*.html)|*.html";
            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                string file = dialog.FileName;
                saveHistory(file);
                //string url = "file:///" + file.Replace("\\", "/");
                var path = System.IO.Path.GetDirectoryName(file);//+ launch_path;
                var launch_path = System.IO.Path.GetFileName(file);
                launch_path = baseUrl + "/" + launch_path;
                plug.ClearFolder();
                plug.AddFolder(path);
                SimForm simForm = new SimForm(launch_path, true);
                simForm.Owner = this;
                simForm.ShowDialog();
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            OpenFileDialog dialog = new OpenFileDialog();
            dialog.Multiselect = false;//该值确定是否可以选择多个文件
            dialog.Title = "请选择文件";
            dialog.Filter = "KAIOS应用描述文件|appmanifest.json;*.webapp|KAIOS2.5应用描述文件(*.webapp)|*.webapp|KAIOS3应用描述文件(appmanifest.json)|appmanifest.json";
            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                try
                {
                    string file = dialog.FileName;
                    var data = System.IO.File.ReadAllText(file);
                    var jsondata = JObject.Parse(data);

                    var launch_path = jsondata["launch_path"]?.ToString() ?? jsondata["start_url"]?.ToString();

                    if (!launch_path.StartsWith("/"))
                    {
                        launch_path = "/" + launch_path;
                    }
                    bool fullscreen = jsondata["fullscreen"] != null ? jsondata["fullscreen"]?.ToString()?.ToLower() == "true" : jsondata["display"]?.ToString() == "fullscreen";

                    var path = System.IO.Path.GetDirectoryName(file);//+ launch_path;
                    saveHistory(Path.Combine(path, file));
                    plug.ClearFolder();
                    plug.AddFolder(path);
                    launch_path = baseUrl + launch_path;
                    // string url = "file:///" + path.Replace("\\", "/");
                    SimForm simForm = new SimForm(launch_path, fullscreen);
                    simForm.Owner = this;
                    simForm.ShowDialog();
                }
                catch (Exception ex)
                {
                    MessageBox.Show("出错：" + ex.ToString());
                }
            }
        }

        private void listView1_DoubleClick(object sender, EventArgs e)
        {
            var item = listView1.SelectedItems[0];
            if (item != null)
            {
                var file = item.Tag.ToString();
                var path = System.IO.Path.GetDirectoryName(file);//+ launch_path;
                plug.ClearFolder();
                plug.AddFolder(path);
                string mainpath = path + "/" + "manifest.webapp";
                if (!File.Exists(mainpath))
                {
                    mainpath = path + "/" + "appmanifest.json";
                }
                var data = System.IO.File.ReadAllText(mainpath);
                var jsondata = JObject.Parse(data);
                bool fullscreen = jsondata["fullscreen"] != null ? jsondata["fullscreen"]?.ToString()?.ToLower() == "true" : jsondata["display"]?.ToString() == "fullscreen";
                var launch_path = jsondata["launch_path"]?.ToString() ?? jsondata["start_url"]?.ToString();
                if (!launch_path.StartsWith("/"))
                {
                    launch_path = "/" + launch_path;
                }
                launch_path = baseUrl + launch_path;
                // string url = "file:///" + path.Replace("\\", "/");
                SimForm simForm = new SimForm(launch_path, fullscreen);
                simForm.Owner = this;
                simForm.ShowDialog();
            }
        }
    }
}
