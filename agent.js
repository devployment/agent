var usb = require('usb');

agentCommand = {
    REENUMERATE: 66
};

reenumerateAs = {
    KEYBOARD:      0,
    CDCBOOTLOADER: 1,
    USBTOSERIAL:   2
};

vendorId = 0x16D0;
productId = 0x05EB;
interfaceNumber = 2;

device = usb.findByIds(vendorId, productId);
if (!device) {
    console.log('No device found');
    process.exit(1);
}
device.open();  // TODO: What if multiple keyboards are plugged in?

var interface = device.interface(interfaceNumber);
if (interface.isKernelDriverActive()) {
    interface.detachKernelDriver();
}
interface.claim();

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

function sendAgentCommand(command, arg)
{
    setReport(new Buffer([command, arg]));
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
