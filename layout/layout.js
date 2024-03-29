var layers = {
    'base': {
        'a1' : '~\n`',
        'a2' : '!\n1',
        'a3' : '@\n2',
        'a4' : '#\n3',
        'a5' : '$\n4',
        'a6' : '%\n5',
        'a7' : '^\n6',
        'a8' : '&\n7',
        'a9' : '*\n8',
        'a10': '(\n9',
        'a11': ')\n0',
        'a12': '_\n-',
        'a13': '+\n=',
        'a14': '←',
        'b1' : 'Tab',
        'b2' : 'Q',
        'b3' : 'W',
        'b4' : 'E',
        'b5' : 'R',
        'b6' : 'T',
        'b7' : 'Y',
        'b8' : 'U',
        'b9' : 'I',
        'b10': 'O',
        'b11': 'P',
        'b12': '{\n[',
        'b13': '}\n]',
        'b14': '|\n\\',
        'c1' : 'Mouse',
        'c2' : 'A',
        'c3' : 'S',
        'c4' : 'D',
        'c5' : 'F',
        'c6' : 'G',
        'c7' : 'H',
        'c8' : 'J',
        'c9' : 'K',
        'c10': 'L',
        'c11': ':\n;',
        'c12': '"\n\'',
        'c13': 'Enter',
        'd1' : 'Shift',
        'd2' : 'Z',
        'd3' : 'X',
        'd4' : 'C',
        'd5' : 'V',
        'd6' : 'B',
        'd7' : 'N',
        'd8' : 'M',
        'd9' : '<\n,',
        'd10': '>\n.',
        'd11': '?\n/',
        'd12': 'Shift',
        'e1' : 'Super',
        'e2' : 'Ctrl',
        'e3' : 'Alt',
        'e4' : 'Fn',
        'e5' : 'Mod',
        'e6' : 'Space',
        'e7' : 'Fn',
        'e8' : 'Alt',
        'e9' : 'Ctrl',
        'e10': 'Super',
        'f1' : 'Space',
        'f2' : 'Mod',
    },
    'mod': {
        'a1' : 'Esc',
        'a2' : 'F1',
        'a3' : 'F2',
        'a4' : 'F3',
        'a5' : 'F4',
        'a6' : 'F5',
        'a7' : 'F6',
        'a8' : 'F7',
        'a9' : 'F8',
        'a10': 'F9',
        'a11': 'F10',
        'a12': 'F11',
        'a13': 'F12',
        'b2' : '[x',
        'b3' : '[p',
        'b4' : '[+',
        'b5' : '[n',
        'b7' : 'PgUp',
        'b8' : 'Home',
        'b9' : '↑',
        'b10': 'End',
        'b11': 'Delete',
        'b12': 'PrtScr',
        'b13': 'ScrLk',
        'b14': 'Pause',
        'c2' : '[c',
        'c4' : '[w',
        'c7' : 'PgDn',
        'c8' : '←',
        'c9' : '↓',
        'c10': '→',
        'c11': 'Insert',
        'e5' : '-Mod',
        'f2' : '-Mod',
    },
    'fn': {
        'b3' : 'stop',
        'b4' : 'reload',
        'b8' : 'play',
        'b9' : 'vol +',
        'b10': 'pause',
        'b14': 'sleep',
        'c3' : 'hist -',
        'c4' : 'www',
        'c5' : 'hist +',
        'c8' : 'track -',
        'c9' : 'vol -',
        'c10': 'track +',
        'd2' : 'lock',
        'd3' : 'search',
        'd4' : 'calc',
        'd5' : 'eject',
        'd9' : 'mute',
        'e4' : '-Fn',
        'e7' : '-Fn',
    },
    'mouse': {
        'c1' : '-Mouse',
        'c3' : 'right\nclick',
        'c4' : 'middle\nclick',
        'c5' : 'left\nclick',
        'b7' : 'wheel\nup',
        'b8' : 'button\n4',
        'b9' : '↑',
        'b10': 'button\n5',
        'b11': 'button\n6',
        'c7' : 'wheel\ndown',
        'c8' : '←',
        'c9' : '↓',
        'c10': '→',
        'e5': 'accelerate',
        'f1': 'decelerate',
    }
}

// Globals

var layout;
var normalKeycapHeight;
var bottomKeycapHeight;
var singleLineHeight;
var doubleLineHeight;
var labelGap;
var bottomLabelGap;
var view = getParameterByName('view');
var action = getParameterByName('action');
var filename = getParameterByName('filename');
var layer = getParameterByName('layer');
var textLabels = [];
if (!layer) {
    layer = 'base';
}

// Constants

var fontSize;
var fontFamily = 'Helvetica';
var keycapHeightInMm = 18;
var keycapTopHeight = 13.8;
var keycapTopWidth = 12.5;
var textLeading = 1.6;

keycapOffsets = [
    -1.252,
    -1.363,
    -1.448,
    -1.539,
    -1.539,
    0,
];

// Main functions

