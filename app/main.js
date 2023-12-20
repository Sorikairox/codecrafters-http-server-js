const net = require("net");

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    // server.close();
  });

  socket.on('data', (data) => {
    const text = data.toString();
    const [info, ...others] = text.split('\n');
    const [verb, path, version] = info.split(' ');
    const pathComponents = path.split('/');
    if (pathComponents.length === 0)
      socket.write('HTTP/1.1 200 OK\\r\\n\\r\\n');
    else if (pathComponents[0] === 'echo') {
      socket.write('HTTP/1.1 200 OK\\r\\n\\r\\n');
      socket.write('Content-Type: text/plain\\r\\n\\r\\n');
      socket.write(`Content-Length: ${pathComponents[1].length}: text/plain\\r\\n\\r\\n`);
      socket.write('\\r\\n\\r\\n');
      socket.write(`${pathComponents[1]}\\r\\n\\r\\n`);
    }
    else
      socket.write('HTTP/1.1 404 Not Found\\r\\n\\r\\n');
  })
  socket.pipe(socket);
});

server.listen(4221, "localhost");
