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
                player.getVolume( function( reply ) {
                    player.setVolume( (reply.result + 3) >= 100 ? 100 : reply.result + 3 );
                } )
            } )
            .addButton( 'VOLUME DOWN', function(){
                player.getVolume( function( reply ) {
                    player.setVolume( (reply.result - 3) <= 0 ? 0 : reply.result - 3 );
                } )
            })
            .addButton('SKIP BACKWARD', () => player.playIndex(-1) )
            .addButton('SKIP FORWARD', () => player.playIndex(1) )
            .addButton('CHANNEL DOWN', () => player.playIndex(-1) )
            .addButton('CHANNEL UP', () => player.playIndex(1) )

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
            .addSpotify( settings.squeeze.spotify );

        device
            .addTextLabel( 
                { name: 'artistname', label: 'Artist' }, 
                () => new Promise( ( resolve, reject) => player.getArtist( ( {result} ) => resolve( result ) ) ) )
            .addTextLabel( 
                { name: 'albumname', label: 'Album' }, 
                () => new Promise( ( resolve, reject) => player.getAlbum( ( {result} ) => resolve( result ) ) ) )
            .addTextLabel( 
                { name: 'titlename', label: 'Title' }, 
                () => new Promise( ( resolve, reject) => player.getTitle( ( {result} ) => resolve( result ) ) ) )
            .addSlider({name: 'duration', label: 'Duration', range:[0,100], unit: '%'},
                {
                    setter: (deviceId,duration) => { 
                        player.getStatus( ({result}) => {
                            const durationInTime = Math.round( (duration * result.duration)/100 );
                            player.seek( durationInTime );
                        } );
                    },
                    getter: () => {
                        return new Promise( (resolve, reject) => {
                            player.getStatus( ({result}) =>{
                                resolve( Math.round( result.time / result.duration * 100 ) );
                            });
                        });
                    }
                } )

        device.addPowerStateSensor( {
            getter: () => {
                return new Promise( (resolve, reject ) =>{
                    player.getStatus( ({result}) => {
                        resolve( result.power === 1 );
                    } );
                } );
            }
        } );

        device.registerSubscriptionFunction((updateCallback, optionalCallbackFunctions) => {
            builder.setUpdateCallbackReference( updateCallback );
            // if (optionalCallbackFunctions && optionalCallbackFunctions.powerOnNotificationFunction) {
            //     markDeviceOn = optionalCallbackFunctions.powerOnNotificationFunction;
            // }
            // if (optionalCallbackFunctions && optionalCallbackFunctions.powerOffNotificationFunction) {
            //     markDeviceOff = optionalCallbackFunctions.powerOffNotificationFunction;
            // }
        });
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
        if(allPlayers.length == 0) reject('No players found');
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