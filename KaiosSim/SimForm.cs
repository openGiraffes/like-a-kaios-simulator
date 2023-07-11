using Gecko;
using Gecko.Net;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using static Gecko.ObserverNotifications;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.Rebar;

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
        void RegisterExtensionDir(string dir)
        {
            Console.WriteLine("Registering binary extension directory:  " + dir);
            var chromeDir = (nsIFile)Xpcom.NewNativeLocalFile(dir);
            var chromeFile = chromeDir.Clone();
            chromeFile.Append(new nsAString("chrome.manifest"));
            Xpcom.ComponentRegistrar.AutoRegister(chromeFile);
        }

        public SimForm(string url, bool fullscreen = false)
        {
            InitializeComponent();
            RegisterExtensionDir("");
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

        private void MyObs_TicketLoadedEvent(ref HttpChannel p_HttpChannel, object sender, EventArgs e)
        {
            if (sender is StreamListenerTee)
            {
                StreamListenerTee oStream = sender as StreamListenerTee;
                byte[] aData = oStream.GetCapturedData();
                string sData = Encoding.UTF8.GetString(aData);
            }
            p_HttpChannel.SetResponseHeader("Same-Site", "None", false);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Origin", "*", false);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS", false);
            p_HttpChannel.SetResponseHeader("Access-Control-Request-Headers", "*", false);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Credentials", "true", false);
            p_HttpChannel.SetResponseHeader("Timing-Allow-Origin", "*", false);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Headers", "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type", false);
        }

        private void SimForm_Load(object sender, EventArgs e)
        {

            geckoWebBrowser = new GeckoWebBrowser { Dock = DockStyle.Fill };

            geckoWebBrowser.EnableConsoleMessageNotfication();
            geckoWebBrowser.ConsoleMessage += GeckoWebBrowser_ConsoleMessage;
            geckoWebBrowser.UseHttpActivityObserver = true;
            geckoWebBrowser.NoDefaultContextMenu = true;
            //geckoWebBrowser.ContextMenuStrip = this.ContextMenuStrip;
            ResponseObserver MyObs2 = new ResponseObserver();
            ObserverService.AddObserver(MyObs2);

            ////MyObs.TicketLoadedEvent += MyObs_TicketLoadedEvent;//如何处理捕捉到的response  
            //ObserverService.AddObserver(MyObs2, "http-on-modify-request", false);//添加观察器
            ////ObserverService.AddObserver(MyObs2, "http-on-examine-response", false);//添加观察器
            //MyObserver MyObs = new MyObserver();
            //MyObs.TicketLoadedEvent += MyObs_TicketLoadedEvent; //如何处理捕捉到的response 
            //ObserverService.AddObserver(MyObs);//添加观察器

            geckoWebBrowser.ObserveHttpModifyRequest += GeckoWebBrowser_ObserveHttpModifyRequest;

            browserPanel.Controls.Add(geckoWebBrowser);
            geckoWebBrowser.Navigate(this.url);

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

        private void GeckoWebBrowser_ObserveHttpModifyRequest(object sender, GeckoObserveHttpModifyRequestEventArgs e)
        {
            Console.WriteLine(e.Uri);
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

                SendKeys.Send("{Q}");
            }
            else
            {
                SendKeys.Send("{Q}");

                SendKeys.Send("{q}");

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
                SendKeys.Send("{E}");
            }
            else
            {
                SendKeys.Send("{E}");
                SendKeys.Send("{e}");
            }
        }

        private void btn_up_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            keybd_event(Keys.Up, 0, 0, 0);
            keybd_event(Keys.Up, 0, KEYEVENTF_KEYUP, 0);
            //SendKeys.Send("{UP}");
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

        private void btn_up_MouseDown(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                geckoWebBrowser.Focus();
                keybd_event(Keys.Up, 0, 0, 0);
            }
        }

        private void btn_up_MouseUp(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {

                geckoWebBrowser.Focus();
                keybd_event(Keys.Up, 0, KEYEVENTF_KEYUP, 0);
            }
        }


        private void btnMouseDown(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                geckoWebBrowser.Focus();
                string text = (sender as Button).Text;
                switch (text)
                {
                    case "上":
                        keybd_event(Keys.Up, 0, 0, 0);
                        break;
                    case "下":
                        keybd_event(Keys.Down, 0, 0, 0);
                        break;
                    case "左":
                        keybd_event(Keys.Left, 0, 0, 0);
                        break;
                    case "右":
                        keybd_event(Keys.Right, 0, 0, 0);
                        break;
                    case "OK键":
                        keybd_event(Keys.Enter, 0, 0, 0);
                        break;
                    case "*":
                        keybd_event(Keys.Multiply, 0, 0, 0);
                        break;
                    case "#":
                        SendKeys.Send("#");
                        break;
                    case "0":
                        keybd_event(Keys.D0, 0, 0, 0);
                        break;
                    case "1":
                        keybd_event(Keys.D1, 0, 0, 0);
                        break;
                    case "2":
                        keybd_event(Keys.D2, 0, 0, 0);
                        break;
                    case "3":
                        keybd_event(Keys.D3, 0, 0, 0);
                        break;
                    case "4":
                        keybd_event(Keys.D4, 0, 0, 0);
                        break;
                    case "5":
                        keybd_event(Keys.D5, 0, 0, 0);
                        break;
                    case "6":
                        keybd_event(Keys.D6, 0, 0, 0);
                        break;
                    case "7":
                        keybd_event(Keys.D7, 0, 0, 0);
                        break;
                    case "8":
                        keybd_event(Keys.D8, 0, 0, 0);
                        break;
                    case "9":
                        keybd_event(Keys.D9, 0, 0, 0);
                        break;
                    default:
                        break;
                }
            }
        }

        private void btnMouseUp(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {

                geckoWebBrowser.Focus();
                string text = (sender as Button).Text;
                switch (text)
                {
                    case "上":
                        keybd_event(Keys.Up, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "下":
                        keybd_event(Keys.Down, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "左":
                        keybd_event(Keys.Left, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "右":
                        keybd_event(Keys.Right, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "OK键":
                        keybd_event(Keys.Enter, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "*":
                        keybd_event(Keys.Multiply, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "#":
                        SendKeys.Send("#");
                        break;
                    case "0":
                        keybd_event(Keys.D0, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "1":
                        keybd_event(Keys.D1, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "2":
                        keybd_event(Keys.D2, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "3":
                        keybd_event(Keys.D3, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "4":
                        keybd_event(Keys.D4, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "5":
                        keybd_event(Keys.D5, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "6":
                        keybd_event(Keys.D6, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "7":
                        keybd_event(Keys.D7, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "8":
                        keybd_event(Keys.D8, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    case "9":
                        keybd_event(Keys.D9, 0, KEYEVENTF_KEYUP, 0);
                        break;
                    default:
                        break;
                }
            }
        }
    }
}
