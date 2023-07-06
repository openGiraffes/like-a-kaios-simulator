using Gecko;
using Gecko.Net;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Runtime.Remoting.Contexts;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using static Gecko.ObserverNotifications;
using static System.Windows.Forms.VisualStyles.VisualStyleElement;

namespace KaiosSim
{
    public partial class SimForm : Form
    {
        public string url;
        static SimForm self;

        public static int initwidth = -1;
        public static int initheight = -1;
        public static int initgap = -1;

        bool fullscreen = false;

        public SimForm(string url, bool fullscreen = false)
        {
            InitializeComponent();
            this.fullscreen = fullscreen;
            if (fullscreen)
            {
                pictureBox1.Visible = false;
                label1.Visible = false;
            }
            else
            {
                pictureBox1.Visible = true;
                label1.Parent = pictureBox1;
                label1.Visible = true;

            }
            this.url = url;
            self = this;
            self.browserPanel.Top = 32;
            self.browserPanel.Left = (self.Width - self.browserPanel.Width) / 2 - 3;

            initgap = self.Width - self.browserPanel.Width;

            int formheight = self.browserPanel.Height + initgap + 50 + self.panel_softkey.Height;

            self.Height = formheight;
            this.KeyDown += SimForm_KeyDown;
            this.Load += SimForm_Load;
        }
        GeckoWebBrowser geckoWebBrowser;

