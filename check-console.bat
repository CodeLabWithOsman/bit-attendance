@echo off
echo Checking for build errors...
npm start > npm-start-output.txt 2>&1 &
timeout /t 15 /nobreak
echo.
echo Check the browser console (F12) for errors
echo Also check npm-start-output.txt for server errors
pause
