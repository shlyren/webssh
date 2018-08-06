## WebSSH

一个简单的Web应用程序可用作ssh客户端连接到您的ssh服务器。它是用Python编写的，基于tornado和paramiko。

https://ssh.yuxiang.ren/

### 截图
<img src="https://github.com/shlyren/webssh/raw/master/preview/login.png" width="40%"  />     <img src="https://github.com/shlyren/webssh/raw/master/preview/terminal.png" width="40%"/>

<img src="https://github.com/shlyren/webssh/raw/master/preview/iOS.png" width="40%"/>    <img src="https://github.com/shlyren/webssh/raw/master/preview/Android.png" width="40%"/>


### 特性
* 支持SSH密码认证，包括空密码。
* 支持SSH公钥认证，包括DSA RSA ECDSA Ed25519密钥。
* 支持加密的密钥。
* 全屏终端支持。
* 终端窗口可调整大小。
* 自动检测系统默认编码。
* 与Python 2.7-3.6兼容。
* 支持SSL。
* 支持电脑及手机，需要搭配原生交互, 如需iOS或Android端示例代码可滴滴我。
* `webssh/static/js/`目录下有相关js交互函数，可自行参考修改。
  - `nativecall.js`
  - `main.js`

### 安装说明
```bash
git clone https://github.com/shlyren/webssh && cd webssh
sudo python setup.py install
bash start.sh
```

### 选项
```
# 指定地址和端口
wssh --address='0.0.0.0' --port=8000

# 配置丢失的主机密钥策略
wssh --policy=reject

# 配置日志登记
wssh --logging=debug

# 日志保存地址
wssh --log-file-prefix=main.log

# 更多信息
wssh --help
```

### 配合Nginx以支持SSL
```
server {
    listen 80;
    server_name ssh.yuxiang.ren;
    rewrite ^/(.*) https://ssh.yuxiang.ren/$1 permanent;# 重定向至https
}

# 开启SSL
server {
    listen 443 ssl;
	# 指定SSL 可访问的网站
    server_name ssh.yuxiang.ren;
    ssl_certificate /etc/letsencrypt/live/ssh.yuxiang.ren/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ssh.yuxiang.ren/privkey.pem;
    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        # 指定 SSL 指向本地端口,即通过wssh命令后日志输入的地址
        proxy_pass http://127.0.0.1:8000/;
        proxy_redirect off;

        # Socket.IO Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Tips

* 使用Nginx作为前端Web服务器（请参阅上面的配置示例）并启用SSL，以保证数据的安全传输。
* 使用拒绝策略作为缺少的主机密钥策略以及经过验证的known_hosts，这将防止中间人攻击。 这个想法是它按顺序检查系统主机密钥文件（“〜/ .ssh / known_hosts”）和应用程序主机密钥文件（“./ known_hosts”），如果找不到ssh服务器的主机名或密钥不是 匹配，连接将被中止。但似乎手机端无“./ known_hosts”。




## 服务器配置

配置很简单,

- 安装所需组件: Python，Python-pip，git，tornado，paramiko；
- 安装webssh并运行。

### 1. CentOS

1. root用户登录；

3. 安装Python、pip、git；

   ```bash
   yum -y install python python-pip git
   ```

4. 安装paramiko、 tornado；

   ```bash
   pip install tornado paramiko
   ```

6. 安装webssh；

   ```bash
   cd ~
   git clone https://github.com/shlyren/webssh && cd webssh
   python setup.py install
   ```

   - 出现以下信息表示成功

     ```
     Using /usr/lib/python2.7/site-packages
     Finished processing dependencies for webssh==0.2.5
     ```

7. 安装nginx 代理webssh支持ssl，nginx的配置请自行Google；

7. 启动webssh服务；

   ```bash
   cd ~/webssh/
   bash start.sh
   ```

### 2. Ubuntu

1. root用户登录；

2. 安装Python、pip、git；

   ```bash
   apt update
   apt install python python-pip git
   ```

3. 安装paramiko、 tornado；

   ```bash
   pip install tornado paramiko
   ```

4. 安装webssh；

   ```bash
   cd ~
   git clone https://github.com/shlyren/webssh && cd webssh
   python setup.py install
   ```

   - 出现以下信息表示成功

     ```
     Using /usr/lib/python2.7/site-packages
     Finished processing dependencies for webssh==0.2.5
     ```

5. 安装nginx 代理webssh支持ssl，nginx的配置请自行Google；

6. 启动webssh服务；

   ```bash
   cd ~/webssh/
   bash start.sh
   ```

   ​