        private void SimForm_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.F5)
            {
                geckoWebBrowser.Reload();
            }
            else if (e.KeyCode == Keys.F12)
            {
                //geckoWebBrowser.tool();
            }
        }

        private void SimForm_Load(object sender, EventArgs e)
        {
            GeckoPreferences.User["browser.xul.error_pages.enabled"] = true;

            GeckoPreferences.User["gfx.font_rendering.graphite.enabled"] = true;

            GeckoPreferences.User["full-screen-api.enabled"] = true;

            GeckoPreferences.User["devtools.debugger.remote-enabled"] = true;
            GeckoPreferences.User["devtools.chrome.enabled"] = true;

            GeckoPreferences.User["devtools.debugger.prompt-connection"] = false;


            // ie Xpcom.CreateInstance<nsIComponentRegistrar>(...
            Guid aClass = new Guid("a7139c0e-962c-44b6-bec3-aaaaaaaaaaac");
            var factory = new MyCSharpClassThatContainsXpComJavascriptObjectsFactory();
            Xpcom.ComponentRegistrar.RegisterFactory(ref aClass, "Example C sharp com component", "@geckofx/myclass;1", factory);

            // In order to use Components.classes etc we need to enable certan privileges. 
            GeckoPreferences.User["capability.principal.codebase.p0.granted"] = "UniversalXPConnect";
            GeckoPreferences.User["capability.principal.codebase.p0.id"] = "file://";
            GeckoPreferences.User["capability.principal.codebase.p0.subjectName"] = "";
            GeckoPreferences.User["security.fileuri.strict_origin_policy"] = false;


            string dir = "C:\\Program Files\\Waterfox Classic\\browser";
            var chromeDir = (nsIFile)Xpcom.NewNativeLocalFile(dir);
            var chromeFile = chromeDir.Clone();
            chromeFile.Append(new nsAString("chrome.manifest"));
            Xpcom.ComponentRegistrar.AutoRegister(chromeFile);
            Xpcom.ComponentManager.AddBootstrappedManifestLocation(chromeDir);

            geckoWebBrowser = new GeckoWebBrowser { Dock = DockStyle.Fill };

            //geckoWebBrowser.EnableConsoleMessageNotfication();
            geckoWebBrowser.ConsoleMessage += GeckoWebBrowser_ConsoleMessage;
            geckoWebBrowser.UseHttpActivityObserver = true;
            //geckoWebBrowser.NoDefaultContextMenu = true;
            //geckoWebBrowser.ContextMenuStrip = this.ContextMenuStrip; 
            ResponseObserver MyObs = new ResponseObserver();
            //MyObs.TicketLoadedEvent += MyObs_TicketLoadedEvent;//如何处理捕捉到的response  
            ObserverService.AddObserver(MyObs, "http-on-modify-request", false);//添加观察器
            ObserverService.AddObserver(MyObs, "http-on-examine-response", false);//添加观察器

            browserPanel.Controls.Add(geckoWebBrowser);
            //geckoWebBrowser.Navigate(this.url); 

            //geckoWebBrowser.Navigate("./debugger-server.html");
            geckoWebBrowser.LoadHtml("hi");
            geckoWebBrowser.NavigateFinishedNotifier.BlockUntilNavigationFinished();

            using (Gecko.AutoJSContext js = new Gecko.AutoJSContext(geckoWebBrowser.Window))
            {
                js.EvaluateScript(@" try {
        alert(Components.utils);
        // After firefox 31, AddonManager in geckofx must be started to make remote debugging works.
        Components.utils.import(""resource://gre/modules/AddonManager.jsm"");
        AddonManagerPrivate.startup();

        //Ref https://developer.mozilla.org/en-US/docs/Mozilla/Projects/XULRunner/Debugging_XULRunner_applications
        Components.utils.import('resource://gre/modules/devtools/dbg-server.jsm');
        if (!DebuggerServer.initialized) {
            DebuggerServer.init();
            DebuggerServer.addBrowserActors(null);
        }
        DebuggerServer.openListener(6001);
    } catch (err) {
        alert(err);
    }"
                );

                //js.EvaluateScript("displayDate('tcpgame');");//有参数
                //string result；
                //js.EvaluateScript("displayDate(');", out result);//有返回值
            }

            //chromeBrowser = new ChromiumWebBrowser(url);
            //chromeBrowser.BrowserSettings.FileAccessFromFileUrls = CefState.Enabled;
            //chromeBrowser.BrowserSettings.UniversalAccessFromFileUrls = CefState.Enabled;

            //chromeBrowser.FrameLoadEnd += ChromeBrowser_FrameLoadEnd;
            //chromeBrowser.KeyboardHandler = new KeyBoardHander();
            //chromeBrowser.MenuHandler = new MenuHandler();
            //browserPanel.Controls.Add(chromeBrowser);
            initwidth = this.Width;
            initheight = this.Height;
            justifyKeyboard();
            if (fullscreen == false)
            {
                Task.Run(() =>
                {
                    while (true)
                    {
                        try
                        {
                            label1.Invoke(new Action(() =>
                            {
                                label1.Text = DateTime.Now.ToString("HH:mm");
                            }));
                        }
                        catch (Exception ex)
                        {

                        }

                        Thread.Sleep(1000);
                    }
                });
            }
        }

        private void GeckoWebBrowser_ConsoleMessage(object sender, ConsoleMessageEventArgs e)
        {
            Console.WriteLine(e.Message);
        }

        /// <summary>
        /// 调整键盘 
        /// </summary>
        public static void justifyKeyboard()
        {
            self.panel_softkey.Top = self.browserPanel.Top + self.browserPanel.Height + 20;
            self.panel_softkey.Left = (self.Width - self.panel_softkey.Width) / 2 - 3;
        }

        /// <summary>
        /// 旋转屏幕
        /// </summary>
        public static void xuanzhuan()
        {
            self.Invoke(new Action(() =>
            {
                int width = self.browserPanel.Height;
                int height = self.browserPanel.Width;

                self.browserPanel.Width = width;
                self.browserPanel.Height = height;

                int formwidth = width + initgap;

                self.Width = formwidth;

                int formheight = height + initgap + 50 + self.panel_softkey.Height;

                self.Height = formheight;

                self.browserPanel.Top = 32;
                self.browserPanel.Left = (self.Width - self.browserPanel.Width) / 2 - 3;

                justifyKeyboard();
            }));
        }
        /// <summary>
        /// 切换分辨率
        /// </summary>
        public static void qhfbl()
        {
            self.Invoke(new Action(() =>
            {
                int width = self.browserPanel.Width;
                int height = self.browserPanel.Height;
                SelectFBL selectFBL = new SelectFBL(width, height);
                selectFBL.Owner = self;
                selectFBL.ShowDialog();
                if (selectFBL.DialogResult == DialogResult.OK)
                {
                    self.browserPanel.Width = selectFBL.outwidth;
                    self.browserPanel.Height = selectFBL.outheight;

                    int formwidth = selectFBL.outwidth + initgap;

                    self.Width = formwidth;

                    int formheight = selectFBL.outheight + initgap + 50 + self.panel_softkey.Height;

                    self.Height = formheight;

                    self.browserPanel.Top = 32;
                    self.browserPanel.Left = (self.Width - self.browserPanel.Width) / 2 - 3;
                    justifyKeyboard();
                }
            }));
        }
        [DllImport("user32.dll", EntryPoint = "GetKeyboardState")]

        public static extern int GetKeyboardState(byte[] pbKeyState);
        public static bool CapsLockStatus
        {

            get

            {

                byte[] bs = new byte[256];

                GetKeyboardState(bs);

                return (bs[0x14] == 1);

            }

        }

        public const int WM_CHAR = 256;
        private void btn_leftsoft_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            if (CapsLockStatus)
            {
                SendKeys.Send("{q}");
            }
            else
            {
                SendKeys.Send("{Q}");
            }
        }

        [DllImport("user32.dll", EntryPoint = "keybd_event", SetLastError = true)]
        public static extern void keybd_event(Keys bVk, byte bScan, uint dwFlags, uint dwExtraInfo);

        public const int KEYEVENTF_KEYUP = 2;
        private void btn_rightsoft_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            if (CapsLockStatus)
            {
                SendKeys.Send("{e}");
            }
            else
            {
                SendKeys.Send("{E}");
            }
        }

        private void btn_up_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("{UP}");
        }

        private void btn_ok_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("{ENTER}");
        }

        private void btn_left_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("{LEFT}");
        }

        private void btn_right_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("{RIGHT}");
        }

        private void btn_down_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("{DOWN}");
        }

        private void btn1_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("1");
        }

        private void btn2_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("2");
        }

        private void btn3_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("3");
        }

        private void btn4_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("4");
        }

        private void btn5_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("5");
        }

        private void btn6_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("6");
        }

        private void btn7_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("7");
        }

        private void btn8_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("8");
        }

        private void btn9_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("9");
        }

        private void btnstar_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("*");
        }

        private void btn0_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("0");
        }

        private void btnsharp_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            SendKeys.Send("#");
        }


        private void 刷新ToolStripMenuItem1_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Reload();
        }

        private void 旋转屏幕ToolStripMenuItem1_Click(object sender, EventArgs e)
        {

            SimForm.xuanzhuan();
        }

        private void 切换分辨率ToolStripMenuItem1_Click(object sender, EventArgs e)
        {

            SimForm.qhfbl();
        }
    }

    public class MyCSharpClassThatContainsXpComJavascriptObjectsFactory : nsIFactory
    {
        public IntPtr CreateInstance(nsISupports aOuter, ref Guid iid)
        {
            var obj = new MyCSharpClassThatContainsXpComJavascriptObjects();
            return Marshal.GetIUnknownForObject(obj);
        }

        public void LockFactory(bool @lock)
        {

        }
    }
    /// <summary>
    /// TODO: currenly I am abusing the nsIWebPageDescriptor interface just to make the CurrentDescriptor attribute return the nsIComponentRegistrar
    /// This allows my to dynamically register javascript xpcom factories.
    /// </summary>
    public class MyCSharpClassThatContainsXpComJavascriptObjects : nsIWebPageDescriptor
    {

        public void LoadPage(nsISupports aPageDescriptor, uint aDisplayType)
        {
            throw new NotImplementedException();
        }

        public nsISupports GetCurrentDescriptorAttribute()
        {
            const string ComponentManagerCID = "91775d60-d5dc-11d2-92fb-00e09805570f";
            nsIComponentRegistrar mgr = (nsIComponentRegistrar)Xpcom.GetObjectForIUnknown((IntPtr)Xpcom.GetService(new Guid(ComponentManagerCID)));
            return (nsISupports)mgr;
        }
    }


}
