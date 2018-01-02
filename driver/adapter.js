const neeoapi = require('neeo-sdk');
const settings = require('./settings')();
const controller = require('./controller');
const SqueezeServer = require('../squeeze/server');
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
 * It looks for favorites and spotify playlist and add them as shortcuts.
 * @function buildDevice A basic adapter to control a logitech squeezebox.
 * @param player An instance of a discovered SqueezeBox player
 * @returns A promise that sould redolve with the device built.
 */
function buildDevice( player ){
    return new Promise( (resolve, reject) => {
        let device = neeoapi.buildDevice( player.name )
            .setManufacturer('Logitech')
            .setType('AUDIO');

        controller.build( device, player )
            .addButton( 'VOLUME UP', function(){
                this.player.getVolume( function( reply ){
                    let volume = reply.result;
                    volume += 1;
                    player.setVolume( volume );
                } )
            } )
            .addButton( 'VOLUME DOWN', function(){
                this.player.getVolume( function( reply ){
                    let volume = reply.result;
                    volume -= 3;
                    player.setVolume( volume );
                } )
            })
            .addButton('MUTE TOGGLE', () => player.toggleMute() )
            .addButton('POWER OFF', () => player.power( 0 ) )
            .addButton('POWER ON', () => player.power( 1 ) )
            .addButton('PLAY', () => player.play() )
            .addButton('PAUSE', () => player.pause() )
            .addButton('STOP', () => player.stop() )
            .addButton('SKIP BACKWARD', () => player.playIndex(-1) )
            .addButton('SKIP FORWARD', () => player.playIndex(1) )
            .addButton('Random Album', () => player.playRandom('albums'))
            .addButton('Random Track', () => player.playRandom('track'))
            .addFavorites()
            .addSpotify();

        resolve( device );
    })
}

  
  
/**
 * @function buildDevices Create all devices from all discovered SqueezePlayer
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
                buildDevice( player ).then( device => {
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

