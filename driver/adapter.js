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
            .addButton( 'VOLUME UP', function(){
                player.getVolume( function( {result} ) {
                    player.setVolume( (result + 3) >= 100 ? 100 : result + 3 );
                } )
            } )
            .addButton( 'VOLUME DOWN', function(){
                player.getVolume( function( {result} ) {
                    player.setVolume( ( result - 3) <= 0 ? 0 : result - 3 );
                } )
            })
            .addButton(['SKIP BACKWARD','CHANNEL DOWN','CURSOR LEFT'], () => player.playIndex(-1) )
            .addButton(['SKIP FORWARD','CHANNEL UP', 'CURSOR RIGHT'], () => player.playIndex(1) )
            .addButton('MUTE TOGGLE', () => player.toggleMute() )
            .addButton('POWER OFF', () => player.power( 0 ) )
            .addButton('POWER ON', () => player.power( 1 ) )
            .addButton('CURSOR ENTER', () => {
                player.getStatus( ({result}) => {
                    if( result.mode == 'play' ){
                        player.pause();
                    }
                    else{
                        player.play();
                    }
                })
            } )
            .addButton('PLAY', () => player.play() )
            .addButton('PAUSE', () => player.pause() )
            .addButton('STOP', () => player.stop() )
            .addButton('Random Album', () => player.playRandom('albums'))
            .addButton('Random Track', () => player.playRandom('track'))
            .addFavorites( settings.squeeze.favorites )
            .addSpotify( settings.squeeze.spotify )
            .addDurationSlider( 'Duration')
            .addTrackLabels({ artistLabel:'Artist', albumLabel: 'Album', titleLabel:'Title' })
            .addPowerStateManagement();

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
    discoverPlayers().then( players => buildDevices( players ).then( devices => callback( devices ) ) );
}