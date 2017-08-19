var mysql = require('mysql');

var username = '1479298452884f28a43b6fdc9c4b2a5b';//用户AK
var password = '64db8241be6d4d7c87f343841b2da2a1';//用户SK
var db_host = 'sqld.duapp.com';
var db_port = 4050;
var db_name = 'rrXJBgFdMAUpwQFvymZr';
var option = {
  host: db_host,
  port: db_port,
  user: username,
  password: password,
  database: db_name
}

var pool = mysql.createPool(option);

//连接数据库
function query(sql, callback) {
  console.log(sql);
	pool.getConnection(function(err,conn){  
        if(err){  
            console.log(err);  
        }else{  
            conn.query(sql,function(qerr,result,fields){  
            	conn.release();  
              if(qerr) 
                console.log(qerr);  
              else
              {
                if(callback)
                  callback(qerr,result,fields);  
              }
            	  
            });  
        }  
    });  
}
module.exports = query
