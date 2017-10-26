var images = require('images');


function exportShareCard(id) {
  var FIX_SIZE = 192;
	var res = images(790,1200).fill(255,255,255);
  var image = images("pic/"+id+".png").resize(586,586);
  var info = images("pic/info.png");
  res.draw(info,0,0);
  res.draw(image,101,99);
  res.save("pic/temp.jpg");
}

module.exports = exportShareCard;


