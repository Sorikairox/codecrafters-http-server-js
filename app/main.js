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
    const [command, ...thingToDisplay] = path.split('/').filter(s => s.length !== 0);
    if (!command || command.length === 0)
      socket.write('HTTP/1.1 200 OK\\r\\n\\r\\n');
    else if (command === 'echo') {
      const stringToDisplay = thingToDisplay.join('/');
      socket.write('HTTP/1.1 200 OK\\r\\n\\r\\n');
      socket.write('Content-Type: text/plain\\r\\n\\r\\n');
      socket.write(`Content-Length: ${stringToDisplay.length}: text/plain\\r\\n\\r\\n`);
      socket.write('\\r\\n\\r\\n');
      socket.write(`${stringToDisplay}\\\\r\\\\n\\\\r\\\\n'`);
    }
    else
      socket.write('HTTP/1.1 404 Not Found\\r\\n\\r\\n');
  })
  socket.pipe(socket);
});

server.listen(4221, "localhost");
