const settings = require('./settings')();

/**
 * This controller uses the NeeoApi internaly to defines button and handler simultaneously. 
 */
class Controller {
    constructor( device, player ) {
        this.device = device;
        this.player = player;
		this._mappings = {};
		
		// exposes handle only for test purpooses. it should remain private, and is not part of the public api.
		this.handle = function( commandName ) {
			if( !this._mappings.hasOwnProperty(commandName)){
				throw 'Command '+commandName+' not found.';
			};
			this._mappings[commandName].apply( this );
		}

		this.device.addButtonHander( this.handle.bind( this ) );
	}

    addButton( commandName, commandHandler, buttonLabel ){
        this.addMapping( commandName, commandHandler);
		this.addDeviceButton( commandName, buttonLabel );
		return this;
    }
    
    addMapping( commandName, commandHandler) {
        if( this._mappings.hasOwnProperty(commandName)) throw new Error('A command named '+commandName+' has already been defined.')
        this._mappings[commandName] = commandHandler;
        return this;
    }

    addDeviceButton( commandName, buttonLabel ){
        this.device.addButton({name: commandName, label: buttonLabel || commandName });
		return this;
    }

    addFavorites(){
        settings.squeeze.favorites.forEach( p => this.addButton( p.name, () => this.player.playFavorite( p.itemId ) ) );
        return this;
    }

    addSpotify(){
        settings.squeeze.spotify.playlists.forEach( p => this.addButton( p.name, () => this.player.playlistPlay( p.user, p.itemId ) ) );
        return this;
	}
}

module.exports.build = function( device, player ){
	return new Controller( device,player );
};