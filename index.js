'use strict';
//test
const adapter = require('./driver/adapter');
const brain = require('./driver/brain');

console.log('NEEO SDK "Squeezebox" adapter');
console.log('---------------------------------------------');


adapter.discoverAndBuildDevices( devices => brain.startDriver( devices ));