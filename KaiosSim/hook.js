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

//�������Ϊ���Զ��ر���������õ�
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
