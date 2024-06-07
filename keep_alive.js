var http = require('http');

http.createServer(function (req, res) {
    res.write('Server is running');
    res.end();
}).listen(8080);