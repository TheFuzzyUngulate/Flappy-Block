const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Check URL of current request
  if (req.url == '/') {
    var filePath = path.join(__dirname, 'index.html');
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else if (req.url == '/styles.css') {
    var filePath = path.join(__dirname, 'styles.css');
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'text/css',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else if (req.url == '/init.js') {
    var filePath = path.join(__dirname, 'init.js');
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'text/javascript',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else if (req.url == '/favicon.ico') {
    var filePath = path.join(__dirname, 'favicon.ico');
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'image/x-icon',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } 
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});