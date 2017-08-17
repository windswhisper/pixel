var Painting = require("./Painting.js");

var EVENT_JOIN = 1001;
var EVENT_DRAW = 1002;

var mainServiceInst = null;

function MainService()
{
  var self = this;
  this.userList = [];
  this.paintingList = [];

  this.init = function(server)
  {
    server.on('connection',function(ws){
      self.onUserConnect(ws);
    });
    self.paintingList[0] = new Painting();
    self.paintingList[0].init(64,64);
    self.paintingList[0].bind(self);
  }

  this.onUserConnect = function(ws)
  {
    self.userList[self.userList.length]=ws;
    ws.on("message",function(data){
        self.onMessage(ws,data);
      }
    );
    ws.on('close',function(){
      self.onUserClose(ws);
    });
  }

  this.onMessage = function(ws,data)
  {
    var obj = JSON.parse(data);
    switch(obj.event)
    {
      case 1001:
        var index = obj.index;
        self.paintingList[index].onPainterJoin(ws);
        break;
      case 1002:
        ws.painting.onGetOrder(obj.order,ws);
        break;
    }
  }

  this.sendMsg = function(ws,event,data)
  {
    var obj = {};
    obj.event = event;
    obj.data = data;
    ws.send(JSON.stringify(obj));
  }

  this.onUserClose = function(ws)
  {
    if(ws.painting!=null)
      ws.painting.onPainterLeave(ws);
    for(var i=0;i<self.userList.length;i++){
      if(self.userList[i] == ws) self.userList.splice(i,1);
    }
  }
}

module.exports.getInstance = function()
  {
    if(mainServiceInst==null)
    {
      mainServiceInst = new MainService();
    }
    return mainServiceInst;
  }
  