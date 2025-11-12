@echo off
echo ========================================
echo BIT ATTENDANCE SYSTEM - SETUP WIZARD
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Creating required directories...
mkdir app\about 2>nul
mkdir app\attendance 2>nul
mkdir app\tryhackme 2>nul
mkdir components\ui 2>nul
echo     ✓ Directories created
echo.

echo [2/5] Installing dependencies...
echo     This may take a few minutes...
call npm install
echo     ✓ Dependencies installed
echo.

echo [3/5] Setup complete! Next steps:
echo.
echo     OPTION A - Copy from instructions folder:
echo     1. Copy files from C:\instructions for bit-attendance\app\
echo     2. Paste into your app\ folder
echo     3. Adjust imports if needed
echo.
echo     OPTION B - Install UI components:
echo     Run: npx shadcn@latest add button dialog input label switch select
echo.

echo [4/5] To start development server:
echo     npm run dev
echo.

echo [5/5] To deploy to GitHub Pages:
echo     npm run build
echo     npm run deploy
echo.

echo ========================================
echo Setup wizard completed!
echo ========================================
echo.
echo Read FINAL-STATUS.md for detailed next steps
echo.
pause
