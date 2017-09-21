/*var http = require('http');
var fs   = require("fs");



var httpServer = http.createServer(function (request, response) {
  //response.writeHead(200, {'Content-Type': 'text/html'});
  var url = request.url;
  fs.readFile(url.slice(1),function (err,data){
                response.end(data);
            });
}).listen(80);

var ws = require('ws').Server;
var server = new ws({server:httpServer});
*/var MainService = require('./MainService.js');


var https=require('https');
var ws=require('ws');
var fs=require('fs');
var keypath='x/ssl.key';//我把秘钥文件放在运行命令的目录下测试
var certpath='x/ssl.crt';//console.log(keypath);
//console.log(certpath);
 
var options = {
  key: fs.readFileSync(keypath),
  cert: fs.readFileSync(certpath),
};
 
 
var server=https.createServer(options, function (req, res) {//要是单纯的https连接的话就会返回这个东西 var url = request.url;
  
  var url = req.url;
  fs.readFile(url.slice(1),function (err,data){
                response.end(data);
            });
}).listen(443);
 
 
var wss = new ws.Server( { server: server } );//把创建好的https服务器丢进websocket的创建函数里，ws会用这个服务器来创建wss服务
//同样，如果丢进去的是个http服务的话那么创建出来的还是无加密的ws服务


var mainService = MainService.getInstance();
mainService.init(wss);

