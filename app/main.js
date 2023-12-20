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
    if (path === '/')
      socket.write('HTTP/1.1 200 OK\\r\\n\\r\\n');
    else
      socket.write('HTTP/1.1 404 Not Found\\r\\n\\r\\n');
    socket.destroySoon();
  })
});

server.listen(4221, "localhost");
