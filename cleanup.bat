::make the folder
if not exist .\bin\SubSavur-win-SetupFiles mkdir .\bin\SubSavur-win-SetupFiles

::copy shit into it
copy .\SubSavur-win-SetupFiles\SubSavur-win.msi .\bin\SubSavur-win-SetupFiles\SubSavur-win.msi

::delete the old folder
rd /s /q .\SubSavur-win-SetupFiles
