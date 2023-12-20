const net = require("net");

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.write('HTTP/1.1 200 OK\\r\\n\\r\\n');
  socket.pipe(socket);
});

server.listen(4221, "localhost");
