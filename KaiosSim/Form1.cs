using Gecko;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace KaiosSim
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            Xpcom.Initialize("Firefox");
            ////Gecko.GeckoPreferences.User["security.fileuri.strict_origin_policy"] = false;
            //Gecko.GeckoPreferences.User.SetBoolPref("security.fileuri.strict_origin_policy", false);
            //Gecko.GeckoPreferences.User.SetLocked("security.fileuri.strict_origin_policy",true);
            ////Gecko.GeckoPreferences.Default["security.fileuri.strict_origin_policy"] = false;
            //Gecko.GeckoPreferences.Default.SetBoolPref("security.fileuri.strict_origin_policy", false);
            //bool? o = false;
            //var t = Gecko.GeckoPreferences.Default.GetBoolPref("security.fileuri.strict_origin_policy",out o);
            //Gecko.GeckoPreferences.Default.SetLocked("security.fileuri.strict_origin_policy",true);
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
                string url = "file:///" + file.Replace("\\", "/");
                SimForm simForm = new SimForm(url);
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

                    var path = System.IO.Path.GetDirectoryName(file) + launch_path;

                    string url = "file:///" + path.Replace("\\", "/");
                    SimForm simForm = new SimForm(url, fullscreen);
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
