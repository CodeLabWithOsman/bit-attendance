@echo off
echo Removing pnpm-lock.yaml...
del pnpm-lock.yaml 2>nul

echo.
echo Running npm install...
npm install > npm-install-output.txt 2>&1

echo.
echo Output saved to npm-install-output.txt
echo Please check the file for errors.
type npm-install-output.txt
