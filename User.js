var querySql = require("./querySql.js");
var copyFile = require("./copyFile.js");
var escapeSql = require('./escapeSql');
var saveBitmap = require("./saveBitmap.js");

var EVENT_LOGIN_RES = 2004;
var EVENT_PAINT_LIST_RES = 2005;
var EVENT_QUIT_RES = 2006;
var EVENT_COPY_RES = 2008;
var EVENT_PUBLISH_RES = 2009;
var EVENT_WORK_LIST_RES = 2010;
var EVENT_WORK_LIST_RATE_RES = 2011;
var EVENT_COPY_WORK_RES = 2014;

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
    if(avatar=="##none")
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
      var default_id = DEFAULT_PAINTING[i];
      var callback = function(err,result,field){
        var id = result.insertId;
        if(id!=null)
        {
          querySql("INSERT INTO pp_paint(painter_id,painting_id) VALUES("+ws.id+","+id+")");
          copyFile(arguments.callee.default_id,id);
        }
      }
      callback.default_id = default_id;
      querySql('INSERT INTO pp_painting(width,height,bitmap) SELECT width,height,bitmap FROM pp_painting WHERE id ='+default_id,callback);
    }
  }
  this.getPaintList = function(ws)
  {
    querySql("SELECT pp_painting.id FROM pp_paint LEFT JOIN pp_painting ON pp_painting.id = pp_paint.painting_id WHERE painter_id = "+ws.id +" ORDER BY pp_paint.id DESC ",function(err,result,field){
      self.mainServiceInst.sendMsg(ws,EVENT_PAINT_LIST_RES,result);
    });
  }
  this.copyPainting = function(ws,id)
  {
    querySql('INSERT INTO pp_painting(width,height,bitmap) SELECT width,height,bitmap FROM pp_painting WHERE id = '+id,function(err,result,field){
      if(result.length==0)
      {
        self.mainServiceInst.sendMsg(ws,EVENT_COPY_RES,"error");
      }
      else
      {
        querySql("INSERT INTO pp_paint(painter_id,painting_id) VALUES("+ws.id+","+result.insertId+")");
        self.mainServiceInst.sendMsg(ws,EVENT_COPY_RES,{id:result.insertId});
          copyFile(id,result.insertId);
      }
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
    if(avatar.length==0)return;
    querySql("UPDATE pp_user SET avatar=\""+avatar+"\" WHERE id = "+ws.id);
  }
  this.getWorkList = function(ws)
  {
    querySql("SELECT pp_work.id,pp_like.work_id,pp_work.like_count FROM pp_work LEFT OUTER JOIN pp_like on pp_work.id=pp_like.work_id AND pp_like.user_id="+ws.id+"  ORDER BY pp_work.id DESC LIMIT 0,50",function(err,result,field){
        self.mainServiceInst.sendMsg(ws,EVENT_WORK_LIST_RES,result);
    });
  }
  this.getWorkListByRating = function(ws)
  {
    querySql("SELECT pp_work.id,pp_like.work_id,pp_work.like_count FROM pp_work LEFT OUTER JOIN pp_like on pp_work.id=pp_like.work_id AND pp_like.user_id="+ws.id+" ORDER BY pp_work.like_count DESC LIMIT 0,50",function(err,result,field){
        self.mainServiceInst.sendMsg(ws,EVENT_WORK_LIST_RATE_RES,result);
    });
  }
  this.publishWork = function(ws)
  {
    if(ws==null||ws.painting==null)return;
    querySql("SELECT * FROM pp_painting WHERE id="+ws.painting.id,function(err,result,field){
      if(result.length>0)
      {
        querySql('INSERT INTO pp_work(width,height,bitmap,artist_id) VALUES('+result[0].width+','+result[0].height+',"'+result[0].bitmap+'",'+ws.id+')',function(err2,result2,field2){
          if(!result2.insertId)
          {
            self.mainServiceInst.sendMsg(ws,EVENT_PUBLISH_RES,"error");
          }
          else
          {
            self.mainServiceInst.sendMsg(ws,EVENT_PUBLISH_RES,"succeed");
            saveBitmap("w"+result2.insertId,result[0].width,result[0].height,ws.painting.bitmap);
          }
        });
      }
    });
  }
  this.like = function(ws,workId){
    querySql("UPDATE pp_work SET like_count=like_count+1 WHERE id="+workId);
    querySql("INSERT INTO pp_like(work_id,user_id) VALUES("+workId+","+ws.id+")");
  }
  this.unlike = function(ws,workId)
  {
    querySql("UPDATE pp_work SET like_count=like_count-1 WHERE id="+workId);
    querySql("DELETE FROM pp_like WHERE work_id="+workId+" AND user_id="+ws.id);
  }
  this.copyWork = function(ws,workId)
  {
    querySql('INSERT INTO pp_painting(width,height,bitmap) SELECT width,height,bitmap FROM pp_work WHERE id = '+workId,function(err,result,field){
      if(result.length==0)
      {
        self.mainServiceInst.sendMsg(ws,EVENT_COPY_WORK_RES,"error");
      }
      else
      {
        self.mainServiceInst.sendMsg(ws,EVENT_COPY_WORK_RES,{id:result.insertId});
        copyFile("w"+workId,result.insertId);
      }
    });
  }
}

module.exports=User;