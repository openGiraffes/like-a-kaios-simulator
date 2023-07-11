console.log = function (str) {
    try {
        var event = document.createEvent('MessageEvent');
        var origin = window.location.protocol + '//' + window.location.host;
        event.initMessageEvent('callLog', true, true, "console.log:" + str, origin, 1234, window, null);
        document.dispatchEvent(event);
    } catch (err) {

    }
}
console.error = function (str) {
    try {
        var event = document.createEvent('MessageEvent');
        var origin = window.location.protocol + '//' + window.location.host;
        event.initMessageEvent('callLog', true, true, "console.error:" + str, origin, 1234, window, null);
        document.dispatchEvent(event);
    } catch (err) {

    }
}
console.log("console.login");

const send = XMLHttpRequest.prototype.send;
const open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (...agrs) {
    this.withCredentials = false;
    console.log("open");
    open.apply(this, agrs)
};
XMLHttpRequest.prototype.send = function (...agrs) {
    this.withCredentials = false;
    console.log("send");
    send.apply(this, agrs)
};

//这个函数为了自动关闭浏览器设置的
window.close = function () {

    try {
        var event = document.createEvent('MessageEvent');
        var origin = window.location.protocol + '//' + window.location.host;
        event.initMessageEvent('callMeClose', true, true, '', origin, 1234, window, null);
        document.dispatchEvent(event);
    } catch (err) {

    }
}

//mock mozSetting
var mozSetting = {

}
