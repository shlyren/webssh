
var iOSJS = null; //iOS的与js的桥接对象

var keyCodeToValue = {
//以下在手机键盘上没有的电脑键盘的以下按键
// 后面的注释表示所输入的键, 前面的key值是键盘的keycode值,这个可以自行定义
// 只要保证 模拟输入esc 对应的是 \u001b 就好
    27: '\u001b',   // esc
    9: '\t',        // ⇥
    38: '\u001b[A', // ↑
    40: '\u001b[B', // ↓
    37: '\u001b[D', // ←
    39: '\u001b[C', // →
    109: '-',       //  -
    111: '/',       //  /
}

//这些函数是集成手机web内调用
// 初始化操作
$(document).ready(function() {
if(isMobile()) {
    setTimeout(function(){
    needVerifySSHToApp({'_xsrf':$('input[name="_xsrf"]').val()});
    }, 100);
}
});


// 移动端调用此方法来模拟电脑键盘的部分按键
// 因为手机端并没有电脑的部分按键, 比如上下左右, esc等, 故增加此接口供移动端使用
// 可自行根据实际情况定义
// keyCode 按键的keyCode值, data可以自行定义格式
function keyCodeEvent(data) {

    if (typeof data === "string") {
        data = JSON.parse(data);;
    }
    var code = data.code;
    switch (code) {
        case 'paste': // 这个是粘贴
        sendData(data.value);
        break;
        case 'ctrl': // 这个是ctrl组合键  data.value 表示是否选中
        setCtrlSelected(data.value);
        break;
        default:
        // 通过keycode 获取对应的 value
        var value = keyCodeToValue[code];
        if (value == undefined || value == null) break;
        sendData(value); // 向服务器发送数据
        break;
    }
}


// 关闭ssh连接, 由移动端调用
// 通过手机端来关闭ssh连接, 当然也可以直接在终端输入exit来达到退出的目的
function closeConnect() {
    closedTerminal();
}

/**
 * 客户端调用, 通过网页端验证
 * 客户端调用此函数并传入必要的登陆信息通过 ajax 与服务器通信
 *  @param data 客户端传来的参数 包含验证信息等
 */
function verifyByHTML(data) {
    if (typeof data == "string") {
        data = JSON.parse(data);
    }
    $('#hostname').val(data.hostname);
    $('#username').val(data.username);
    $('#port').val(data.port);
    $('#password').val(data.password);
    $('#privatekey').val(data.privatekey);
    $('#submit').click();
}

/**
 * 通知移动端可以验证ssh登录了
 * 即当前页面加载完毕后通过移动端验证ssh登录信息,
 * 移动端可以监听此函数并调用verifyByHTML 来验证登录, 
 * 也可以在客户端验证, 但由于cookie的原因, 推荐使用verifyByHTML形式传参让js验证
 * @param data 这是'_xsrf' 如果使用原生验证必须要此三处
 */
function needVerifySSHToApp(data) {
    if (isAndroid) {
        AndroidJS.needVerifySSHToApp(JSON.stringify(data));
    }else if(isiOS && iOSJS) {
        iOSJS.callHandler('needVerifySSHToApp', data, function(response) {
            //处理oc过来的回调
            if (response.hostname && response.username) {
            verifyByHTML(response);
            }else {
            callback(response);
            }
            
        });
    }
}
/**
 * ssh连接成功, 由移动端监听
 */
function terminalConnected() {

    if (isAndroid) {
        AndroidJS.terminalConnected();
    }else if(isiOS && iOSJS) {
        iOSJS.callHandler('terminalConnected');
    }else{
        document.title = $('#hostname').val() + '已连接';
    }
}
/**
 * ssh 连接失败, 由移动端监听
 * @param data {'status': ...}
 */
function terminalConnectError(data) {

    if (isAndroid) {
        AndroidJS.terminalConnectError(JSON.stringify(data));
    }else if(isiOS && iOSJS) {
        iOSJS.callHandler('terminalConnectError',data);
    }else{
        document.title = data['status'];
    }
}
/*
* ssh登出通知, 由移动端监听
* 包括通过exit命令正常退出和其他原因的异常退出
*/
function terminalClosed() {
    
    if (isAndroid) {
        AndroidJS.terminalClosed();
    }else if(isiOS && iOSJS) {
        iOSJS.callHandler('terminalClosed');
    }else {
        document.title = 'WebSSH';
    }
}


/*这段代码是固定的，必须要放到js中*/
function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
}

if (isiOS) {
    /*与OC交互的所有JS方法都要放在此处注册，才能调用通过JS调用OC或者让OC调用这里的JS*/
    setupWebViewJavascriptBridge(function(bridge) {
        handlerFunction(bridge);
    });
}
function handlerFunction(bridge) {
    iOSJS = bridge;
    
    // 布局命令行窗口, 因为iOS端但键盘隐藏时, 命令行窗口不会自动布局, 所以需要iOS端手动调用此接口
    bridge.registerHandler('layoutSSHTerminal', function(data, responseCallback) {
        resize_term();
    });
    // iOS端发送特殊按键的接口
    bridge.registerHandler('keyCodeEvent', function(data, responseCallback) {
        keyCodeEvent(data);
    });
    // iOS端手动关闭连接的接口
    bridge.registerHandler('closeConnect', function() {
        closeConnect();
    });

}