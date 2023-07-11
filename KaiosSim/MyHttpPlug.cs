using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TouchSocket.Http;
using TouchSocket.Sockets;

namespace KaiosSim
{
    /// <summary>
    /// 支持GET、Post、Put，Delete，或者其他
    /// </summary>
    public class MyHttpPlug : HttpPluginBase
    {
        protected override void OnGet(ITcpClientBase client, HttpContextEventArgs e)
        {
            if (e.Context.Request.UrlEquals("/success"))
            {
                e.Context.Response.FromText("Success").Answer();//直接回应
                Console.WriteLine("处理完毕");
                e.Handled = true;
            }
            else if (e.Context.Request.UrlEquals("/file"))
            {
                e.Context.Response
                    .SetStatus()//必须要有状态
                    .FromFile(@"D:\System\Windows.iso", e.Context.Request);//直接回应文件。
            }
            base.OnGet(client, e);
        }
    }


}
