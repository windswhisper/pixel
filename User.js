var querySql = require("./querySql.js");
var escapeSql = require('./escapeSql');

var EVENT_LOGIN_RES = 2004;
var EVENT_PAINT_LIST_RES = 2005;

function User()
{
  var self = this;
  this.mainServiceInst = null;

  this.bind = function(service)
  {
    self.mainServiceInst = service;
  }
  this.login = function(ws,username)
  {
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
  this.register = function(ws,username)
  {
    querySql('INSERT INTO pp_user(username) values('+username+')',function(err,result,field){
      ws.id=result.insertId;
      ws.username = username;
        self.loginFinish(ws);
    });
  }
  this.loginFinish = function(ws)
  {
    self.mainServiceInst.sendMsg(ws,EVENT_LOGIN_RES,"succeed");
  }
  this.getPaintList = function(ws)
  {
    querySql("SELECT pp_painting.id,pp_painting.width,pp_painting.height,pp_painting.bitmap FROM pp_paint LEFT JOIN pp_painting ON pp_painting.id = pp_paint.painting_id WHERE painter_id = "+ws.id,function(err,result,field){
      self.mainServiceInst.sendMsg(ws,EVENT_PAINT_LIST_RES,result);
    });
  }
}

module.exports=User;