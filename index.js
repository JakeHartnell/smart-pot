// Require the Grow.js build and johnny-five library.
var GrowBot = require('Grow.js');
var five = require('johnny-five');
var Chip = require('chip-io');

// Create a new board object
var board = new five.Board({
    io: new Chip()
});

// When board emits a 'ready' event run this start function.
board.on('ready', function start() {
    // Define variables
    var light = new five.Relay(54);
    var waterpump = new five.Relay(55);
    var lightSensor = new five.Sensor(51);
    var mainlights = new five.Relay(57);

    waterpump.close();

    // Create a new grow instance.
    var smartpot = new GrowBot({
        uuid: '92169977-3ead-4f17-bebd-2e2503ebeee8',
        token: 'nbBynG8Yhi8W7yurdoPZMnWqanF2b8Ms',
        properties: {
            state: 'off',
            lightconditions: null
        },

        turn_light_on: function () {
            light.open();
            // mainlights.close();
            smartpot.set('state', 'on');
        },

        turn_light_off: function () {
                light.close();
                // mainlights.open();
                smartpot.set('state', 'off');
        },
        water_plant: function (duration) {
            console.log('Watering plant');
            // If duration is not defined, get the document default.
            waterpump.open();
            // TODO: test if this works
            smartpot.schedule(function () {
                waterpump.close();
            }, duration);
        }
    });

    smartpot.connect({
        host: "grow.commongarden.org",
        tlsOpts: {
          tls: {
            servername: "galaxy.meteor.com"
          }
        },
        port: 443,
        ssl: true
    });
});
