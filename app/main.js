const net = require("net");
const fs = require("fs");

const directoryPath = process.argv[3];

function writeBody(socket, body, options = { code: 200, contentType: 'text/plain'}) {
  socket.write(`HTTP/1.1 ${options.code} OK\r
`);
  socket.write(`Content-Type: ${options.contentType}\r\n`);
  socket.write(`Content-Length: ${body.length}\r\n`);
  socket.write('\r\n');
  if (body.length > 0)
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
    const request = data.toString();
    const splitRequest = request.split('\r\n');
    const bodyStart = splitRequest.findIndex(s => s === '') + 1;
    const [info, ...headers] = splitRequest.splice(0, bodyStart);
    const body = splitRequest.join('\n');
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
      if (verb === 'GET') {
        const filename = pathFragments.join('/');
        try {
          const data = fs.readFileSync(directoryPath + '/' + filename);
          writeBody(socket, data, { code: 200, contentType: 'application/octet-stream' });
        } catch (e) {
          socket.write('HTTP/1.1 404 Not Found\r\n');
          socket.write(`Content-Type: text/plain\r\n`);
          socket.write(`Content-Length: 0\r\n`);
          socket.write('\r\n');
        }
      } else {
        const filename = pathFragments.join('/');
        fs.writeFileSync(directoryPath + '/' + filename, body);
        writeBody(socket, '', { code: 201, contentType: 'text/plain' });
      }
    }
    else {
      socket.write('HTTP/1.1 404 Not Found\r\n');
      socket.write(`Content-Type: text/plain\r\n`);
      socket.write(`Content-Length: 0\r\n`);
      socket.write('\r\n');
    }
  })
  socket.pipe(socket);
});

server.listen(4221, "localhost");
