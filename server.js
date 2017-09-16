var ws = require('ws').Server;
//var server = new ws({port:80});
var MainService = require('./MainService.js');



var https=require('https');
var ws=require('ws');
var fs=require('fs');
 
var options = {
  key: "denghao",
  cert: "senlinshidai",
};
 
var server=https.createServer(options, function (req, res) {//要是单纯的https连接的话就会返回这个东西
    res.writeHead(403);//403即可
    res.end("This is a  WebSockets server!\n");
}).listen(80);
 
 
var wss = new ws.Server( { server: server } );//把创建好的https服务器丢进websocket的创建函数里，ws会用这个服务器来创建wss服务
//同样，如果丢进去的是个http服务的话那么创建出来的还是无加密的ws服务
wss.on( 'connection', function ( wsConnect ) {
    wsConnect.on( 'message', function ( message ) {
        console.log( message );
    });
});

var mainService = MainService.getInstance();
mainService.init(wss);



var http = require('http');
var fs   = require("fs");



http.createServer(function (request, response) {
  //response.writeHead(200, {'Content-Type': 'text/html'});
  var url = request.url;
  fs.readFile(url.slice(1),function (err,data){
                response.end(data);
            });
}).listen(2000);