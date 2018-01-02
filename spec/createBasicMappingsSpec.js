const controller = require('../driver/controller');
const SqueezePlayer = require('../squeeze/squeezeplayer');
const neeoapi = require('neeo-sdk');

describe( "Handle basic commands", function(){
    const testPlayer = new SqueezePlayer("00:00:00:00:00:00", "TestPlyer", "http://192.168.1.33", 9000);

    it("Should handle basic command", function(){
        const testDevice = neeoapi.buildDevice( "TestPlyer" );
        const theController = controller
            .build( testDevice, testPlayer )
            .addButton('TEST BUTTON', function() {
                console.log('TEST BUTTON HANDLED');
                expect(this.player).toBeDefined()
            } );
            
        var result = theController.handle('TEST BUTTON');
        expect(result).nothing()
    })

    it("Should throw if command is not defined", function(){
        const testDevice = neeoapi.buildDevice( "TestPlyer" );
        const theController = controller
            .build( testDevice, testPlayer )
            .addButton('TEST BUTTON', () => {})
            .addButton('TEST BUTTON 2', () => {});

        expect(function(){ theController.handle('TEST BUTTON THAT DOES NOT EXISTS') })
            .toThrow('Command '+'TEST BUTTON THAT DOES NOT EXISTS'+' not found.');
    });
});