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
            pollingDelay: 5 * 1000 // 5 seconds
        }
        this._cache = {};
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
                this.updateCacheFromMeta();
            } ) )
            .addButton(['SKIP FORWARD','CHANNEL UP', 'CURSOR RIGHT'], () => this.player.playIndex(1, cb => {
                this.updateCacheFromMeta();
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
            setter: (deviceId,duration) => { 
                this.player.getStatus( ({result}) => {
                    const durationInTime = Math.round( (duration * result.duration)/100 );
                    this.player.seek( durationInTime );
                } );
            },
            getter: () => {
                return new Promise( (resolve, reject) => {
                    this.player.getStatus( ({result}) =>{
                        resolve( Math.round( result.time / result.duration * 100 ) );
                    });
                });
            }
        } );
        return this;
    }

    /**
     * @function addTrackLabels
     * @description Adds track information labels as shortcuts. Album, Artist and Title.
     */
    addTrackLabels( {albumLabel,artistLabel,titleLabel} ){
        this.device
            .addTextLabel( 
                { name: 'artistname', label: artistLabel||'Artist' }, 
                () => new Promise( ( resolve, reject) => this.player.getArtist( ( {result} ) =>{
                    this._cache.artist = result;
                    resolve( result );
                }  ) ) )
            .addTextLabel( 
                { name: 'albumname', label: albumLabel||'Album' }, 
                () => new Promise( ( resolve, reject) => this.player.getAlbum( ( {result} ) => {
                    this._cache.album = result;
                    resolve( result );
                 } ) ) )
            .addTextLabel( 
                { name: 'titlename', label: titleLabel||'Title' }, 
                () => new Promise( ( resolve, reject) => this.player.getTitle( ( {result} ) => {
                    this._cache.title = result;
                    resolve( result );
                 } ) ) )

        return this;
    }

    updateCacheFromMeta(){
        return new Promise( (resolve, reject) => {
            this.player.getCurrentRemoteMeta( ({result}) => {
                    this._cache.artist = result.artist;
                    this._cache.album = result.album;
                    this._cache.title = result.title;
                    this._cache.cover = this.player.address + ":"+ this.player.port + result.artwork_url;
                resolve(this._cache.cover );
            } );
        } );
    }

    addCurrentTrackCover(){
        this.device.addImageUrl(
            { name: 'albumcover', label: 'Cover for current album', size: 'large'}, 
            ( deviceId ) => new Promise( (resolve, reject) => {
                this.player.getCurrentRemoteMeta( ({result}) => {
                    this._cache.cover = this.player.address + ":"+ this.player.port + result.artwork_url;
                    resolve(this._cache.cover );
                } );
            } ) );
    }

    /**
     * @function addPowerStateManagement
     * @description Add power state management to the device. 
     * The power state is updated according to the real power state of the squeezebox. 
     */
    addPowerStateManagement(){
        this.device.addPowerStateSensor( {
            getter: () => {
                return new Promise( (resolve, reject ) =>{
                    this.player.getStatus( ({result}) => {
                        this._cache.power = result.power === 1;
                        resolve( result.power === 1 );
                    } );
                } );
            }
        } );

        const setUpdateCallbackReference = function ( updateCallback, optionalCallbackFunctions ) {
            this.sendComponentUpdate = updateCallback;
            if (optionalCallbackFunctions && optionalCallbackFunctions.powerOnNotificationFunction) {
                this.markDeviceOn = optionalCallbackFunctions.powerOnNotificationFunction;
            }
            if (optionalCallbackFunctions && optionalCallbackFunctions.powerOffNotificationFunction) {
                this.markDeviceOff = optionalCallbackFunctions.powerOffNotificationFunction;
            }
            this.updateState();
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

    updateState(){
        const deviceId = 'default';
        this.player.getStatus( ({result}) => {
            // Powet state management
            if( result.power === 1 ){
                if(this.markDeviceOn){ 
                    // console.log(`Invoking markDeviceOn for ${deviceId}`)
                    this.markDeviceOn(deviceId);
                }
            }
            else {
                if(this.markDeviceOff) {
                    // console.log(`Invoking markDeviceOff for ${deviceId}`)
                    this.markDeviceOff(deviceId);
                }
            }

            // Stops the interval increment by one second for the slider update.
            // It will be restart below if needed.
            if( this.durationInterval ){
                clearInterval( this.durationInterval );
                this.durationInterval = null;
            }                 

            if( result.mode == 'play'){
                // Slider duration management
                let duration = Math.round( result.time / result.duration * 100 );
                let durationIncrement = (1 / result.duration) * 100
                
                this.durationInterval = setInterval( () => {
                    // console.log(`Invoking updateCallback for ${deviceId}`)
                    this.sendComponentUpdate({
                        uniqueDeviceId: deviceId,
                        component: 'duration',
                        value: duration
                    });
                    duration += durationIncrement;
                }, 1 * 1000 );

                // Text label management
                if( this._cache.artist ){
                    this.sendComponentUpdate({
                        uniqueDeviceId: deviceId,
                        component: 'artistname',
                        value: this._cache.artist
                    } );
                }
                if( this._cache.album ){
                    this.sendComponentUpdate({
                        uniqueDeviceId: deviceId,
                        component: 'albumname',
                        value: this._cache.album
                    } );
                }
                if( this._cache.title ){
                    this.sendComponentUpdate({
                        uniqueDeviceId: deviceId,
                        component: 'titlename',
                        value: this._cache.title
                    } );
                }
                if( this._cache.cover ){
                    this.sendComponentUpdate({
                        uniqueDeviceId: deviceId,
                        component: 'albumcover',
                        value: this._cache.cover
                    } );
                }
            } 
            setTimeout( this.updateState.bind(this), this._settings.pollingDelay );
        });
    }

}

module.exports.build = function( device, player ){
	return new Controller( device, player );
};