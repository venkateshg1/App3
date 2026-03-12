const http = require('http');

const server = http.createServer((req, res) => {
  res.end("Hello from EKS DevOps Pipeline!");
});

server.listen(3000);
