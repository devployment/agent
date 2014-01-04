#!/bin/bash

node_webkit_version=`cat node-webkit.version`
cd node_modules/usb
nw-gyp configure --target=$node_webkit_version &&
nw-gyp build
