// Require the Grow.js build and johnny-five library.
var GrowBot = require('Grow.js');
var five = require('johnny-five');
var Chip = require('chip-io');

// Create a new board object
var board = new five.Board({
    io: new Chip()
});

try {
    // When board emits a 'ready' event run this start function.
    board.on('ready', function start() {
        // Define variables
        var light = new five.Relay(54);
        var waterpump = new five.Relay(55);
        var lightSensor = new five.Sensor(51);

        waterpump.close();

        // todo: set date by server.
        // New api?
        console.log(new Date());

        // Create a new grow instance.
        var smartpot = new GrowBot({
            host: "grow.commongarden.org",
            tlsOpts: {
                tls: {
                    servername: "galaxy.meteor.com"
                }
            },
            port: 443,
            ssl: true,
            name: 'Lamp', // The display name for the thing.
            desription: 'A lamp!',
            // TODO: SWAP WITH UUID
            username: 'jake.hartnell@gmail.com', // The username of the account you want this device to be added to.
            properties: {
                state: 'off',
                lightconditions: null
            },
            actions: {
                turn_light_on: {
                    name: 'On', // Display name for the action
                    description: 'Turns the light on.', // Optional description
                    schedule: 'at 16:00', // Optional scheduling using later.js (UTC timezone)
                    function: function () {
                        light.open();
                        smartpot.set('state', 'on');
                    }
                },
                turn_light_off: {
                    name: 'off',
                    schedule: 'at 04:33', // (UTC timezone)
                    function: function () {
                        light.close();
                        smartpot.set('state', 'off');
                    }
                },
                water_plant: {
                    name: 'Water plant',
                    duration: 10000,
                    schedule: 'every 3 hours', // (UTC timezone)
                    function: function (duration) {
                        console.log('Watering plant');
                        // If duration is not defined, get the document default.
                        if (_.isUndefined(duration)) {
                            var duration = Number(smartpot.get('duration', 'water_plant'));
                        }
                        waterpump.open();
                        // TODO: test if this works
                        smartpot.schedule(function () {
                            waterpump.close();
                        }, duration);
                    }
                }
            },
            events: {
                light_data: {
                    name: 'Light data', 
                    type: 'light', // Currently need for visualization component... HACK.
                    template: 'sensor',
                    threshold: 100,
                    schedule: 'every 1 second',
                    function: function () {
                        smartpot.log({
                          type: 'light',
                          value: lightSensor.value
                        });

                        var threshold = smartpot.get('threshold', 'light_data');
                        if ((lightSensor.value < threshold) && (smartpot.get('lightconditions') != 'dark')) {
                            smartpot.emitEvent('dark')
                                    .set('lightconditions', 'dark')
                                    .call('turn_light_on');
                        } else if ((lightSensor.value >= threshold) && (smartpot.get('lightconditions') != 'light')) {
                            smartpot.emitEvent('light')
                                    .set('lightconditions', 'light')
                                    .call('turn_light_off');
                        }
                    }
                }
            }
        });
    });
} catch (err) {
    console.log(err);
}

