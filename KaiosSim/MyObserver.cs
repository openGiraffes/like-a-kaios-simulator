using Gecko.Net;
using Gecko.Observers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KaiosSim
{
    public class MyObserver : BaseHttpModifyRequestObserver
    {
        public delegate void TicketLoadedEventHandler(ref HttpChannel p_HttpChannel, object sender, System.EventArgs e);
        /// <summary>
        /// 处理事件委托
        /// </summary>
        public event TicketLoadedEventHandler TicketLoadedEvent;
        /// <summary>
        /// 需要拦截的网址，只要独一无二的关键词既可
        /// </summary>
        public List<string> targetUrls = new List<string>() { };
        protected override void ObserveRequest(HttpChannel p_HttpChannel)
        {
            if (p_HttpChannel != null)
            {
                //if (targetUrls.Any(s => p_HttpChannel.Uri.AbsoluteUri.Contains(s)))
                //{ 
                //p_HttpChannel.SetRequestHeader("Origin", p_HttpChannel.GetRequestHeader("Host"), false);

                //p_HttpChannel.RequestMethod = "GET";
                //p_HttpChannel.Suspend();
                //p_HttpChannel.OriginalUri = new Uri(p_HttpChannel.OriginalUri.ToString().Replace("https://","http://"));
                p_HttpChannel.SetRequestHeader("Accept-Encoding", "identity", false);
                
                TraceableChannel oTC = p_HttpChannel.CastToTraceableChannel();
                    StreamListenerTee oStream = new StreamListenerTee();

                    oStream.Completed += (sender, e) => TicketLoadedEvent(ref p_HttpChannel, sender, e);

                    oTC.SetNewListener(oStream);
               //p_HttpChannel.Resume();
                //}
            }
        }


        //********************* TicketLoadedEvent 事件处理参考 *********************
        /// <summary>
        /// 主要是如何读取response数据，p_HttpChannel内可获取url、header等,header内应该也包含setcookie，没去测试
        /// </summary>
        /// <param name="p_HttpChannel"></param>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        //private void MyObserver_TicketLoadedEvent(HttpChannel p_HttpChannel, object sender, EventArgs e)
        //{
        //    if (sender is StreamListenerTee)
        //    {
        //        StreamListenerTee oStream = sender as StreamListenerTee;
        //        byte[] aData = oStream.GetCapturedData();
        //        string sData = Encoding.UTF8.GetString(aData);
        //    }
        //}


    }

}
