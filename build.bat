call electron-packager . --overwrite --platform=win32 --arch=ia32 --icon=icons/windows.ico --out=bin
call AdvancedInstaller.com /rebuild SubSavur-win.aip
move SubSavur-win-SetupFiles bin/
