using Gecko.Net;
using Gecko;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.Remoting.Channels;
using Gecko.Observers;

namespace KaiosSim
{
    public class ResponseObserver : BaseHttpRequestResponseObserver
    {
        internal bool _isRegistered;

        //void Observe(nsISupports aSubject, string aTopic, string aData)
        //{
        //    if (aTopic == "http-on-examine-response")
        //    {
        //        using (HttpChannel channel = HttpChannel.Create(aSubject))
        //        {
        //            try
        //            {
        //                Response(channel);
        //            }
        //            catch (Exception ex)
        //            {
        //                Console.WriteLine("Exception in observer implementation" + ex.ToString());
        //            }
        //        }

        //        return;
        //    }
        //    if (aTopic == "http-on-modify-request")
        //    {
        //        HttpChannel channel2 = HttpChannel.Create(aSubject);
        //        try
        //        {
        //            //channel2.RequestMethod = "GET";
        //            //channel2.OriginalUri = new Uri(channel2.OriginalUri.ToString().Replace("https://", "http://"));
        //            Request(channel2);
        //        }
        //        catch (Exception)
        //        {
        //            Console.WriteLine("Exception in observer implementation");
        //        }
        //        channel2.Dispose();
        //    }
        //}

        protected override void Request(HttpChannel channel)
        {

        }
        protected override void Response(HttpChannel p_HttpChannel)
        {

            Console.WriteLine("Response:" + p_HttpChannel.Uri);

            p_HttpChannel.SetResponseHeader("Same-Site", "None", true);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Origin", "*", true);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS", true);
            p_HttpChannel.SetResponseHeader("Access-Control-Request-Headers", "*", true);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Credentials", "true", true);
            p_HttpChannel.SetResponseHeader("Timing-Allow-Origin", "*", true);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Headers", "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type", true);
        }
    }
}
