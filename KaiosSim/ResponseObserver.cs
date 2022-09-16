using Gecko.Net;
using Gecko;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KaiosSim
{
    public class ResponseObserver : NsSupportsBase, nsIObserver
    {
        internal bool _isRegistered;

        void nsIObserver.Observe(nsISupports aSubject, string aTopic, string aData)
        {
            if (!(aTopic == "http-on-modify-request"))
            {
                if (!(aTopic == "http-on-examine-response"))
                {
                    return;
                }

                using (HttpChannel channel = HttpChannel.Create(aSubject))
                {
                    try
                    {
                        Response(channel);
                    }
                    catch (Exception)
                    {
                        Console.WriteLine("Exception in observer implementation");
                    }
                }

                return;
            }

            HttpChannel channel2 = HttpChannel.Create(aSubject);
            try
            {
                Request(channel2);
            }
            catch (Exception)
            {
                Console.WriteLine("Exception in observer implementation");
            }
            channel2.Dispose();
        }

        protected virtual void Request(HttpChannel channel)
        {

        }

        protected virtual void Response(HttpChannel p_HttpChannel)
        {
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Origin", "*", false);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS", false);
            p_HttpChannel.SetResponseHeader("Access-Control-Request-Headers", "*", false);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Credentials", "true", false);
            p_HttpChannel.SetResponseHeader("Timing-Allow-Origin", "*", false);
            p_HttpChannel.SetResponseHeader("Access-Control-Allow-Headers", "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type", false);
             
        }
    }
}
