# neeo-squeezebox-adapter

This driver allows you to add all your Squeezebox to the NEEO remote. This is a work in progress, features like Album pictures, playlist navigation, squeezebox syncing, etc. will be implemented if the NEEO-Sdk supports. 

This is a fork from https://github.com/trouty00/neeo_driver_squeezebox but many things have changed:

* It embeds the SqueezeNode project (https://github.com/piotrraczynski/squeezenode) from Piotr Raczynski with some little modifications.
* Players are auto discovered
* Spotify playlists and favorites are added by update a configuration file (settings.json)


## Instructions
### Step 1
Enable the “Audio” device in */node_modules/neeo-sdk/lib/device/devicetype/Index.js* to be inline with the below

``` javascript
const TYPES = [
  'ACCESSOIRE',
  'LIGHT',
  'MEDIAPLAYER',
  'TV',
  'AVRECEIVER',
  'AUDIO'
];
```

### Step 2
Edit the settings.json file to configure your brain IP (if not specified, brain is auto discovered) and your LMS Squeeze Server Host and port. 
You can add your favorites and spotify playlists, they will be added as buttons. 

### Step 3
SqueezeBox Players are discovered by the Driver. Simply look for their names 