@echo off
REM Start both backend and frontend for development

echo Starting Anime Draft Arena...
echo.

echo [Step 1] Installing backend dependencies...
call npm install

echo.
echo [Step 2] Installing frontend dependencies...
cd client
call npm install
cd ..

echo.
echo ===================================
echo Setup complete!
echo ===================================
echo.
echo Next, run one of the following:
echo.
echo Option A (Recommended - Two terminals):
echo   Terminal 1: npm run dev
echo   Terminal 2: cd client ^&^& npm run dev
echo.
echo Option B (Production):
echo   npm run build
echo   cd client ^&^& npm run build
echo   cd ..
echo   npm start
echo.
pause
