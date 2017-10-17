var querySql = require("./querySql.js");
var copyFile = require("./copyFile.js");
var escapeSql = require('./escapeSql');

var EVENT_LOGIN_RES = 2004;
var EVENT_PAINT_LIST_RES = 2005;
var EVENT_QUIT_RES = 2006;

var DEFAULT_PAINTING = [305,307,232,316,317,320,321,260,323,309];

function User()
{
  var self = this;
  this.mainServiceInst = null;

  this.bind = function(service)
  {
    self.mainServiceInst = service;
  }
  this.login = function(ws,username,avatar)
  {
    self.avatar = avatar;
    username = escapeSql(username);
    querySql("SELECT * FROM pp_user WHERE username = "+username,function(err,result,field){
      if(result.length==0)
      {
        self.register(ws,username);
      }
      else
      {
        ws.id=result[0].id;
        ws.username = username;
        self.loginFinish(ws);
      }
    });
  }
  this.register = function(ws,username,avatar)
  {
    querySql('INSERT INTO pp_user(username) values('+username+')',function(err,result,field){
      ws.id=result.insertId;
      ws.username = username;
      self.loginFinish(ws);
      self.putDefaultPainting(ws);
    });
  }
  this.loginFinish = function(ws)
  {
    self.mainServiceInst.sendMsg(ws,EVENT_LOGIN_RES,ws.username);
    if(self.avatar!=null)self.saveAvatar(ws,self.avatar);
  }
  this.putDefaultPainting = function(ws)
  {
    for(var i=0;i<10;i++)
    {
      querySql('INSERT INTO pp_painting(width,height,bitmap) SELECT width,height,bitmap FROM pp_painting WHERE id ='+DEFAULT_PAINTING[i],function(err,result,field){
        var id = result.insertId;

        if(id!=null)
        {
          querySql("INSERT INTO pp_paint(painter_id,painting_id) VALUES("+ws.id+","+id+")");
        }

        copyFile(DEFAULT_PAINTING[i],id);
      });
    }
  }
  this.getPaintList = function(ws)
  {
    if(ws.id==null)return;
    querySql("SELECT pp_painting.id,pp_painting.width,pp_painting.height,pp_painting.bitmap FROM pp_paint LEFT JOIN pp_painting ON pp_painting.id = pp_paint.painting_id WHERE painter_id = "+ws.id +" ORDER BY pp_paint.id DESC ",function(err,result,field){
      self.mainServiceInst.sendMsg(ws,EVENT_PAINT_LIST_RES,result);
    });
  }
  this.join = function(ws,id)
  {
    if(ws.id==null)return;
    querySql("SELECT id FROM pp_paint WHERE painter_id = "+ws.id+" AND painting_id = "+id,function(err,result,field){
        if(result.length==0)
        {
          querySql("INSERT INTO pp_paint(painter_id,painting_id) VALUES("+ws.id+","+id+")");
        }
      });
  }
  this.quit = function(ws,id)
  {
    if(ws.id==null)return;
    querySql("DELETE FROM pp_paint WHERE  painter_id = "+ws.id+" AND painting_id = "+id,function(err,result,field)
    {
      self.mainServiceInst.sendMsg(ws,EVENT_QUIT_RES,"succeed");
    });
  }
  this.saveAvatar = function(ws,avatar)
  {
    if(ws.id==null)return;
    querySql("UPDATE pp_user SET avatar=\""+avatar+"\" WHERE id = "+ws.id);
  }
}

module.exports=User;