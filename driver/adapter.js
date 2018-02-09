const neeoapi = require('neeo-sdk');
const settings = require('./settings')();
const controller = require('./controller');
const SqueezeServer = require('../squeeze/server');

function discoverPlayers(){
    const server = new SqueezeServer( settings.server.host, settings.server.port);
    return new Promise( (resolve, reject) => {
        server.on('register', function(){
            server.getPlayers( function(reply) {
                if( reply.ok) {
                    if( settings.squeeze.loadAllPlayers) {
                        resolve( server.players )
                    } else {
                        const playersToLoad = {};
                        settings.squeeze.players.forEach( p => {
                            playersToLoad[p] = server.players[p];
                        });
                        resolve( playersToLoad );
                    }
                }
            });
        })
    }); 
}
  
/**
 * @function buildDevice
 * @param {SqueezePlayer} player An instance of a discovered SqueezeBox player
 * @description  A basic adapter to control a logitech squeezebox. It looks for favorites and spotify playlist and add them as shortcuts.
 * @returns A promise that sould redolve with the device built.
 */
function buildDevice( player ){
    return new Promise( (resolve, reject) => {
        let device = neeoapi.buildDevice( player.name )
            .setManufacturer('Logitech')
            .setType('AUDIO');

        let builder = controller.build( device, player )
            .addDefaultButtonHandler()
            .addBasicActions()
            .addVolumeActions()
            .addNavigationButtons()
            .addButton('Random Album', () => player.playRandom('albums'))
            .addButton('Random Track', () => player.playRandom('track'))
            .addFavorites( settings.squeeze.favorites )
            .addSpotify( settings.squeeze.spotify )
            .addDurationSlider( 'Duration')
            .addTrackLabels({ artistLabel:'Artist', albumLabel: 'Album', titleLabel:'Title' })
            .addPowerStateManagement()
            .addCurrentTrackCover();

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
        if( allPlayers.length == 0 ) reject('No players found');
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
    discoverPlayers().then( players => buildDevices( players ).then( callback ) );
}