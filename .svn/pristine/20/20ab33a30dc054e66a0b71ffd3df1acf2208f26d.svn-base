
var ORDER_TYPE_POINT = 1;
var ORDER_TYPE_LINE = 2;
var ORDER_TYPE_FILL = 3;

function Painting()
{
  var self = this;
  this.painterList = [];
  this.bitmap = [];
  this.width = 8;
  this.height = 8;
  this.mainServiceInst = null;

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
    console.log(x+y+color);
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

  }

  this.onPainterJoin = function(painter)
  {
    self.painterList[self.painterList.length] = painter;
    painter.painting = self;
    var bitmapData = {};
    bitmapData.width = self.width;
    bitmapData.height = self.height;
    bitmapData.bitmap = self.encodeBitmap();
    self.mainServiceInst.sendMsg(painter,2001,bitmapData);
  }

  this.onGetOrder = function(order,painter)
  {
    var orderListGet = order;
    self.parseOrderlist(orderListGet);
    for(var i=0;i<self.painterList.length;i++){
      if(self.painterList[i]!=painter)
        self.mainServiceInst.sendMsg(self.painterList[i],2002,JSON.stringify(order));
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
        self.fillColor(order.x,order.y,order.color);
    }
  }

  this.onPainterLeave = function(painter)
  {
    for(var i=0;i<self.painterList.length;i++){
      if(self.painterList[i] == painter) self.painterList.splice(i,1);
    }
    painter.painting = null;
  }

  this.encodeBitmap = function()
  {
    var str = "";
    for(var j=0;j<self.height;j++)
        for(var i=0;i<self.width;i++)
        {
          str+=self.encodeColor(self.bitmap[i][j]);
        }
    return str;
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
    return str.charCodeAt(index)-48;
  }
}

module.exports=Painting;