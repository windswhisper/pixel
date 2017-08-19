var mysql = require('mysql');

function escape(parame) {
	return mysql.escape(parame);
}
module.exports = escape;
