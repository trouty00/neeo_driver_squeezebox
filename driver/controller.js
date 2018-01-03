/**
 * This controller uses the NeeoApi internaly to defines button and handler simultaneously. 
 */
class Controller {
    constructor( device, player ) {
        this.device = device;
        this.player = player;
		this._mappings = {};
    }

    /**
     * @function addDefaultButtonHandler Adds a default button handler. If the command is not defined a warning is emitted.
     * @returns this
     */
    addDefaultButtonHandler(){
		this.device.addButtonHander( ( commandName ) => {
            const handler = this.getHandler( commandName );
            if( handler ) handler.apply( this );
            else console.warn('The command '+commandName+' is not defined.');
        } );
        return this;
    }
    
    /**
     * @function addButton
     * @param {string} buttonName the name of the button used for NEEO mapping and command handling.
     * @param {function} commandHandle the handler of the button when it is pressed on NEEO remote.
     * @param {string} buttonLabel the label of the button to display on NEEO remote (Optionnal).
     * @description Adds a button and a related handle by the button name convetion. The button label can be overriden.
     * @returns this.
     */
    addButton( buttonName, commandHandler, buttonLabel ){
        this.addMapping( buttonName, commandHandler);
		this.addDeviceButton( buttonName, buttonLabel );
		return this;
    }
    
    addMapping( commandName, commandHandler) {
        if( this._mappings.hasOwnProperty(commandName)) throw new Error('A command named '+commandName+' has already been defined.')
        this._mappings[commandName] = commandHandler;
        return this;
    }

    addDeviceButton( buttonName, buttonLabel ){
        this.device.addButton({name: buttonName, label: buttonLabel || buttonName });
		return this;
    }

    /**
     * @function addFavorites
     * @param {array} favorites
     * @description Adds an array of favorites items. A favorite should have a property name and a proprty itemId, which is the SqueezeServer index of the favorite.
     */
    addFavorites( favorites ){
        favorites.forEach( p => this.addButton( p.name, () => this.player.playFavorite( p.itemId ) ) );
        return this;
    }

    /**
     * @function addSpotify
     * @param {array} spotify
     * @description Adds the spotify configuration. Currently, only spotify playlists are supported.
     */
    addSpotify( spotify ){
        spotify.playlists.forEach( p => this.addButton( p.name, () => this.player.playlistPlay( p.user, p.itemId ) ) );
        return this;
    }
    
    /**
     * @function getHandler
     * @param {string} commandName
     * @description Gets the handler of the given command
     * @return {function} The button handler function or null if not found.
     */
    getHandler( commandName ) {
        if( !this._mappings.hasOwnProperty(commandName)){
            return null;
        };
        return this._mappings[commandName];
    }

    setUpdateCallbackReference( updateCallback ) {
        this.updateCallback = updateCallback;
        return this;
    }

}

module.exports.build = function( device, player ){
	return new Controller( device, player );
};