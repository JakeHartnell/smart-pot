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
    var light = new five.Relay(54),
        waterpump = new five.Relay(55);

    waterpump.close();

    // http://johnny-five.io/examples/multi-mpl3115a2/
    // multi = new five.Multi({
    //   controller: "SI7020"
    // });

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
        name: 'Smartpot V1', // The display name for the thing.
        desription: 'A self watering, self lighting pot with sensors!',
        // TODO: SWAP WITH UUID
        username: 'jake.hartnell@gmail.com', // The username of the account you want this device to be added to.
        properties: {
            state: 'off'
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
                // IDEA: properties in the params object are supported with rest?
                // params: {
                //     duration: {
                //         type: Number,
                //         value: 10000
                //     }
                // },
                // To do support writing duration with Params
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
        }
        // events: {
        //     temp_data: {
        //         name: 'Room temperature sensor', 
        //         template: 'sensor',
        //         type: 'temperature',
        //         schedule: 'every 4 seconds',
        //         function: function () {
        //             // Send value to Grow-IoT
        //             smartpot.log({
        //               type: 'temperature',
        //               value: multi.temperature.celsius
        //             });
        //         }
        //     },
        //     humidity_data: {
        //         name: 'Relative humidity', 
        //         template: 'sensor',
        //         type: 'humidity',
        //         schedule: 'every 4 seconds',
        //         function: function () {
        //             // Send value to Grow-IoT
        //             smartpot.log({
        //               type: 'humidity',
        //               value: humidity.relativeHumidity
        //             });
        //         }
        //     },
        // }
    });
});
