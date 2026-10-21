using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Forms;

namespace KaiosSim
{
    internal static class Program
    {
        /// <summary>
        /// 应用程序的主入口点。
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;
            int workers, completion; System.Threading.ThreadPool.GetMinThreads(out workers, out completion);
            System.Threading.ThreadPool.SetMinThreads(Math.Max(workers, 32), completion);
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            try
            {
                if (args.Length >= 3 && args[0] == "--diagnose") { SmokeTests.Diagnose(args[1], args[2], args.Length > 3 ? args[3] : "new"); return; }
                if (args.Length >= 3 && args[0] == "--smoke") { SmokeTests.Run(args[1], args[2], args.Length > 3 ? args[3] : "legacy"); return; }
                var form = new Form1();
                if (args.Length > 0 && System.IO.File.Exists(args[0])) form.Shown += (s, e) => form.BeginInvoke(new Action(() => form.Import(args[0], true)));
                Application.Run(form);
            }
            catch (Exception e)
            {
                System.IO.File.WriteAllText(System.IO.Path.Combine(System.IO.Path.GetTempPath(), "KaiosSim-startup-error.txt"), e.ToString());
                Environment.ExitCode = 1;
                MessageBox.Show("启动失败：" + e.Message, "KaiOS Simulator", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally { if (Gecko.Xpcom.IsInitialized) Gecko.Xpcom.Shutdown(); }
        }
    }
}
