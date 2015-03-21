var usb = require('usb');

var UhkConnection = function() {
    'use strict';
    var scope = this;

    // Public methods

    scope.sendRequest = function(command, arg, callback) {
        console.log('Sending request', new Buffer([command, arg]));
        setReport(new Buffer([command, arg]), function(error, data) {
            //console.log('Set Report(0x' +  message.toString('hex') + ') succeeded' );
            receiveResponse();
        });
    };

    // Private methods

    function setReport(message, callback) {
        device.controlTransfer(
            0x21,                     // bmRequestType (constant for this control request)
            0x09,                     // bmRequest (constant for this control request)
            0,                        // wValue (MSB is report type, LSB is report number)
            UhkConnection.GENERIC_HID_INTERFACE_ID,  // wIndex (interface number)
            message,                  // message to be sent
            callback
        );
    }

    function receiveResponse() {
        var endpoint = usbInterface.endpoints[0];
        var readLength = 8;
        endpoint.transfer(readLength, function(error, data) {
            if (error) {
                console.log('Read finished with error');
                console.log(error)
            } else {
                console.log('Read finished:', data);
            }
        });
    }

    // Initialize

    var device = usb.findByIds(UhkConnection.VENDOR_ID, UhkConnection.PRODUCT_ID);
    if (!device) {
        throw new Error("Could not find the keyboard. Is it plugged in?");
    }
    device.open();  // TODO: What if multiple keyboards are plugged in?

    var usbInterface = device.interface(UhkConnection.GENERIC_HID_INTERFACE_ID);
    if (usbInterface.isKernelDriverActive()) {
        usbInterface.detachKernelDriver();
    }
    usbInterface.claim();
};

UhkConnection.VENDOR_ID = 0x16D2;
UhkConnection.PRODUCT_ID = 0x05EA;
UhkConnection.GENERIC_HID_INTERFACE_ID = 2;

UhkConnection.COMMANDS = {
    REENUMERATE: 66,
    READ_EEPROM: 67,
    WRITE_EEPROM: 68
};

UhkConnection.REENUMERATION_MODES = {
    KEYBOARD:       0,
    CDC_BOOTLOADER: 1,
    USB_TO_SERIAL:  2
};

module.exports = UhkConnection;
