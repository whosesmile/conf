######## 会畅通讯商会云会议中心  by lovemoon@yeah.net ########

1.SVN地址
https://v2.svnspot.com/lovemoon.meeting/trunk

2.nginx config
# 端口你看着改 要是被其他程序占用的话

server {
  listen       80;
  server_name  localhost;
  autoindex on;
  ssi  on;
  client_max_body_size 2048m;
  
  location /assets/ {
    alias F:/meettings/src/;
  }
  
  location / {
    alias F:/meettings/src/;
  }
}

# thie line is test2