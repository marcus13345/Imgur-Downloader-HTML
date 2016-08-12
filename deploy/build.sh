#! /bin/bash

#sudo just so i never forget to elevate...
sudo electron-packager . --overwrite --platform=darwin --arch=x64 --icon=icons/mac.icns --out=bin

#variables because fuck you
source=./installer
title=SubSavur
size=200000
backgroundPictureName=image.png
dmgname=install_subsavur.dmg
applicationName="SubSavur.app"

cd bin #/bin

#delete old shit
sudo rm -f $dmgname
sudo rm -rf $source
sleep 1

#remake new old shit
mkdir installer
cd installer #/bin/installer
mkdir .background
cd .. #/bin

#copy app file
sudo cp -r SubSavur-darwin-x64/SubSavur.app installer/SubSavur.app
#and background image
sudo cp ../icons/macinstallerbackground.png installer/.background/image.png

#hdiutil create -srcfolder "${source}" -volname "${title}" -fs HFS+ -fsargs "-c c=64,a=16,e=16" -format UDRW -megabytes 200 ${dmgname}
sudo hdiutil create -srcfolder $source -volname $title -fs HFS+ -format UDRW $dmgname

#device=$(sudo hdiutil attach -readwrite -noverify -noautoopen $dmgname | egrep '^/dev/' | sed 1q | awk '{print $1}')
sudo hdiutil attach -noautoopen $dmgname

sudo echo '
   tell application "Finder"
     tell disk "'${title}'"
           open
           set current view of container window to icon view
           set toolbar visible of container window to false
           set statusbar visible of container window to false
           set the bounds of container window to {400, 100, 885, 430}
           set theViewOptions to the icon view options of container window
           set arrangement of theViewOptions to not arranged
           set icon size of theViewOptions to 72
           set background picture of theViewOptions to file ".background:'${backgroundPictureName}'"
           make new alias file at container window to POSIX file "/Applications" with properties {name:"Applications"}
           set position of item "'${applicationName}'" of container window to {100, 100}
           set position of item "Applications" of container window to {375, 100}
           update without registering applications
           delay 5
           close
     end tell
   end tell
' | osascript