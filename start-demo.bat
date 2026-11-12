@echo off
TITLE RanTube Converter - Serveur Local Demo
COLOR 0A

echo ======================================================================
echo           RanTube Converter - Lancement du Serveur de Demo
echo ======================================================================
echo.

:: Verifier si Node.js est installe
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Node.js n'est pas installe ou non present dans le PATH.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

:: Verifier si le build frontend existe
if not exist "frontend\dist\index.html" (
    echo [INFO] Generation du build frontend statique pour la premiere utilisation...
    cd frontend
    call npm run build
    cd ..
)

echo [INFO] Demarrage du serveur local sur http://localhost:5000...
echo [INFO] Ouverture automatique dans votre navigateur...
echo.

start http://localhost:5000

node backend/src/server.js

pause

