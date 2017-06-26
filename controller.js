'use strict';

//SQUEEZEBOX

/* Or use this example tcp client written in node.js.  (Originated with 
example code from 
http://www.hacksparrow.com/tcp-socket-programming-in-node-js.html.) */


function buttonMappings() {
    return    [
	//paste the keymap table here
{neeo: 'VOLUME UP', squeeze:' mixer volume +3 \n'},
{neeo: 'VOLUME DOWN', squeeze:' mixer volume -3 \n'},
{neeo: 'MUTE TOGGLE', squeeze:' mixer muting \n'},
{neeo: 'POWER OFF', squeeze:' power 0 \n'},
{neeo: 'POWER ON', squeeze:' power 1 \n'},
{neeo: 'PLAY', squeeze:' play \n'},
{neeo: 'PAUSE', squeeze:' pause \n'},
{neeo: 'STOP', squeeze:' stop \n'},
{neeo: 'SKIP BACKWARD', squeeze:' playlist index -1 \n'},
{neeo: 'SKIP FORWARD', squeeze:' playlist index +1 \n'},
{neeo: 'Random Album', squeeze:' randomplay albums \n'},
{neeo: 'Random Track', squeeze:' randomplay track \n'},
/*
//REPLACE 11 with the number of your corresponding scene and duplicate the line as required.
{neeo: 'ENTER YOUR NAME OF FAVORITE YOU WANT', squeeze:' favorites playlist play item_id:11 \n'},
*/

	// Add the rest.	//example of working map
	
    ];
}

module.exports.squeezebox1ButtonPressed = function squeezebox1ButtonPressed(name, deviceid) {
const keyMap = buttonMappings().find((key) => key.neeo === name);
var net = require('net');
var client = new net.Socket();
//enter MAC address of Squeezebox PLAYER here.
var MAC = '00:06:5F:17:5d:6e';
	//enter IP address of Squeezebox SERVER here.
	client.connect(9090, 'xx.xx.xx.xx', function() {
	client.write(MAC+keyMap.squeeze);
	console.log ('You just sent '+ keyMap.squeeze + 'to '+MAC+ ', Please ensure this MAC matches');
	})
client.on('data', function(data) {
	//console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});
client.on('close', function() {
	//console.log('Connection closed');
});

}


/*
//Uncomment this section to enable the second squeezebox and duplicate as required remembering to change MAC of player
//this Can be simply copied from above but ensure to change the squeezebox*ButtonPressed in the two areas

module.exports.squeezebox2ButtonPressed = function squeezebox2ButtonPressed(name, deviceid) {
const keyMap = buttonMappings().find((key) => key.neeo === name);
var net = require('net');
var client = new net.Socket();
//enter MAC address of Squeezebox PLAYER here.
var MAC = '00:06:5F:17:5d:6e';
	//enter IP address of Squeezebox SERVER here.
	client.connect(9090, 'xx.xx.xx.xx', function() {
	client.write(MAC+keyMap.squeeze);
	console.log ('You just sent '+ keyMap.squeeze + 'to '+MAC+ ', Please ensure this MAC matches');
	})
client.on('data', function(data) {
	//console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});
client.on('close', function() {
	//console.log('Connection closed');
});

}
*/
