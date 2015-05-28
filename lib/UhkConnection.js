var usb = require('usb');
var R = require('ramda');

var UhkConnection = function(selectedLogLevel) {
    'use strict';
    var self = this;

    // Public methods

    self.sendRequest = function(command, arg, callback, shouldReceiveResponse) {
        if (shouldReceiveResponse === undefined) {
            shouldReceiveResponse = true;
        }

        var request;
        if (arg === null) {
            request = new Buffer([command]);
        } else if (typeof arg === 'number') {
            request = new Buffer([command, arg]);
        } else if (typeof arg === 'string') {
            var charCodes = arg.split('').map(function(char) {return char.charCodeAt(0)});
            request = new Buffer([command].concat(charCodes));
        } else {
            throw new Error('UhkConnection.sendRequest(): arg is of unknown type');
        }

        log(UhkConnection.LOG_LEVELS.TRANSFER, 'Sending request', request);
        setReport(request, function() {
            if (shouldReceiveResponse) {
                receiveResponse(UhkConnection.LOG_LEVELS.IGNORED_TRANSFER, function () {
                    // The first response is cached by the OS so let's ignore it and go for the second one.
                    receiveResponse(UhkConnection.LOG_LEVELS.TRANSFER, callback);
                });
            } else {
                callback();
            }
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

    self.connect = function(errorCallback) {
        var foundDevices = UhkConnection.ENUMERATION_MODES.map(function(enumerationMode) {
            return {
                enumerationMode: enumerationMode,
                device: usb.findByIds(UhkConnection.VENDOR_ID, enumerationMode.productId)
            }
        }).filter(R.prop('device'));

        if (foundDevices.length === 0) {
            return errorCallback('Could not connect to the Ultimate Hacking Keyboard. Is it connected to the host?');
        }

        var foundDevice = foundDevices[0];
        console.log('The Ultimate Hacking Keyboard is enumerated in %s mode.', foundDevice.enumerationMode.id);

        device = foundDevice.device;
        device.open();  // TODO: What if multiple keyboards are plugged in?

        usbInterface = device.interface(0);
        if (usbInterface.isKernelDriverActive()) {
            usbInterface.detachKernelDriver();
        }

        usbInterface.claim();
        setConfiguration(errorCallback)
    };
};

UhkConnection.VENDOR_ID = 0x16d2;
UhkConnection.GENERIC_HID_INTERFACE_ID = 2;

UhkConnection.LOG_LEVELS = {
    TRANSFER:         0x01,
    IGNORED_TRANSFER: 0x02,
    ALL:              0xff
};

UhkConnection.COMMANDS = {
    REENUMERATE:  0,
    READ_EEPROM:  67,
    WRITE_EEPROM: 1
};

UhkConnection.ENUMERATION_MODES = [
    {id:'KEYBOARD_6KRO',    enumerationId:0, productId:0x05ea},
    {id:'KEYBOARD_NKRO',    enumerationId:3, productId:0x05eb},  // TODO: Implement this mode in firmware.
    {id:'BOOTLOADER_RIGHT', enumerationId:1, productId:0x05ec},  // CDC bootloader
    {id:'BOOTLOADER_LEFT',  enumerationId:2, productId:0x05ed}   // USB to serial
];

module.exports = UhkConnection;