$.get('layout.svg', function(data) {
    var serializer = new XMLSerializer();
    var rawSvg = serializer.serializeToString(data);
    var root = SVG('layout').svg(rawSvg);
    layout = root.roots()[0];

    fontSize = view == 'schematic' ? 19 : 15;

    var fontProperties = {family:fontFamily, size:fontSize, anchor:'middle'};
    var text = layout.text('A').font(fontProperties).addTo(SVG.get('left-parts'));
    singleLineHeight = text.bbox().height;
    text.remove();

    var text = layout.text('A\nA').leading(textLeading).font(fontProperties).addTo(SVG.get('left-parts'));
    doubleLineHeight = text.bbox().height;
    text.remove();

    normalKeycapHeight = SVG.get('a1').height();
    bottomKeycapHeight = SVG.get('f1').height();

    $.each(layers[layer], function(keyId, label) {
        labelKey(keyId, label);
    });

    if (view == 'print') {
        changeKeycapContours();
        SVG.get('left-case').hide();
        SVG.get('right-case').hide();
        SVG.get('root').fill('#000000');
        SVG.get('layer-text').remove();
    } else {
        SVG.get('root').fill('#333333');
        var layerText = layer + ' layer';
        layerText = layerText.charAt(0).toUpperCase() + layerText.slice(1);
        SVG.get('layer-text').text(layerText);
    }

    if (action == 'save') {
        var exported = layout.exportSvg({whitespace: '    '});
        var blob = new Blob([exported], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename);
    }
});

function labelKey(keyId, label)
{
    var keycapHeight = isBottommostKey(keyId) ? bottomKeycapHeight : normalKeycapHeight;

    var hasLabelOneLine = label.indexOf('\n') === -1;
    var lineHeight = hasLabelOneLine ? singleLineHeight : doubleLineHeight;

    var labelGap = (keycapHeight - lineHeight) / 2;

    if (label.charAt(0) == '-') {
        label = label.substr(1);
        if (view == 'schematic') {
            SVG.get(keyId).fill('#800');
        }
    }

    var offset = 0;
    if (view == 'print') {
        var rowNumber = keyIdToRowNumber(keyId);
        offset = keycapOffsets[rowNumber];
        offset = mmToSvgUnit(offset);
    }

    var font = fontFamily;
    var isIcon = label.charAt(0) == '[';

    var currentFontSize;
    if (view=='print' && layer=='mod') {
        currentFontSize = 12;
        offset -= 5;
    } else {
        currentFontSize = fontSize;
    }

    if (isIcon) {
        label = label.substr(1);
        font = 'icomoon';
        currentFontSize = 1.3*currentFontSize
    }

    var key = SVG.get(keyId);
    var text = layout.
        text(label).
        leading(textLeading).
        font({family:font, size:currentFontSize, anchor:'middle'}).
        fill('#fff').
        move(key.x()+key.width()/2, key.y()+labelGap+offset).
        addTo(key.parent);

    textLabels.push(text);
}

function changeKeycapContours()
{
    $.each(layers['base'], function(keyId) {
        if (!isBottommostKey(keyId)) {
            if (layer == 'mod') {
                showKeycapFront(keyId);
            } else {
                showKeycapTop(keyId);
            }
        }
    });

    if (layer == 'mod') {
        textLabels.forEach(function(textLabel) {
            if (textLabel.content != 'Mod') {
                textLabel.clone();
            }
            textLabel.remove();
        });
    }
}

function showKeycapTop(keyId)
{
    var key = SVG.get(keyId);
    var keyWidthDifference = mmToSvgUnit(keycapHeightInMm-keycapTopWidth);
    var keyHeightDifference = mmToSvgUnit(keycapHeightInMm-keycapTopHeight);
    var rowNumber = keyIdToRowNumber(keyId);
    var keyOffset = mmToSvgUnit(keycapOffsets[rowNumber]);

    key.width(key.width() - keyWidthDifference);
    key.height(key.height() - keyHeightDifference);
    key.x(key.x() + keyWidthDifference/2);
    key.y(key.y() + keyHeightDifference/2 + keyOffset);
}

function showKeycapFront(keyId)
{
    var key = SVG.get(keyId);
    var keyWidthDifference = mmToSvgUnit(keycapHeightInMm-keycapTopWidth);
    var keyHeightDifference = mmToSvgUnit(keycapHeightInMm-keycapTopHeight);
    var rowNumber = keyIdToRowNumber(keyId);
    var keyOffset = mmToSvgUnit(keycapOffsets[rowNumber]);

    var offsetY = 3;
    var centerX = key.x() + key.width()/2;
    var topWidth = key.width() - keyWidthDifference;
    var bottomWidth = key.width();
    var topLeft = centerX - topWidth/2;
    var topRight = centerX + topWidth/2;
    var bottomLeft = centerX - bottomWidth/2;
    var bottomRight = centerX + bottomWidth/2;
    var top = key.y() + mmToSvgUnit(offsetY);
    var bottom = top + mmToSvgUnit(9.32);

    key.parent.polygon(
        topLeft     + ',' + top    + ' ' +
        topRight    + ',' + top    + ' ' +
        bottomRight + ',' + bottom + ' ' +
        bottomLeft  + ',' + bottom
    );

    key.remove();
}

// Utility functions

function mmToSvgUnit(mm)
{
    return (normalKeycapHeight / keycapHeightInMm) * mm;
}

function keyIdToRowNumber(keyId)
{
    return keyId.charCodeAt(0) - 'a'.charCodeAt(0);
}

function isBottommostKey(keyId)
{
    return keyIdToRowNumber(keyId) == 5;
}

function getParameterByName(name) {
    // Borrowed from http://stackoverflow.com/a/901144/1449117
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
