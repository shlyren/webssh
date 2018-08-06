var btn = $('.btn-primary'),
    style = {},
    wssh = {};
    closeFromApp = false;
function parse_xterm_style() {
    var text = $('.xterm-helpers style').text();
    var arr = text.split('xterm-normal-char{width:');
    style.width = parseFloat(arr[1]);
    arr = text.split('div{height:');
    style.height = parseFloat(arr[1]);
}


function current_geometry() {
    if (!style.width || !style.height) {
      parse_xterm_style();
    }

    var cols = parseInt(window.innerWidth / style.width, 10) - 1;
    var rows = parseInt(window.innerHeight / style.height, 10);
    return {'cols': cols, 'rows': rows};
}


function resize_term() {

    var term = wssh.term,
        sock = wssh.sock;

    if (term == undefined || sock == undefined ||  term == null || sock == null) return;

    var geometry = current_geometry(),
        cols = geometry.cols,
        rows = geometry.rows;

    if (cols !== term.geometry[0] || rows !== term.geometry[1]) {
      term.resize(cols, rows);
      sock.send(JSON.stringify({'resize': [cols, rows]}));  
    }
}



function callback(msg) {
    if (msg.status) {
        $('#status').text(msg.status);
        terminalConnectError({'status': msg.status});
        setTimeout(function(){
          btn.prop('disabled', false);
        }, 500);
        return;
    }

    var ws_url = window.location.href.replace('http', 'ws'),
        join = (ws_url[ws_url.length-1] === '/' ? '' : '/'),
        url = ws_url + join + 'ws?id=' + msg.id,
        sock = new window.WebSocket(url),
        encoding = msg.encoding,
        terminal = document.getElementById('#terminal'),
        term = new window.Terminal({
            cursorBlink: true,
        });
        

    wssh.sock = sock;
    wssh.term = term;

    term.on('data', function(data) {
        sendData(data);
    });

    sock.onopen = function() {
        $('.container').hide();
        term.open(terminal, true);
        term.toggleFullscreen(true);
        
        terminalConnected();
    };

    sock.onmessage = function(msg) {
      var reader = new window.FileReader();
      reader.onloadend = function(){
        var decoder = new window.TextDecoder(encoding);
        var text = decoder.decode(reader.result);

        term.write(text);
        if (!term.resized) {
          resize_term();
          term.resized = true;
        }
      };

      reader.readAsArrayBuffer(msg.data);
    };

    sock.onerror = function(e) {
        terminalConnectError({'status': '与SSH服务器连接错误'});
    };

    sock.onclose = function(e) {
          
        $('#status').text(e.reason);
        btn.prop('disabled', false);
          
        if (isMobile()) {
            if (closeFromApp == false) {
                terminalClosed();
            }else {
                closeFromApp = false;
            }
        }else {
            term.destroy();
            $('.container').show();
        }

        wssh.term = undefined;
        wssh.sock = undefined;
    };
}


$('form#connect').submit(function(event) {
    event.preventDefault();

    var form = $(this),
        url = form.attr('action'),
        type = form.attr('type'),
        data = new FormData(this);

    $('#status').text('');
    btn.prop('disabled', true);

    $.ajax({
        url: url,
        type: type,
        data: data,
        success: callback,
        cache: false,
        contentType: false,
        processData: false
    });

});

$(window).resize(function(){
    resize_term();
});

// 关闭ssh连接
function closedTerminal() {
    closeFromApp = true;
    var sock = wssh.sock;
    if (sock == undefined || sock == null) {return;}
    sock.onclose();
}

// 命令行输入监听处理, 主要是处理ctrl组合键的事件
function sendData(data) {

    if (isMobileCtrlSelected == false) {
        sendSocketData(data);
        return;
    }

    var value = ctrlAndKeyEcode[data];
    // console.log(data);
    // console.log(value);
    if (value != undefined && value != null) {
        sendSocketData(value);
    }
}

// 向服务器发送socket数据
function sendSocketData(data) {

    var sock = wssh.sock;
    if (sock == undefined || sock == null) { return; }

    var json = JSON.stringify({'data': data});
    // console.log(json);
    sock.send(json);
}


      
// 手机上是否选中了Ctrl 按键
var isMobileCtrlSelected = false;

function setCtrlSelected(sel) {
    isMobileCtrlSelected = sel;
}

// 以下是Ctrl + 26 位字母 的组合编码
var ctrlAndKeyEcode = {
    'q': '\u0011', // ctrl + q
    'w': '\u0017', // ctrl + w
    'e': '\u0005', // ctrl + e
    'r': '\u0012', // ctrl + r
    't': '\u0014', // ctrl + t
    'y': '\u0019', // ctrl + y
    'u': '\u0015', // ctrl + u
    'i': '\t',     // ctrl + i
    'o': '\u000f', // ctrl + o
    'p': '\u0010', // ctrl + p

    'a': '\u0001', // ctrl + a
    's': '\u0013', // ctrl + s
    'd': '\u0004', // ctrl + d
    'f': '\u0006', // ctrl + f
    'g': '\u0007', // ctrl + g
    'h': '\b',     // ctrl + h
    'j': '\n',     // ctrl + j
    'k': '\u000b', // ctrl + k
    'l': '\f',     // ctrl + l

    'z': '\u001a', // ctrl + z
    'x': '\u0018', // ctrl + x
    'c': '\u0003', // ctrl + c
    'v': '\u0016', // ctrl + v
    'b': '\u0002', // ctrl + b
    'n': '\u000e', // ctrl + n
    'm': '\r',     // ctrl + m

    '[': '\u001b',     // ctrl + [
    ']': '\u001d',     // ctrl + ]

    '\u001b[A': '\u001b[1;5A', // ctrl +  ↑
    '\u001b[B': '\u001b[1;5B', // ctrl +  ↓
    '\u001b[D': '\u001b[1;5D', // ctrl + ←
    '\u001b[C': '\u001b[1;5C', // ctrl + →

    '3':'\u001b',
    '4':'\u001c',
    '5':'\u001d',
    '6':'\u001e',
    '7':'\u001f',
 // 以下是Ctrl + 26 位字母 的组合编码
    // 81:'\u0011', // ctrl + q
    // 87:'\u0017', // ctrl + w
    // 69:'\u0005', // ctrl + e
    // 82:'\u0012', // ctrl + r
    // 84:'\u0014', // ctrl + t
    // 89:'\u0019', // ctrl + y
    // 85:'\u0015', // ctrl + u
    // 73:'\t',     // ctrl + i
    // 79:'\u000f', // ctrl + o
    // 80:'\u0010', // ctrl + p

    // 65:'\u0001', // ctrl + a
    // 83:'\u0013', // ctrl + s
    // 68:'\u0004', // ctrl + d
    // 70:'\u0006', // ctrl + f
    // 71:'\u0007', // ctrl + g
    // 72:'\b',     // ctrl + h
    // 74:'\n',     // ctrl + j
    // 75:'\u000b', // ctrl + k
    // 76:'\f',     // ctrl + l

    // 90:'\u001a', // ctrl + z
    // 88:'\u0018', // ctrl + x
    // 67:'\u0003', // ctrl + c
    // 86:'\u0016', // ctrl + v
    // 66:'\u0002', // ctrl + b
    // 78:'\u000e', // ctrl + n
    // 77:'\r',     // ctrl + m
};
