var images = require('images');

var COLOR = [
  "#ffffff", "#fafafa", "#eeeeee", "#bdbdbd", "#9e9e9e", "#757575", "#424242", "#000000",
  "#fde0dc", "#f9bdbb", "#f69988", "#f36c60", "#e52c23", "#dd191d", "#c41411", "#b0120a",
  "#fff3e0", "#ffe0b2", "#ffcc80", "#ffb74d", "#ff9800", "#fb8c00", "#ef6c00", "#e65100",
  "#fffde7", "#fff9c4", "#fff59d", "#fff176", "#ffeb3b", "#fdd835", "#f9a825", "#f57f17",
  "#d0f8ce", "#a3e9a4", "#72d572", "#42bd41", "#259b24", "#0a8f08", "#056f00", "#0d5302",
  "#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#009688", "#00897b", "#00695c", "#004d40",
  "#e1f5fe", "#b3e5fc", "#4fc3f7", "#03a9f4", "#039be5", "#0288d1", "#0277bd", "#01579b",
  "#f3e5f5", "#e1bee7", "#ce93d8", "#ba68c8", "#9c27b0", "#8e24aa", "#6a1b9a", "#4a148c"
];

function getColor255(colorStr)
{
	var r16 = colorStr.substring(1,3);
	var r10 = parseInt(r16,16); 
	var g16 = colorStr.substring(3,5);
	var g10 = parseInt(g16,16); 
	var b16 = colorStr.substring(5,7);
	var b10 = parseInt(b16,16);  
	return {r:r10,g:g10,b:b10};
}


function saveBitmap(id,width,height,bitmap) {
  var FIX_SIZE = 768;
	var w = Math.floor(FIX_SIZE/width);
	var block = images(w,w);
  FIX_SIZE=w*width;
  var res = images(FIX_SIZE,FIX_SIZE);
  var str = "";
    for(var j=0;j<height;j++)
        for(var i=0;i<width;i++)
        {
        	var code = bitmap[i][j];
          console.log(code+'i'+'j');
          if(code==null)code = 0;
          if(code<0||code>=64)code = 0;
        	var color = getColor255(COLOR[code]);
        	block.fill(color.r,color.g,color.b);
        	res.draw(block,i*w,j*w);
        }
    res.save("pic/"+id+".png");
}

module.exports = saveBitmap;


