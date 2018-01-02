const neeoapi = require('neeo-sdk');
const settings = require('./settings')();
const controller = require('./controller');
const http = require('http');
const adpaterName = 'squeezebox-adapter';

function discoverPlayers(){
    const server = new SqueezeServer( settings.server.host, settings.server.port);
    return new Promise( (resolve, reject) => {
        server.on('register', function(){
            server.getPlayers( function(reply) {
                if( reply.ok) {
                    if( settings.squeeze.loadAllPlayers) {
                        resolve( server.players )
                    }
                }
            });
        })
    }); 
}
  
/**
 * 
 * It looks for favorites and spotify playlst and add them as shortcuts.
 * @function createDevices A basic adapter to control a logitech squeezebox.
 * @param player An instance of the LMS server
 * @returns The device built.
 */
function buildBasicAudioDevice( player ){
    const name = player.name,
          playerId = player.playerId;
    return new Promise( (resolve, reject) => {

        let device = neeoapi.buildDevice(name)
            .setManufacturer('Logitech')
            .setType('AUDIO')
            .addButton({ name: 'VOLUME UP', label: 'VOLUME UP'} )
            .addButton({ name: 'VOLUME DOWN', label: 'VOLUME DOWN'} )
            .addButton({ name: 'MUTE TOGGLE', label: 'MUTE TOGGLE'} )
            .addButton({ name: 'POWER OFF', label: 'POWER OFF'} )
            .addButton({ name: 'POWER ON', label: 'POWER ON'} )
            .addButton({ name: 'PLAY', label: 'PLAY'} )
            .addButton({ name: 'PAUSE', label: 'PAUSE'} )
            .addButton({ name: 'STOP', label: 'STOP'} )
            .addButton({ name: 'SKIP BACKWARD', label: 'SKIP BACKWARD'} )
            .addButton({ name: 'SKIP FORWARD', label: 'SKIP FORWARD'} )
            .addButton({ name: 'Random Album', label: 'Random Album'} )
            .addButton({ name: 'Random Track', label: 'Random Track'} )
            .addTextLabel({ name: 'trackname', label: 'Track name' }, ( player ) =>{
                console.log(arguments)
                controller.getCurrentTitle( player );
            });

            settings.squeeze.favorites.forEach( p => {
                device = device.addButton({ name: p.name, label: p.name} )
            });
            settings.squeeze.spotify.playlists.forEach( p => {
                device = device.addButton({ name: p.name, label: p.name} )
            });

        device = device.addButtonHander( ( command, deviceId ) => {
            console.log('Receive command ' + command); 
            controller.squeezeboxButtonHandlerJsonApi( command, player, deviceId );
        } );

        resolve( device );
    })
}

  
  
/**
 * @function createDevices Create all devices from all discovered SqueezePlayer
 * @param server An instance of the LMS server
 * @returns An array of devices build by the fluent neeoapi
 *  */
function buildDevices( players ){
    const devices = [];
    return new Promise( ( resolve, reject) => {
        const allPlayers = []; 
        for( let playerId in players) {
            const player = players[playerId];
            allPlayers.push(player);
        }
        if(allPlayers.length == 0)reject('No players found');
        else {
            allPlayers.forEach( (player, idx ) => {
                buildBasicAudioDevice( player ).then( device => {
                    devices.push( device );
                    console.log( device.devicename, device.deviceidentifier)
                    if( idx == allPlayers.length-1 ){
                        resolve( devices );
                    }
                });
            });
        }
    })
  }

module.exports.discoverPlayers = discoverPlayers;
module.exports.buildDevices = buildDevices;
module.exports.discoverAndBuildDevices = function( callback ){
    discoverPlayers().then( players => buildDevices( players ).then( devices => callback( devices ) ) );
}



  
// neeoapi.discoverOneBrain().then((brain) => {
//     console.log('- Brain discovered:', brain.name);

//     server.on('register', function(){
//       server.getPlayers( function(reply) {
//         if( reply.ok) {
          
//           adapter.buildDiscoveredDevices( server );
//           startSqueezeBoxDriver(brain, devices);
//         }
//       });
//     })
// });

