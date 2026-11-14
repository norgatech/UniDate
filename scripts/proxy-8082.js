const http = require('http');

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: 8081,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:8081' },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err.message);
  });
});

server.on('upgrade', (req, socket, head) => {
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: 8081,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:8081' },
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    let headersStr = `HTTP/${proxyRes.httpVersion} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`;
    for (const [key, val] of Object.entries(proxyRes.headers)) {
      if (Array.isArray(val)) {
        val.forEach((v) => { headersStr += `${key}: ${v}\r\n`; });
      } else if (val !== undefined) {
        headersStr += `${key}: ${val}\r\n`;
      }
    }
    headersStr += '\r\n';
    socket.write(headersStr);
    if (proxyHead && proxyHead.length) {
      socket.write(proxyHead);
    }
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(8082, '0.0.0.0', () => {
  console.log('Proxy active on http://localhost:8082 -> http://localhost:8081');
});

