const http = require('http');

const server = http.createServer((req, res) => {
    console.log('New Connection');
    res.end('Hello World - with yaml file!');
});
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log('Listening...'));