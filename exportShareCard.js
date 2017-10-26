var images = require('images');


function exportShareCard(id,key) {
  var bgId = Math.floor(Math.random()*15)+1;
  var FIX_SIZE = 192;
	var res = images(790,1061).fill(255,255,255);
  var image = images("pic/"+id+".png").resize(586,586);
  var info = images("bg/pic_bg_"+bgId+".png");
  res.draw(info,0,0);
  res.draw(image,101,99);
  res.save("pic/temp"+key+".jpg");
}

module.exports = exportShareCard;


