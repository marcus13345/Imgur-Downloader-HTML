
::build the EXE and stuff
call electron-packager . --overwrite --platform=win32 --arch=ia32 --icon=icons/windows.ico --out=bin

::package those into an MSI
call AdvancedInstaller.com /rebuild SubSavur-win.aip

::make the folder
if not exist .\bin\SubSavur-win-SetupFiles mkdir .\bin\SubSavur-win-SetupFiles

::copy shit into it
copy .\SubSavur-win-SetupFiles\SubSavur-win.msi .\bin\SubSavur-win-SetupFiles\SubSavur-win.msi

::delete the old folder
rd /s /q .\SubSavur-win-SetupFiles
