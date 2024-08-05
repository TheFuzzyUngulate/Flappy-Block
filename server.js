const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Check URL of current request
  if (req.url == '/' && req.method == 'GET') {
    var filePath = path.join(__dirname, 'index.html');
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else if (req.url == '/styles.css' && req.method == 'GET') {
    var filePath = path.join(__dirname, 'styles.css');
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'text/css',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else if (req.url == '/init.js' && req.method == 'GET') {
    var filePath = path.join(__dirname, 'init.js');
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'text/javascript',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else if (req.url == '/favicon.ico' && req.method == 'GET') {
    var filePath = path.join(__dirname, 'favicon.ico');
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'image/x-icon',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else if (req.url == '/scores') {
    var filePath = path.join(__dirname, 'scores.txt');
    if (req.method == 'GET') {
      var stat = fs.statSync(filePath);
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-Length': stat.size
      });
      var readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } else if (req.method == 'POST') {
      var body = '';
      req.on('data', (data) => {
        body += data;
      });
      req.on('end', () => {
        fs.writeFile(filePath, body, () => {
          res.writeHead(200, {
            'Content-Type': 'text/html'
          });
          res.end('received new scores.');
        });
      });
    }
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});