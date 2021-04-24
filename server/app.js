const WebSocket = require('ws');
const questions = require('./questions');
const wss = new WebSocket.Server({ port: 8080 });
const dispencer = require('./dispence');
const express = require('express');
const app = express();

app.use('/', express.static('dist/candyDis'));
app.listen(8085, '0.0.0.0');
let answer;

function noop() { }

function heartbeat() {
    this.isAlive = true;
}

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    if (wss.clients.size > 1) {
        ws.send(JSON.stringify('app in use'));
        ws.close();
    } else {
        questions.getRandomQuestion().then(res => {
            answer = res.correctAnswer;
            delete res.correctAnswer;
            ws.send(JSON.stringify(res));
            let time = 0;
            const int = setInterval(function () {
                time += 1;
                if (time >= 30) {
                    clearInterval(int);
                    ws.send(JSON.stringify('time\'s up'));
                    ws.close();
                }
            }, 1000);
        });
    }

    ws.on('message', function incoming(message) {
        message = JSON.parse(message);
        if (message.answer === answer) {
            const a = 'you won';
            ws.send(JSON.stringify(a));
            dispencer.start();
            ws.close();
        } else {
            const a = 'you lost';
            ws.send(JSON.stringify(a));
            ws.close();
        }
    });

    ws.on('close', function close() {
        clearInterval(interval);
    });
});

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping(noop);
    });
}, 5000);
