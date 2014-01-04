var usb = require('usb');

vendorId = 0x16D0;
productId = 0x05EB;
interfaceNumber = 2;

device = usb.findByIds(vendorId, productId);
if (!device) {
    console.log('No device found');
    process.exit(1);
}
device.open();

var interface = device.interface(2);
if (interface.isKernelDriverActive()) {
    interface.detachKernelDriver();
}
interface.claim();

device.reset(function(error) {
    if (error) {
        console.log('Couldn\'t reset the device:', error);
        process.exit(2);
    }

    usb_initialized();
});

function setReport(message)
{
    device.controlTransfer(
        0x21,                     // bmRequestType (constant for this control request)
        0x09,                     // bmRequest (constant for this control request)
        0,                        // wValue (MSB is report type, LSB is report number)
        interfaceNumber,          // wIndex (interface number)
        message,                  // message to be sent
        function(error, data) {   // callback to be executed upon finishing the transfer
            console.log('Set Report(0x' +  message.toString('hex') + ') succeeded' );
        }
    );
}

function readUsb()
{
    endpoint = interface.endpoints[0];
    readLength = 8;
    endpoint.transfer(readLength, function(error, data) {
        if (error) {
            console.log('Read finished with error');
            console.log(error)
        } else {
            console.log('Read finished:', data);
        }
    });
}

function usb_initialized()
{
    console.log('usb initialized');
}
