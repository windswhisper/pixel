var fs=require("fs");

function copyFile(id,newId){
  var fs = require('fs');
  fs.readFile("pic/"+id+".png", 'utf-8', function(err, data) {
    if (err) {
      console.log("读取失败");
    } else {
      writeFile(newFileName,data);
      return data;
    }
  });
}
 
function writeFile(newId,data){
  fs.writeFile("pic/"+newId+".png",data,'utf8',function(error){
    if(error){
      throw error;
    }else{
      console.log("文件已保存");  
    }
  });
}

module.exports = copyFile();