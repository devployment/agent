#!/bin/bash
set -e

native_modules="usb"

node_webkit_version=`cat node-webkit.version`
for native_module in $native_modules; do
    echo "Rebuilding $native_module module..."
    cd node_modules/$native_module
    nw-gyp configure --target=$node_webkit_version
    nw-gyp build
    cd ../..
done
