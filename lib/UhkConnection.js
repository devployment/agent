var usb = require('usb');

var UhkConnection = function(selectedLogLevel) {
    'use strict';
    var self = this;

    // Public methods

    self.sendRequest = function(command, arg, callback) {
        var request;
        if (arg === null) {
            request = new Buffer([command]);
        } else {  // if (typeof arg === 'string')
            var charCodes = arg.split('').map(function(char) {return char.charCodeAt(0)});
            request = new Buffer([command].concat(charCodes));
        }

        log(UhkConnection.LOG_LEVELS.TRANSFER, 'Sending request', request);
        setReport(request, function() {
            receiveResponse(UhkConnection.LOG_LEVELS.IGNORED_TRANSFER, function() {
                // The first response is cached by the OS so let's ignore it and go for the second one.
                receiveResponse(UhkConnection.LOG_LEVELS.TRANSFER, callback);
            });
        });
    };

    // Private methods

    function setReport(message, callback) {
        device.controlTransfer(
            0x21,                     // bmRequestType (constant for this control request)
            0x09,                     // bmRequest (constant for this control request)
            0,                        // wValue (MSB is report type, LSB is report number)
            0,  // wIndex (interface number)
            message,                  // message to be sent
            callback
        );
    }

    function receiveResponse(logLevel, callback) {
        var endpoint = usbInterface.endpoints[0];
        var readLength = 64;
        endpoint.transfer(readLength, function(error, data) {
            if (error) {
                log(logLevel, 'Error response received', error);
            } else {
                log(logLevel, 'Received response:', data);
            }
            callback(error, data)
        });
    }

    function setConfiguration(callback) {
        device.controlTransfer(                 // Send a Set Configuration control request
            0,                                  // bmRequestType
            0x09,                               // bmRequest
            0,                                  // wValue (Configuration value)
            UhkConnection.GENERIC_HID_INTERFACE_ID,                                  // wIndex
            new Buffer(0),                      // message to be sent
            callback                            // callback to be executed upon finishing the transfer
        );
    }

    function log(logLevel, message) {
        var args = Array.prototype.slice.call(arguments);
        args.shift();
        if (logLevel & selectedLogLevel) {
            console.log.apply(this, args);
        }
    }

    // Initialize

    var device;
    var usbInterface;

    self.connect = function(callback) {
        device = usb.findByIds(UhkConnection.VENDOR_ID, UhkConnection.PRODUCT_ID);
        if (!device) {
            return callback('Could not connect to the Ultimate Hacking Keyboard. Is it plugged in?');
        }
        device.open();  // TODO: What if multiple keyboards are plugged in?

        usbInterface = device.interface(0);
        if (usbInterface.isKernelDriverActive()) {
            usbInterface.detachKernelDriver();
        }

        usbInterface.claim();
        setConfiguration(callback)
    };
};

UhkConnection.VENDOR_ID = 0x16d2;
UhkConnection.PRODUCT_ID = 0x05ea;
UhkConnection.GENERIC_HID_INTERFACE_ID = 2;

UhkConnection.LOG_LEVELS = {
    TRANSFER:         0x01,
    IGNORED_TRANSFER: 0x02,
    ALL:              0xff
};

UhkConnection.COMMANDS = {
    REENUMERATE:  66,
    READ_EEPROM:  67,
    WRITE_EEPROM: 1
};

UhkConnection.ENUMERATION_MODES = {
    KEYBOARD:         0,
    BOOTLOADER_LEFT:  1,  // CDC bootloader
    BOOTLOADER_RIGHT: 2   // USB to serial
};

module.exports = UhkConnection;
