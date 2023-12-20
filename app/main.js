const net = require("net");
const fs = require("fs");

const directoryPath = process.argv[3];

function writeBody(socket, body, contentType = 'text/plain') {
  socket.write('HTTP/1.1 200 OK\r\n');
  socket.write(`Content-Type: ${contentType}\r\n`);
  socket.write(`Content-Length: ${body.length}\r\n`);
  socket.write('\r\n');
  socket.write(`${body}`);
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
    const [command, ...pathFragments] = path.split('/').filter(s => s.length !== 0);
    if (!command || command.length === 0)
      socket.write('HTTP/1.1 200 OK\r\n\r\n');
    else if (command === 'echo') {
      const stringToDisplay = pathFragments.join('/');
      writeBody(socket, stringToDisplay);
    } else if (command === 'user-agent') {
      let stringToDisplay = '';
      for (const header of headers) {
        if (header.toLowerCase().startsWith('user-agent')) {
          const [_, ...values] = header.split(':');
          const value = values.join(':');
          stringToDisplay += value.trim();
        }
      }
      writeBody(socket, stringToDisplay);
    } else if (command === 'files') {
      const filename = pathFragments.join('/');
      try {
        const data = fs.readFileSync(directoryPath + '/' + filename);
        writeBody(socket, data, 'application/octet-stream');
      } catch (e) {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      }
    }
    else
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
  })
  socket.pipe(socket);
});

server.listen(4221, "localhost");
