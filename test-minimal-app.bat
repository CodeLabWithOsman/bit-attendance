@echo off
echo Creating backup and testing with minimal App...
echo.

echo Backing up current App.js
copy src\App.js src\App.js.backup

echo Replacing with minimal test version
copy src\App-test.js src\App.js

echo.
echo Now refresh your browser!
echo If you see "BIT Attendance System", the problem is in the original App.js
echo.
echo To restore original App.js, run: copy src\App.js.backup src\App.js
pause
