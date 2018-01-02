const settings = require('./settings')();
const buttonMappingsJsonApi =	[
	{
		neeo: 'VOLUME UP', 
		squeeze: function( player, callback ){
			player.getVolume( function( reply ){
				let volume = reply.result;
				volume += 3;
				player.setVolume( volume, callback );
			} )
		} 
	},
	{
		neeo: 'VOLUME DOWN', 
		squeeze: function( player, callback ){
			player.getVolume( function( reply ){
				let volume = reply.result;
				volume -= 3;
				player.setVolume( volume, callback );
			} )
		} 
    },
    { 
		neeo: 'MUTE TOGGLE', 
		squeeze: ( player, callback ) => player.request(player.playerId, ["mixer", "muting"], callback)
	},
	{
		neeo: 'POWER OFF', 
		squeeze: ( player, callback ) => player.power( 0, callback )
	},
	{
		neeo: 'POWER ON', 
		squeeze: ( player, callback ) => player.power( 1, callback )
	},
	{
		neeo: 'PLAY', 
		squeeze: ( player, callback ) => player.play( callback )
	},
	{
		neeo: 'PAUSE', 
		squeeze: ( player, callback ) => player.pause( callback )
	},
	{
		neeo: 'STOP', 
		squeeze: ( player, callback ) => player.request(player.playerId, ["stop"], callback )
	},
	{
		neeo: 'SKIP BACKWARD', 
		squeeze: ( player, callback ) => player.playIndex(-1, callback)
	},
	{
		neeo: 'SKIP FORWARD', 
		squeeze: ( player, callback ) => player.playIndex(1, callback)
	},
	{
		neeo: 'Random Album', 
		squeeze: ( player, callback ) => player.playRandom('albums', callback)
	},
	{
		neeo: 'Random Track', 
		squeeze: ( player, callback ) => player.playRandom('track', callback)
	}
];
                // spotify:user:iloveplaylists:playlist:01Jn8PTFWmIB6vsRejLX5c

settings.squeeze.favorites.forEach( p => {
	buttonMappingsJsonApi.push({ neeo: p.name, squeeze: ( player, callback ) => player.playFavorite(p.itemId, callback) });
});
settings.squeeze.spotify.playlists.forEach( p => {
	buttonMappingsJsonApi.push({ neeo: p.name, squeeze: ( player, callback ) => {
		player.playlistPlay(p.user, p.itemId, callback);
	} } );
});

module.exports.squeezeboxButtonHandlerJsonApi = function ( command, player, deviceId ) {
    const keyMap = buttonMappingsJsonApi.find((key) => key.neeo === command);
    if( keyMap) keyMap.squeeze( player )
    else console.error('command '+command+' not found');
};

module.exports.getCurrentTitle = ( player ) => {
	player.getCurrentTitle( ({result}) => console.log(result) );
} 