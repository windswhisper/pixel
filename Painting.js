var querySql = require("./querySql.js");
var escapeSql = require("./escapeSql.js");
var saveBitmap = require("./saveBitmap.js");

var EVENT_JOIN_RES = 2001;
var EVENT_DRAW_RES = 2002;
var EVENT_CREATE_RES = 2003;
var EVENT_AVATAR_RES = 2998;

var ORDER_TYPE_POINT = 1;
var ORDER_TYPE_LINE = 2;
var ORDER_TYPE_FILL = 3;

function Painting()
{
  var self = this;
  this.id = 0;
  this.painterList = [];
  this.bitmap = [];
  this.width = 64;
  this.height = 64;
  this.mainServiceInst = null;

  this.create = function(width,height,ws)
  {
    this.init(width,height);
    querySql('INSERT INTO pp_painting(width,height,bitmap) values('+width+','+height+',"'+self.encodeBitmap()+'")',function(err,result,field){
      if(result.length==0)
      {
        self.mainServiceInst.sendMsg(ws,EVENT_CREATE_RES,"error");
      }
      else
      {
        self.id=result.insertId;
        self.mainServiceInst.sendMsg(ws,EVENT_CREATE_RES,{id:self.id});
      }
    });
  }
  this.load=function(id,ws)
  {
    querySql('SELECT * FROM pp_painting WHERE id = '+id,function(err,result,field){
      if(result.length==0)
      {
        self.mainServiceInst.sendMsg(ws,2001,"error");
      }
      else
      {
        self.id = id;
        self.init(result[0].width,result[0].height);
        self.decodeBitmap(result[0].bitmap);
        self.onPainterJoin(ws);
      }
    });
  }
  this.save = function()
  {
    var str = self.encodeBitmap();
    str = str.replace('\\', '\\\\');
    querySql('UPDATE pp_painting SET bitmap = "'+str+'" WHERE id = '+self.id);
    saveBitmap(self.id,self.width,self.height,self.bitmap);
  }
  this.getPaintersAvatar = function()
  {
    if(self.painterList.length==0)return;
    var sqlCondition = "";
    for(var i=0;i<self.painterList.length;i++)
    {
      if(self.painterList[i].id)
      {
        sqlCondition+=" id = "+self.painterList[i].id;
        if(i!=self.painterList.length-1)
        {
          sqlCondition+=" OR";
        }
      }
    }
    querySql('SELECT avatar FROM pp_user WHERE '+sqlCondition,function(err,result,field){
      for(var i=0;i<self.painterList.length;i++)
      {
        self.mainServiceInst.sendMsg(self.painterList[i],EVENT_AVATAR_RES,result);
      }
    })
  }

  this.init=function(width,height)
  {
    self.width = width;
    self.height = height;
    for(var i=0;i<width;i++)
    {
      self.bitmap[i]=[];
      for(var j=0;j<height;j++)
      {
        self.bitmap[i][j]=0;
      }
    }
  }

  this.bind = function(service)
  {
    self.mainServiceInst = service;
  }

  this.drawPoint = function(x,y,color){
    if(color==null)
      {
        console.log("BUG:COLOR IS UNDEFINE");
        return;
      }
    if(x<self.width&&y<self.height&&x>=0&&y>=0)
    {
      this.bitmap[x][y] = color;
    }
  }

  this.drawLine = function(x1,y1,x2,y2,color)
  {
    var steep = (Math.abs(y2-y1)>Math.abs(x2-x1));
    var swap;
    if(steep)
    {
      swap = x1;
      x1 = y1;
      y1 = swap;
      swap = x2;
      x2 = y2;
      y2 = swap;
    }
    if(x1>x2)
    {
      swap = x1;
      x1 = x2;
      x2 = swap;
      swap = y1;
      y1 = y2;
      y2 = swap;
    }
    var dx = Math.abs(x2-x1);
    var dy = Math.abs(y2-y1);
    var p = 2*dy-dx;
    var const1 = 2*dy;
    var const2 = 2*(dy-dx);
    var x = x1;
    var y = y1;
    var inc = (y1<y2);

    while(x<=x2)
    {
      if(steep == 1)
        self.drawPoint(y,x);
      else
        self.drawPoint(x,y);
      x++;
      if(p<0)
        p+=const1;
      else
      {
        p+=const2;
        y+=inc;
      }
    }
  }

  this.fillColor = function(x,y,color)
  {
      self.spreadColor(x,y,color,self.bitmap[x][y]);
  }
  this.spreadColor = function(x,y,color,colorRepleced)
  {
    if(color==colorRepleced)return;

    self.bitmap[x][y] = color;

    if(x-1>=0&&self.bitmap[x-1][y]==colorRepleced)
    {
      self.spreadColor(x-1,y,color,colorRepleced);
    }
    if(x+1<self.width&&self.bitmap[x+1][y]==colorRepleced)
    {
      self.spreadColor(x+1,y,color,colorRepleced);
    }
    if(y-1>=0&&self.bitmap[x][y-1]==colorRepleced)
    {
      self.spreadColor(x,y-1,color,colorRepleced);
    }
    if(y+1<self.height&&self.bitmap[x][y+1]==colorRepleced)
    {
      self.spreadColor(x,y+1,color,colorRepleced);
    }
  }

  this.onPainterJoin = function(painter)
  {
    self.painterList[self.painterList.length] = painter;
    painter.painting = self;
    var bitmapData = {};
    bitmapData.width = self.width;
    bitmapData.height = self.height;
    bitmapData.bitmap = self.encodeBitmap();
    self.mainServiceInst.sendMsg(painter,EVENT_JOIN_RES,bitmapData);
    self.getPaintersAvatar();
  }

  this.onGetOrder = function(order,painter)
  {
    var orderListGet = order;
    self.parseOrderlist(orderListGet);
    for(var i=0;i<self.painterList.length;i++){
      if(self.painterList[i]!=painter)
        self.mainServiceInst.sendMsg(self.painterList[i],EVENT_DRAW_RES,JSON.stringify(order));
    }
  }

  this.parseOrderlist = function(orderListGet)
  {
    for(var i=0;i<orderListGet.length;i++)
    {
      var order = orderListGet[i];
      if(order.type==ORDER_TYPE_POINT)
        self.drawPoint(order.x,order.y,self.decodeColor( order.color));
      else if(order.type==ORDER_TYPE_LINE)
        self.drawLine(order.x1,order.y1,order.x2,order.y2,self.decodeColor( order.color));
      else if(order.type==ORDER_TYPE_FILL)
        self.fillColor(order.x,order.y,self.decodeColor(order.color));
    }
  }

  this.onPainterLeave = function(painter)
  {
    for(var i=0;i<self.painterList.length;i++){
      if(self.painterList[i] == painter) self.painterList.splice(i,1);
    }
    painter.painting = null;
    self.save();
    self.getPaintersAvatar();
  }

  this.encodeBitmap = function()
  {
    var str = "";
    for(var j=0;j<self.height;j++)
        for(var i=0;i<self.width;i++)
        {
          if(self.bitmap[i][j]!=-9)
          str+=self.encodeColor(self.bitmap[i][j]);
        }
    return str+"0";
  }
  this.decodeBitmap = function(str)
  {
    for(var i=0;i<self.width;i++)
        for(var j=0;j<self.height;j++)
        {
          self.bitmap[i][j] = self.decodeColor(str,j*self.width+i);
        }
  }
  this.encodeColor = function(color)
  {
    return String.fromCharCode(color+48);
  }

  this.decodeColor = function(str,index)
  {
    if(index==null)index = 0;
    return str.charCodeAt(index)-48;
  }
}

module.exports=Painting;