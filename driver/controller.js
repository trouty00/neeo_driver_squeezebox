const isArray = require('isarray');
/**
 * This controller uses the NeeoApi internaly to defines button and handler simultaneously. 
 */
class Controller {
    constructor( device, player ) {
        this.device = device;
        this.player = player;
        this._mappings = {};
        this._settings = {
            pollingDelay: 1 // 1 second
        }
        this._status = {};
        this._cache = {};
        this._lastUpdate = {};
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
     * @param {string|Array} buttonNameOrButtonArrayNames the name of the button used for NEEO mapping and command handling.
     * @param {function} commandHandle the handler of the button when it is pressed on NEEO remote.
     * @param {string} buttonLabel the label of the button to display on NEEO remote (Optionnal).
     * @description Adds a button and a related handle by the button name convetion. The button label can be overriden.
     * @returns this.
     */
    addButton( buttonNameOrButtonArrayNames, commandHandler, buttonLabel ){
        if( isArray(buttonNameOrButtonArrayNames)){
            buttonNameOrButtonArrayNames.forEach( buttonName => {
                this.addMapping( buttonName, commandHandler);
                this.addDeviceButton( buttonName, buttonLabel );
            });
        }
        else {
            this.addMapping( buttonNameOrButtonArrayNames, commandHandler);
            this.addDeviceButton( buttonNameOrButtonArrayNames, buttonLabel );
        }
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

    addNavigationButtons(){
        return this.addButton(['SKIP BACKWARD','CHANNEL DOWN','CURSOR LEFT'], () => this.player.playIndex(-1, cb => {
                this.updateStatus();
                this.updateSong();
            } ) )
            .addButton(['SKIP FORWARD','CHANNEL UP', 'CURSOR RIGHT'], () => this.player.playIndex(1, cb => {
                this.updateStatus();
                this.updateSong();
            } ) );
    }

    /**
     * @function addDurationSlider
     * @param {string} label The name of label in front of the component. Defaults to Duration.
     * @description Adds a duration slider which can be used to seek track seconds on the remote.
     */
    addDurationSlider( label ){
        this.device.addSlider({
            name: 'duration', 
            label: label || 'Duration', 
            range:[0,100], 
            unit: '%'
        }, {
            setter: (deviceId,value) => { 
                const durationInSeconds =  (value * this._status.duration)/100;
                this.player.seek( durationInSeconds );
            },
            getter: () => (this._status.time / this._status.duration) * 100
        } );
        return this;
    }

    /**
     * @function addTrackLabels
     * @description Adds track information labels as shortcuts. Album, Artist and Title.
     */
    addTrackLabels({ albumLabel, artistLabel, titleLabel }){
        this.device
            .addTextLabel({ name: 'artistname', label: artistLabel||'Artist' }, () => this._cache.artist )
            .addTextLabel({ name: 'albumname', label: albumLabel||'Album' }, () => this._cache.album )
            .addTextLabel({ name: 'titlename', label: titleLabel||'Title' }, () => this._cache.title );

        return this;
    }

    addCurrentTrackCover(){
        this.device.addImageUrl({ name: 'albumcover', size: 'large'}, ( deviceId ) => this._cache.cover );
        return this;
    }

    addVolumeActions(){
        return this.addButton('MUTE TOGGLE', () => this.player.toggleMute() )
            .addButton( 'VOLUME UP', () => {
                this._status.volume = (this._status.volume + 3 >= 100) ? 100 : this._status.volume + 3;
                this.player.setVolume( this._status.volume );
            } )
            .addButton( 'VOLUME DOWN', () => {
                this._status.volume = (this._status.volume - 3 <= 0) ? 0 : this._status.volume - 3;
                this.player.setVolume( this._status.volume );
            });
    }

    addBasicActions(){
        return this.addButton('CURSOR ENTER', () => {
            if( this._status.mode == 'play') this.player.pause();
            else this.player.play();
        } )
        .addButton('PLAY', () => this.player.play() )
        .addButton('PAUSE', () => this.player.pause() )
        .addButton('STOP', () => this.player.stop() );
    }

    /**
     * @function addPowerStateManagement
     * @description Add power state management to the device. 
     * The power state is updated according to the real power state of the squeezebox. 
     */
    addPowerStateManagement(){
        this.addButton('POWER OFF', () => this.player.power( 0 ) ).addButton('POWER ON', () => this.player.power( 1 ) )
        this.device.addPowerStateSensor({ getter: () => !!this._cache.power });

        const setUpdateCallbackReference = function ( updateCallback, optionalCallbackFunctions ) {
            this.sendComponentUpdate = updateCallback;
            if (optionalCallbackFunctions && optionalCallbackFunctions.powerOnNotificationFunction) {
                this.markDeviceOn = optionalCallbackFunctions.powerOnNotificationFunction;
            }
            if (optionalCallbackFunctions && optionalCallbackFunctions.powerOffNotificationFunction) {
                this.markDeviceOff = optionalCallbackFunctions.powerOffNotificationFunction;
            }
            setInterval( this.update.bind(this), this._settings.pollingDelay * 1000 );
        };

        this.device.registerSubscriptionFunction( setUpdateCallbackReference.bind(this) );

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

    /**
     * This is called internaly to update the state of the driver from the player state.
     */
    update(){
        this.updateStatus().then( this.updateStatusComponents.bind( this ) );
        this.updateSong().then( this.updateSongComponents.bind( this ) );
    }

    /**
     * Updates the player status
     */
    updateStatus(){
        return new Promise( (resolve, reject) => {
            this.player.getStatus( ({result}) => {
                this._status = result;
                this._status.volume = result['mixer volume'];
                resolve( this._status );
            });
        });
    }

    /**
     * Updates the internal cache of player remote meta.
     */
    updateSong(){
        return new Promise( (resolve, reject) => {
            this.player.getCurrentRemoteMeta( ({result}) => {
                if( result){
                    this._cache = result;
                    this._cache.cover = this.player.address + ":"+ this.player.port + result.artwork_url;
                    resolve( this._cache );
                }
                else {
                    this.player.getAlbum(({result}) => {
                        this._cache.album = result;
                        this.player.getArtist(({result}) => {
                            this._cache.artist = result;
                            this.player.getCurrentTitle(({result}) =>{
                                this._cache.artist = result;
                                resolve( this._cache );
                            } );
                        } );
                    } );
                }
            } );
        } );
    }

    /**
     * Updates power mode and sliders
     */
    updateStatusComponents(){
        const uniqueDeviceId = 'default'; //TODO: gets the device id 

        // Powet state management
        if( this._status.power === 1 ){
            if(this.markDeviceOn){ 
                this.markDeviceOn(uniqueDeviceId);
            }
        }
        else {
            if(this.markDeviceOff) {
                this.markDeviceOff(uniqueDeviceId);
            }
        }

        // Stops the interval increment by one second for the slider update.
        // It will be restarted below if needed.
        if( this.durationInterval ){
            clearInterval( this.durationInterval );
            this.durationInterval = null;
        }                 

        if( this._status.mode == 'play' ){
            if( this.sendComponentUpdate ) {
                // Slider duration management
                let value = this._cache['duration'] = Math.round( this._status.time / this._status.duration * 100 );

                if( this._settings.pollingDelay >= 2 ) {
                    const durationIncrement = (1 / this._status.duration) * 100
                    this.durationInterval = setInterval( () => {
                        this.sendComponentUpdate({ uniqueDeviceId, component: 'duration', value });
                        value += durationIncrement;
                    }, 1 * 1000 );
                } else {
                    // If the polling is every seconds, updates the slider directly...
                    if( this._shouldSendUpdate('duration'))
                        this.sendComponentUpdate({ uniqueDeviceId, component: 'duration', value });
                }
            }
        } 
    }

    updateSongComponents() {
        const uniqueDeviceId = 'default'; //TODO: gets the device id 
        
        if(this.sendComponentUpdate ) {
            if( this._shouldSendUpdate('artist'))
                this.sendComponentUpdate({ uniqueDeviceId, component: 'artistname', value: this._cache.artist || "" });
            if( this._shouldSendUpdate('album'))
                this.sendComponentUpdate({ uniqueDeviceId, component: 'albumname', value: this._cache.album || "" });
            if( this._shouldSendUpdate('title'))
                this.sendComponentUpdate({ uniqueDeviceId, component: 'titlename', value: this._cache.title || "" });
            if( this._shouldSendUpdate('cover'))
                this.sendComponentUpdate({ uniqueDeviceId, component: 'albumcover', value: this._cache.cover || "" });
        }
    }

    _shouldSendUpdate( propertyName ){
        // If the cache does not contains the property, don't send update.
        if( !this._cache[propertyName] ) return false;
        // if the cache is different from the previous update, sends the update to the brain.
        if( this._lastUpdate[propertyName] != this._cache[propertyName] ){
            this._lastUpdate[propertyName] = this._cache[propertyName];
            return true;
        }
        return false;
    }
}

module.exports.build = function( device, player ){
	return new Controller( device, player );
};