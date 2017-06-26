# neeo_driver_squeezebox


This app brings NEEO and Squeezebox / Logitech Media Server (LMS) together- It is a very rudimentary implementation utilising the LMS CLI via a socket/telnet connection.
It requires a number of modifications to get working within your environment and each player must be distinctly defined as per the instructions. There is no auto discovery and whilst this project stays in my hands it is unlikely to develop much further.
The NEEO Remote can be (Pre)ordered at: https://neeo.com/
Please note that this is not an official NEEO app made by NEEO and there will be no support from NEEO concerning this App.

Instructions
Step 1
Enable the “Audio” device in “*/node_modules/neeo-sdk/lib/device/devicetype/Index.js” to be inline with the below
const TYPES = [
  'ACCESSOIRE',
  'LIGHT',
  'MEDIAPLAYER',
  'TV',
  'AVRECEIVER',
  'AUDIO'
  
];

NB- No comma needed after the last defined device
Step 2
Edit the index.js file if you want to control more than 1 squeezebox player – my advice is make sure you can get 1 device working first.
2a– Change name on line 15 to suit your device
2b- Once you have one device working, copy and paste the whole section changing the name, the .addButtonHander(controller.squeezebox1ButtonPressed); to .addButtonHander(controller.squeezebox2ButtonPressed);
This needs to be incremented for every player.
EDIT line 78 to list out all the players, these need to reflect the name as per line 15 and 42

Step 3
Edit Controller.js file as per following
3a-Modify the MAC address of your player in line 39 and IP of server in line 41
3b- If you want to enable favourites then uncomment and amend line 27. The “name” in index.js and the name in ‘name’ after “{neeo: ’name’” in controller.js must match
3c- If you want to enable multiple players then uncomment lines 57 – 81 and amend MAC and duplicate as required increasing the squeezebox*ButtonPressed number as required 



