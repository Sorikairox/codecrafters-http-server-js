const net = require("net");

function writeBody(socket, stringToDisplay) {
  socket.write('HTTP/1.1 200 OK\r\n');
  socket.write('Content-Type: text/plain\r\n');
  socket.write(`Content-Length: ${stringToDisplay.length}\r\n`);
  socket.write('\r\n');
  socket.write(`${stringToDisplay}`);
}

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    // server.close();
  });

  socket.on('error', () => {

  });

  socket.on('data', (data) => {
    const text = data.toString();
    const [info, ...headers] = text.split('\n');
    const [verb, path, version] = info.split(' ');
    const [command, ...thingToDisplay] = path.split('/').filter(s => s.length !== 0);
    if (!command || command.length === 0)
      socket.write('HTTP/1.1 200 OK\r\n\r\n');
    else if (command === 'echo') {
      const stringToDisplay = thingToDisplay.join('/');
      writeBody(socket, stringToDisplay);
    } else if (command === 'user-agent') {
      let stringToDisplay = '';

      for (const header of headers) {
        if (header.toLowerCase().startsWith('user-agent')) {
          const [_, ...values] = header.split(':');
          const value = values.join(':');
          stringToDisplay += value;
        }
      }
      writeBody(socket, stringToDisplay);
    }
    else
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
  })
  socket.pipe(socket);
});

server.listen(4221, "localhost");
