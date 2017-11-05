var Painting = require("./Painting.js");
var User = require("./User.js");
var https = require('https');

var EVENT_JOIN = 1001;
var EVENT_DRAW = 1002;
var EVENT_CREATE = 1003;
var EVENT_LOGIN = 1004;
var EVENT_PAINT_LIST = 1005;
var EVENT_QUIT = 1006;
var EVENT_SAVE = 1007;
var EVENT_COPY = 1008;
var EVENT_PUBLISH = 1009;
var EVENT_WORK_LIST = 1010;
var EVENT_WORK_LIST_RATE = 1011;
var EVENT_LIKE = 1012;
var EVENT_UNLIKE = 1013;
var EVENT_COPY_WORK = 1014;

var EVENT_LOGIN_WX = 1999;
var EVENT_AVATAR = 1998;
var EVENT_SHARE = 1997;

var EVENT_BLANK = 0;

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
        if(ws.painting!=null)
          ws.painting.onPainterLeave(ws);

        var index = obj.index;
        var painting = self.getPaintingById(index);
        if(painting==null)
          painting = self.loadPainting(index,ws);
        else
        {
          painting.onPainterJoin(ws);
          self.userService.join(ws,index);
        }
        break;
      case EVENT_DRAW:
        if(ws.painting!=null)
          ws.painting.onGetOrder(obj.order,ws);
        break;
      case EVENT_CREATE:
        var painting = self.createPainting(obj.width,obj.height,ws);
        break;
      case EVENT_LOGIN:
        self.userService.login(ws,obj.username);
        break;
      case EVENT_PAINT_LIST:
        self.userService.getPaintList(ws,obj.username);
        break;
      case EVENT_QUIT:
        self.userService.quit(ws,obj.index);
        break;
      case EVENT_SAVE:
        if(ws.painting!=null)
          ws.painting.save();
        break;
      case EVENT_COPY:
        self.userService.copyPainting(ws,obj.index);
        break;
      case EVENT_PUBLISH:
        self.userService.publishWork(ws);
        break;
      case EVENT_WORK_LIST:
        self.userService.getWorkList(ws);
        break;
      case EVENT_WORK_LIST_RATE:
        self.userService.getWorkListByRating(ws);
        break;
      case EVENT_LIKE:
        self.userService.like(ws,obj.index);
        break;
      case EVENT_UNLIKE:
        self.userService.unlike(ws,obj.index);
        break;
      case EVENT_COPY_WORK:
        self.userService.copyWork(ws,obj.index);
        break;

      case EVENT_LOGIN_WX:
        self.getWxUserId(ws,obj.code,obj.avatar);
        break;
      case EVENT_AVATAR:
        ws.painting.getPaintersAvatar(ws);
        break;
      case EVENT_SHARE:
        ws.painting.exportShareCard(obj.key);
        break;

      case EVENT_BLANK:
        self.sendMsg(ws,EVENT_BLANK,0);
        break;
    }
  }

  this.sendMsg = function(ws,event,data)
  {

    if(ws.readyState != ws.OPEN){
      if(ws.painting!=null)
        ws.painting.onPainterLeave(ws);
      return
    }
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

  this.getWxUserId = function(ws,code,avatar)
  {
    var APPID = "wx58915838e443eef9";
    var SECRET = "18630c37d49823657ce2cf1c23647251";
    var url = "https://api.weixin.qq.com/sns/jscode2session?appid="+APPID+"&secret="+SECRET+"&js_code="+code+"&grant_type=authorization_code";
    https.get(url, (res) => {
    res.on('data', (d) => {
        var data = JSON.parse(d.toString());
        self.userService.login(ws,data.openid,avatar);
      });

    }).on('error', (e) => {

      });
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
  