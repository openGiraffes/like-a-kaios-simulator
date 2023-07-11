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
            Xpcom.Initialize("Firefox");
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

        private void button1_Click(object sender, EventArgs e)
        {
            OpenFileDialog dialog = new OpenFileDialog();
            dialog.Multiselect = false;//该值确定是否可以选择多个文件
            dialog.Title = "请选择文件";
            dialog.Filter = "网页文件(*.html)|*.html";
            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                string file = dialog.FileName;
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
            dialog.Filter = "KAIOS应用描述文件(*.webapp)|*.webapp";
            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                try
                {
                    string file = dialog.FileName;
                    var data = System.IO.File.ReadAllText(file);
                    var jsondata = JObject.Parse(data);
                    var launch_path = jsondata["launch_path"].ToString();
                    if (!launch_path.StartsWith("/"))
                    {
                        launch_path = "/" + launch_path;
                    }
                    bool fullscreen = jsondata["fullscreen"]?.ToString()?.ToLower() == "true";

                    var path = System.IO.Path.GetDirectoryName(file);//+ launch_path;

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
    }
}
