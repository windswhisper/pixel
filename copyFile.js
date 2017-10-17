var fs=require("fs");

function writeFile(newId,data){
  fs.writeFile("pic/"+newId+".png",data,'utf8',function(error){
    if(error){
      throw error;
    }else{
      console.log("save succeed");  
    }
  });
}

function copyFile(id,newId){
  var fs = require('fs');
  console.log("copy"+id+"-"+newId);
  fs.readFile("pic/"+id+".png", 'utf-8', function(err, data) {
    if (err) {
      console.log("read fail");
    } else {
      writeFile(newId,data);
      return data;
    }
  });
}
 

module.exports = copyFile;