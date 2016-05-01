electron-packager . --overwrite --platform=darwin --arch=x64 --icon=icons/mac.icns --out=bin
hdiutil create -volname Install\ SubSavr -srcfolder ./bin/SubSavr-darwin-x64 -ov -format UDZO installer.dmg
