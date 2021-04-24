const { Gpio } = require('onoff');
const dispencerPin = new Gpio('4', 'out');

const start = () => {
    dispencerPin.writeSync(1);
    setTimeout(() => {
        dispencerPin.writeSync(0);
    }, 2000);
}

process.on('SIGINT', _ => {
    dispencerPin.writeSync(0);
});

module.exports.start = start;