using Gecko;
using Gecko.Net;
using Gecko.Observers;
using System;
using System.Linq;

namespace KaiosSim
{
    public sealed class ResponseObserver : BaseHttpRequestResponseObserver
    {
        readonly string origin;
        public ResponseObserver(string origin) { this.origin = origin; }
        protected override void Request(HttpChannel channel)
        {
            var uri = channel.Uri;
            string target = null;
            if (uri.Host == "shared.localhost") target = origin + "/__sim/shared" + uri.PathAndQuery;
            else if (uri.Host == "static.kaiads.com" || (uri.IsLoopback && uri.AbsolutePath.StartsWith("/sdk/ads/"))) target = origin + "/__sim/ads.js";
            else if (uri.IsLoopback && uri.AbsolutePath.StartsWith("/api/v1/")) target = origin + "/__sim/external-api/" + uri.AbsolutePath.Substring(8);
            if (target != null) { channel.Instance.RedirectTo(IOService.CreateNsIUri(target)); return; }
            bool anonymous = false;
            var headers = new System.Collections.Generic.List<System.Collections.Generic.KeyValuePair<string, string>>();
            channel.GetRequestHeaders(headers, (list, key, value) => list.Add(new System.Collections.Generic.KeyValuePair<string, string>(key, value)));
            foreach (var header in headers)
            {
                string name = header.Key.ToLowerInvariant();
                if (name == "x-kaios-sys-anon") anonymous = true;
                if (name.StartsWith("x-kaios-sys-hdr-")) channel.SetRequestHeader(name.Substring("x-kaios-sys-hdr-".Length), header.Value, false);
                if (name.StartsWith("x-kaios-sys-")) channel.SetRequestHeader(header.Key, "", false);
            }
            if (anonymous) { channel.SetRequestHeader("Cookie", "", false); channel.SetRequestHeader("Cookie2", "", false); channel.SetRequestHeader("Authorization", "", false); }
        }
        protected override void Response(HttpChannel channel)
        {
            string requestOrigin = null; try { requestOrigin = channel.GetRequestHeader("Origin"); } catch { }
            channel.SetResponseHeader("Access-Control-Allow-Origin", String.IsNullOrEmpty(requestOrigin) ? origin : requestOrigin, false);
            channel.SetResponseHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS", false);
            channel.SetResponseHeader("Access-Control-Allow-Credentials", "true", false);
            channel.SetResponseHeader("Timing-Allow-Origin", "*", false);
            string requested = null; try { requested = channel.GetRequestHeader("Access-Control-Request-Headers"); } catch { }
            channel.SetResponseHeader("Access-Control-Allow-Headers", String.IsNullOrEmpty(requested) ? "Content-Type,Authorization,X-KaiOS-Sys-XHR,X-KaiOS-Sys-Anon" : requested, false);
        }
    }
}
