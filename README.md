######## 会畅通讯商会云会议中心  by lovemoon@yeah.net ########

1.git
https://github.com/whosesmile/conf.git

2.查看效果：
  方式1：配置本机nginx

    server {
      listen       80;
      server_name  localhost;
      autoindex on;
      ssi  on;
      client_max_body_size 2048m;
      
      location /assets/ {
        alias /Users/smilelegend/myworks/confcloud/src/;
      }
      
      location / {
        alias /Users/smilelegend/myworks/confcloud/src/;
      }
    }
    
  方式2：
  1.安装nodejs
  2.进入工程跟目录，依次运行

    npm install grunt-cli -g
    npm install
    grunt

    PS：前两条命令只需运行一次，grunt是启动node web服务器

