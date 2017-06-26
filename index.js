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
.addButton({ name: 'Radio 1', label: 'Radio 1'}, controller.button)
.addButton({ name: 'Radio 2', label: 'Radio 2'}, controller.button)
.addButton({ name: 'Radio 5', label: 'Radio 5'}, controller.button)


	

    .addButtonHander(controller.squeezebox1ButtonPressed);
	
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
  
  
 /*

function Squeeze(A,B)
socket=require('socket')
local client = socket.connect('192.168.1.10', 9090)
--print(A.. B.." \n")
local all=(A.. B.." \n")
client:send(all)
local result=client:receive()
client:shutdown()
end
--END STARTUP LUA


Squeeze("00:04:20:22:5c:74"," mixer volume 56")
 
 
*/ 
  
  
  
  
  
  //add modules above here
function startSdkExample(brain) {
  console.log('- Start server');
  neeoapi.startServer({
    brain: '192.168.1.120',
    port: 6336,
    name: 'simple-adapter-one',
    devices: [squeezebox1,squeezebox2]
 
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
	

