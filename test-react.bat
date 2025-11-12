@echo off
echo Step 1: Stop the current server (press Ctrl+C if running)
pause

echo.
echo Step 2: Creating backup of index.js
copy src\index.js src\index.js.backup

echo.
echo Step 3: Replacing with test version
copy src\index-test.js src\index.js

echo.
echo Step 4: Starting development server
echo If you see "React is working!" in the browser, then the issue is with the App component
echo.
npm start

pause
