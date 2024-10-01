const http = require('http');
const { Worker, isMainThread, parentPort, workerData, threadId } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const url = require('url');

if (isMainThread) {
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        if (parsedUrl.pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
        } else if (parsedUrl.pathname === '/start') {
            const numWorkers = parseInt(parsedUrl.query.numWorkers) || 1;

            for (let i = 0; i < numWorkers; i++) {
                const workerNumbers = new Worker(__filename, { workerData: 'numbers' });
                const workerLetters = new Worker(__filename, { workerData: 'letters' });

                workerNumbers.on('message', (msg) => {
                    broadcast(`Numbers Thread | ${msg}`);
                });
                workerLetters.on('message', (msg) => {
                    broadcast(`Letters Thread | ${msg}`);
                });
            }

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Started ${numWorkers} workers! Check the webpage for output.`);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });

    const wss = new WebSocket.Server({ server });

    function broadcast(msg) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    }

    server.listen(3000, () => {
        console.log('Server running at http://localhost:3000');
    });
} else {
    if (workerData === 'numbers') {
        for (let i = 1; i <= 5; i++) {
            parentPort.postMessage(`Number: ${i} | Worker ID: ${threadId} | Time: ${new Date().toLocaleTimeString()}`);
            sleep(1000);
        }
    } else if (workerData === 'letters') {
        for (let letter of 'ABCDE') {
            parentPort.postMessage(`Letter: ${letter} | Worker ID: ${threadId} | Time: ${new Date().toLocaleTimeString()}`);
            sleep(1000);
        }
    }
}

function sleep(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) { }
}