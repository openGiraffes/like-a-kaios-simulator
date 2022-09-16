using Gecko;
using Gecko.Net;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Forms; 
namespace KaiosSim
{
    public partial class SimForm : Form
    {
        public string url;
        static SimForm self;

        public static int initwidth  = -1; 
        public static int initheight = -1;
        public static int initgap = -1;

        public SimForm(string url)
        {
            InitializeComponent();

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
            geckoWebBrowser = new GeckoWebBrowser { Dock = DockStyle.Fill};

            geckoWebBrowser.EnableConsoleMessageNotfication();
            geckoWebBrowser.ConsoleMessage += GeckoWebBrowser_ConsoleMessage; 
            geckoWebBrowser.UseHttpActivityObserver = true;
            geckoWebBrowser.NoDefaultContextMenu = true; 
            //geckoWebBrowser.ContextMenuStrip = this.ContextMenuStrip; 
            ResponseObserver MyObs = new ResponseObserver();
            //MyObs.TicketLoadedEvent += MyObs_TicketLoadedEvent;//如何处理捕捉到的response  
            ObserverService.AddObserver(MyObs, "http-on-modify-request", false);//添加观察器
            ObserverService.AddObserver(MyObs, "http-on-examine-response",false);//添加观察器
             
            browserPanel.Controls.Add(geckoWebBrowser);

            geckoWebBrowser.Navigate(this.url);
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

                int formheight =  height + initgap + 50+ self.panel_softkey.Height;
                
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
                if(selectFBL.DialogResult==DialogResult.OK)
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
         
        private void btn_leftsoft_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            //using (AutoJSContext context = new AutoJSContext(geckoWebBrowser.Window))
            //{
            //    string result;
            //    var jssc = "const ke = new KeyboardEvent('keydown', {bubbles: true, cancelable: true, keyCode: 0,key:'SoftLeft'});document.dispatchEvent(event);";
            //    context.EvaluateScript(jssc, out result);
            //    jssc = "const ke = new KeyboardEvent('keyup', {bubbles: true, cancelable: true, keyCode: 0,key:'SoftLeft'});document.dispatchEvent(event);";
            //    context.EvaluateScript(jssc, out result);
            //}  
            keybd_event(Keys.Q, 0, 0, 0);
            keybd_event(Keys.Q, 0, KEYEVENTF_KEYUP, 0);
        }
        [DllImport("user32.dll", EntryPoint = "keybd_event", SetLastError = true)]
        public static extern void keybd_event(Keys bVk, byte bScan, uint dwFlags, uint dwExtraInfo);

        public const int KEYEVENTF_KEYUP = 2;
        private void btn_rightsoft_Click(object sender, EventArgs e)
        {
            geckoWebBrowser.Focus();
            //using (AutoJSContext context = new AutoJSContext(geckoWebBrowser.Window))
            //{
            //    string result;
            //    var jssc = "const ke = new KeyboardEvent('keydown', {bubbles: true, cancelable: true, keyCode: 0,key:'SoftRight'});document.dispatchEvent(event);";
            //    context.EvaluateScript(jssc, out result);
            //    jssc = "const ke = new KeyboardEvent('keyup', {bubbles: true, cancelable: true, keyCode: 0,key:'SoftRight'});document.dispatchEvent(event);";
            //    context.EvaluateScript(jssc, out result);
            //} 
            keybd_event(Keys.E, 0, 0, 0);
            keybd_event(Keys.E, 0, KEYEVENTF_KEYUP, 0);
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
     
}
