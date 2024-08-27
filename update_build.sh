#!/bin/bash

# Kept forgetting what commands it was to update the ionic android build.
# ionic build # Builds desktop app. THink it does it anyway with cap copy?
ionic cap copy
# ionic cap sync

read -p "open android studio? (y/n) " yn
case $yn in
    [Yy]* ) CAPACITOR_ANDROID_STUDIO_PATH=/Users/jai/Applications/Android\ Studio.app ionic cap open android;;
    * ) echo "";;
esac
