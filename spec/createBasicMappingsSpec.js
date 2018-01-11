const controller = require('../driver/controller');
const SqueezePlayer = require('../squeeze/squeezeplayer');
const neeoapi = require('neeo-sdk');

describe( "Handle basic commands", function(){
    const testPlayer = new SqueezePlayer("00:00:00:00:00:00", "TestPlyer", "http://192.168.1.33", 9000);

    it("Should handle basic command", function(){
        const testDevice = neeoapi.buildDevice( "TestPlyer" )
            .setManufacturer('Logitech')
            .setType('AUDIO');;
        const theController = controller
            .build( testDevice, testPlayer )
            .addButton('TEST BUTTON', function() {
                console.log('TEST BUTTON HANDLED');
                expect(this.player).toBeDefined()
            } );
            
        var result = theController.getHandler('TEST BUTTON');
        expect(result).toBeDefined();
    })

    it("Should throw if command is not defined", function(){
        const testDevice = neeoapi.buildDevice( "TestPlyer" )    
            .setManufacturer('Logitech')
            .setType('AUDIO');
    
        const theController = controller
            .build( testDevice, testPlayer )
            .addButton('TEST BUTTON', () => {})
            .addButton('TEST BUTTON 2', () => {});

        expect(theController.getHandler('TEST BUTTON THAT DOES NOT EXISTS') ).toBeNull();
    });
});