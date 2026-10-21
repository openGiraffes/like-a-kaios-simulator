using Gecko;
using System;
using System.IO;
using System.Runtime.InteropServices;

namespace KaiosSim
{
    // Insert through the document's native DOM before parser scripts run.
    // This uses the frame's own script principal, including cross-origin frames.
    [ComVisible(true)]
    public sealed class DocumentBootstrapObserver : nsIObserver, IDisposable
    {
        readonly string script, origin;
        readonly Action<string> log;
        public DocumentBootstrapObserver(BridgeServer server, Action<string> log)
        {
            this.log = log; origin = server.Origin;
            script = "if (!window.__kaiosGeckoReady) {" + server.Bootstrap + "\n" + File.ReadAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Polyfills", "kaios-gecko.js")) + "\n}";
            if (server.Diagnostics) script += ";setTimeout(function(){console.log('FRAME_STATE:'+JSON.stringify({url:location.origin,ready:document.readyState,errors:window.__kaiosBootErrors,body:document.body&&(document.body.innerText||document.body.textContent),html:document.body&&document.body.innerHTML}));},30000);";
            ObserverService.AddObserver(this, "document-element-inserted", false);
        }
        public void Observe(nsISupports subject, string topic, string data)
        {
            try
            {
                var document = Xpcom.QueryInterface<nsIDOMDocument>(subject); if (document == null) return;
                using (var url = new nsAString())
                {
                    document.GetDocumentURIAttribute(url); Uri uri;
                    if (!Uri.TryCreate(url.ToString(), UriKind.Absolute, out uri) || (uri.Scheme != "http" && uri.Scheme != "https") || uri.GetLeftPart(UriPartial.Authority) == origin) return;
                }
                using (var tag = new nsAString("script")) using (var code = new nsAString(script))
                {
                    var element = document.CreateElement(tag); element.SetTextContentAttribute(code);
                    var root = document.GetDocumentElementAttribute(); root.AppendChild(element); root.RemoveChild(element);
                }
            }
            catch (Exception e) { log("远程页面兼容层：" + e.Message); }
        }
        public void Dispose() { ObserverService.RemoveObserver(this, "document-element-inserted"); }
    }
}
