@echo off
echo Restoring fixed App.js...
copy src\App.js.backup src\App.js
echo.
echo App.js restored! Refresh your browser now.
echo The routing should work properly.
pause
