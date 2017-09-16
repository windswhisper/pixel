var ws = require('ws').Server;
var server = new ws({port:80});
var MainService = require('./MainService.js');

var mainService = MainService.getInstance();
mainService.init(server);

var http = require('http');
var fs   = require("fs");

http.createServer(function (request, response) {
  //response.writeHead(200, {'Content-Type': 'text/html'});
  var url = request.url;
  fs.readFile(url.slice(1),function (err,data){
                response.end(data);
            });
}).listen(2000);