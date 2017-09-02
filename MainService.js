var Painting = require("./Painting.js");
var User = require("./User.js");

var EVENT_JOIN = 1001;
var EVENT_DRAW = 1002;
var EVENT_CREATE = 1003;
var EVENT_LOGIN = 1004;
var EVENT_PAINT_LIST = 1005;

var mainServiceInst = null;

function MainService()
{
  var self = this;
  this.userList = [];
  this.paintingList = [];
  this.userService = new User();

  this.init = function(server)
  {
    self.userService.bind(self);
    server.on('connection',function(ws){
      self.onUserConnect(ws);
    });
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
      case EVENT_JOIN:
        var index = obj.index;
        var painting = self.getPaintingById(index);
        if(painting==null)
          painting = self.loadPainting(index,ws);
        else
          painting.onPainterJoin(ws);
        self.userService.join(ws,index);
        break;
      case EVENT_DRAW:
        ws.painting.onGetOrder(obj.order,ws);
        break;
      case EVENT_CREATE:
        var painting = self.createPainting(64,64,ws);
        break;
      case EVENT_LOGIN:
        self.userService.login(ws,obj.username);
        break;
      case EVENT_PAINT_LIST:
        self.userService.getPaintList(ws,obj.username);
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

  this.createPainting = function(width,height,ws)
  {
    var paint = new Painting();
    paint.bind(self);
    self.paintingList[self.paintingList.length] = paint;
    paint.create(width,height,ws);
    return paint;
  }

  this.loadPainting = function(id,ws)
  {
    var paint = new Painting();
    paint.load(id,ws);
    paint.bind(self);
    self.paintingList[self.paintingList.length] = paint;
    return paint;
  }

  this.getPaintingById = function(id)
  {
    for(var i=0;i<self.paintingList.length;i++)
    {
      if(self.paintingList[i].id==id)return self.paintingList[i];
    }
    return null;
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
  