using Newtonsoft.Json.Linq;
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Net;
using System.Net.Security;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;

namespace KaiosSim
{
    public sealed class SocketHub : IDisposable
    {
        sealed class Connection
        {
            public string Id, Client, Kind; public TcpClient Tcp; public Stream Stream; public TcpListener Listener; public UdpClient Udp;
            public readonly ManualResetEventSlim Ready = new ManualResetEventSlim(true);
            public readonly object WriteGate = new object(); public int Closed;
        }
        readonly ConcurrentDictionary<string, Connection> connections = new ConcurrentDictionary<string, Connection>();
        readonly Action<string, JObject> emit;
        public SocketHub(Action<string, JObject> emit) { this.emit = emit; }
        void Event(Connection c, string type, JObject data = null) { var p = data ?? new JObject(); p["id"] = c.Id; p["event"] = type; emit(c.Client, p); }
        public string Create(string owner, JObject p)
        {
            var c = new Connection { Id = Guid.NewGuid().ToString("N"), Client = owner, Kind = (string)p["kind"] };
            connections[c.Id] = c; var o = p["options"] as JObject ?? new JObject();
            if (c.Kind == "udp") c.Udp = new UdpClient((string)o["type"] == "udp6" ? AddressFamily.InterNetworkV6 : AddressFamily.InterNetwork);
            else if (c.Kind != "server") Task.Run(() => {
                try
                {
                    c.Tcp = new TcpClient(); c.Tcp.NoDelay = true; c.Tcp.Connect((string)o["host"], (int)o["port"]);
                    c.Stream = c.Tcp.GetStream();
                    if (c.Kind == "tls") { var tls = new SslStream(c.Stream, false, (sender, cert, chain, errors) => true); tls.AuthenticateAsClient((string)o["host"]); c.Stream = tls; }
                    if (c.Closed != 0) { c.Tcp.Close(); return; }
                    Event(c, "connect"); ReadTcp(c);
                }
                catch (Exception e) { Error(c, e); }
            });
            return c.Id;
        }
        void Error(Connection c, Exception e) { if (c.Closed == 0) Event(c, "error", new JObject { ["message"] = e.Message, ["code"] = e is SocketException ? ((SocketException)e).SocketErrorCode.ToString() : "NetworkError" }); Close(c); }
        void ReadTcp(Connection c)
        {
            try
            {
                byte[] buf = new byte[16384];
                while (c.Closed == 0) { c.Ready.Wait(); if (c.Closed != 0) break; int n = c.Stream.Read(buf, 0, buf.Length); if (n == 0) break; Event(c, "data", new JObject { ["data"] = Convert.ToBase64String(buf, 0, n) }); }
                Close(c);
            }
            catch (Exception e) { Error(c, e); }
        }
        public object Action(string owner, JObject p)
        {
            Connection c; if (!connections.TryGetValue((string)p["id"], out c) || c.Client != owner) throw new IOException("Socket is closed");
            switch ((string)p["action"])
            {
                case "close": Close(c); return true;
                case "pause": c.Ready.Reset(); return true;
                case "resume": c.Ready.Set(); return true;
                case "write":
                    if (c.Stream == null) throw new IOException("Socket is not connected");
                    var bytes = Convert.FromBase64String((string)p["data"]); lock (c.WriteGate) c.Stream.Write(bytes, 0, bytes.Length); Event(c, "drain"); return true;
                case "listen":
                    c.Listener = new TcpListener(IPAddress.Loopback, (int)p["port"]); c.Listener.Start();
                    Task.Run(() => {
                        try { while (c.Closed == 0) {
                            var tcp = c.Listener.AcceptTcpClient(); tcp.NoDelay = true;
                            var child = new Connection { Id = Guid.NewGuid().ToString("N"), Client = owner, Kind = "tcp", Tcp = tcp, Stream = tcp.GetStream() };
                            connections[child.Id] = child; Event(c, "connection", new JObject { ["connection"] = child.Id }); Task.Run(() => ReadTcp(child));
                        } } catch (Exception e) { if (c.Closed == 0) Error(c, e); }
                    }); return true;
                case "bind":
                    var addr = (string)p["address"]; var family = c.Udp.Client.AddressFamily;
                    var local = new IPEndPoint(String.IsNullOrEmpty(addr) ? (family == AddressFamily.InterNetworkV6 ? IPAddress.IPv6Any : IPAddress.Any) : IPAddress.Parse(addr), (int?)p["port"] ?? 0);
                    c.Udp.Client.Bind(local); var bound = (IPEndPoint)c.Udp.Client.LocalEndPoint;
                    Task.Run(() => {
                        try { while (c.Closed == 0) {
                            var remote = new IPEndPoint(family == AddressFamily.InterNetworkV6 ? IPAddress.IPv6Any : IPAddress.Any, 0); var data = c.Udp.Receive(ref remote);
                            Event(c, "message", new JObject { ["data"] = Convert.ToBase64String(data), ["remote"] = new JObject { ["address"] = remote.Address.ToString(), ["port"] = remote.Port } });
                        } } catch (Exception e) { if (c.Closed == 0) Error(c, e); }
                    }); return new { address = bound.Address.ToString(), port = bound.Port };
                case "send": var msg = Convert.FromBase64String((string)p["data"]); c.Udp.Send(msg, msg.Length, (string)p["address"], (int)p["port"]); return true;
                case "join": c.Udp.JoinMulticastGroup(IPAddress.Parse((string)p["address"])); return true;
                case "leave": c.Udp.DropMulticastGroup(IPAddress.Parse((string)p["address"])); return true;
                default: throw new InvalidOperationException("Unknown socket action");
            }
        }
        void Close(Connection c)
        {
            if (Interlocked.Exchange(ref c.Closed, 1) != 0) return;
            c.Ready.Set(); if (c.Tcp != null) c.Tcp.Close(); if (c.Udp != null) c.Udp.Close(); if (c.Listener != null) c.Listener.Stop();
            Connection ignored; connections.TryRemove(c.Id, out ignored); Event(c, "close");
        }
        public void CloseClient(string id) { foreach (var c in connections.Values) if (c.Client == id) Close(c); }
        public void Dispose() { foreach (var c in connections.Values) Close(c); }
    }
}
