var images = require('images');


function exportShareCard(id) {
  var FIX_SIZE = 192;
	var res = images(790,1200).fill(255,255,255);
  var image = images("pic/"+id+".png").resize(750,750);
  var info = images("pic/info.png");
  res.draw(image,20,20);
  res.draw(info,20,790);
  res.save("pic/temp.jpg");
}

module.exports = exportShareCard;


