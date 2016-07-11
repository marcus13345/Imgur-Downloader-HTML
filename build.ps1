
#build the EXE and stuff
electron-packager . --overwrite --platform=win32 --arch=ia32 --icon=icons/windows.ico --out=bin

$a = Get-Content aip_version
echo $a

#update the aip with the correct version information
AdvancedInstaller.com /edit SubSavur-win.aip /SetVersion $a

#package those into an MSI
AdvancedInstaller.com /rebuild SubSavur-win.aip

./cleanup.bat
