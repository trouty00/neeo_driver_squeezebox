'use strict';

const neeoapi = require('neeo-sdk');
const controller = require('./controller');

console.log('NEEO SDK Example "Squeezebox" adapter');
console.log('---------------------------------------------');

  
/*
 * A Very simple Telnet adapter to control a logitech squeezebox.
  */
 
 //SQUEEZEBOX DEVICE 1
 const squeezebox1= neeoapi.buildDevice('Squeezebox Kitchen')
  .setManufacturer('Logitech')
  .addAdditionalSearchToken('foo')
  .setType('AUDIO')

  
 .addButton({ name: 'VOLUME UP', label: 'VOLUME UP'}, controller.button)
.addButton({ name: 'VOLUME DOWN', label: 'VOLUME DOWN'}, controller.button)
.addButton({ name: 'MUTE TOGGLE', label: 'MUTE TOGGLE'}, controller.button)
.addButton({ name: 'POWER OFF', label: 'POWER OFF'}, controller.button)
.addButton({ name: 'POWER ON', label: 'POWER ON'}, controller.button)
.addButton({ name: 'PLAY', label: 'PLAY'}, controller.button)
.addButton({ name: 'PAUSE', label: 'PAUSE'}, controller.button)
.addButton({ name: 'STOP', label: 'STOP'}, controller.button)
.addButton({ name: 'SKIP BACKWARD', label: 'SKIP BACKWARD'}, controller.button)
.addButton({ name: 'SKIP FORWARD', label: 'SKIP FORWARD'}, controller.button)
.addButton({ name: 'Random Album', label: 'Random Album'}, controller.button)
.addButton({ name: 'Random Track', label: 'Random Track'}, controller.button)
/*
.addButton({ name: 'ENTER YOUR NAME OF FAVORITE YOU WANT', label: 'BUTTON NAME'}, controller.button)
EXAMPLE
.addButton({ name: 'Radio 1', label: 'Radio 1'}, controller.button)
*/

    .addButtonHander(controller.squeezebox1ButtonPressed);
/*	
	//SQUEEZEBOX DEVICE 2
 const squeezebox2= neeoapi.buildDevice('Squeezebox Lounge')
  .setManufacturer('Logitech')
  .addAdditionalSearchToken('foo')
  .setType('AUDIO')

  
 .addButton({ name: 'VOLUME UP', label: 'VOLUME UP'}, controller.button)
.addButton({ name: 'VOLUME DOWN', label: 'VOLUME DOWN'}, controller.button)
.addButton({ name: 'MUTE TOGGLE', label: 'MUTE TOGGLE'}, controller.button)
.addButton({ name: 'POWER OFF', label: 'POWER OFF'}, controller.button)
.addButton({ name: 'POWER ON', label: 'POWER ON'}, controller.button)
.addButton({ name: 'PLAY', label: 'PLAY'}, controller.button)
.addButton({ name: 'PAUSE', label: 'PAUSE'}, controller.button)
.addButton({ name: 'STOP', label: 'STOP'}, controller.button)
.addButton({ name: 'SKIP BACKWARD', label: 'SKIP BACKWARD'}, controller.button)
.addButton({ name: 'SKIP FORWARD', label: 'SKIP FORWARD'}, controller.button)
.addButton({ name: 'Random Album', label: 'Random Album'}, controller.button)
.addButton({ name: 'Random Track', label: 'Random Track'}, controller.button)
.addButton({ name: 'Radio 1', label: 'Radio 1'}, controller.button)
.addButton({ name: 'Radio 2', label: 'Radio 2'}, controller.button)
.addButton({ name: 'Radio 5', label: 'Radio 5'}, controller.button)


	

    .addButtonHander(controller.squeezebox2ButtonPressed);
  
  
*/  
  
function startSdkExample(brain) {
  console.log('- Start server');
  neeoapi.startServer({
    brain,
    port: 6336,
    name: 'simple-adapter-one',
	//Edit as per below to add additional squeezeboxes
	//devices: [squeezebox1,squeezebox2]
	devices: [squeezebox1]
 
  })
  .then(() => {
    console.log('# READY! use the NEEO app to search for "ONKYO NR-509".');
  })
  .catch((error) => {
    //if there was any error, print message out to console
    console.error('ERROR!', error.message);
    process.exit(1);
  });
}

const brainIp = process.env.BRAINIP;
if (brainIp) {
  console.log('- use NEEO Brain IP from env variable', brainIp);
  startSdkExample(brainIp);
} else {
  console.log('- discover one NEEO Brain...');
  neeoapi.discoverOneBrain()
    .then((brain) => {
      console.log('- Brain discovered:', brain.name);
      startSdkExample(brain);
    });
}
	

