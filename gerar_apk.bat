@echo off
chcp 65001 > nul
echo ===================================================
echo     GERADOR DE APK - ICEMP (PRIMEIRA VERSÃO)
echo ===================================================
echo.
echo 1. Sincronizando arquivos do aplicativo web...
node prepare_www.js
if errorlevel 1 goto error

echo.
echo 2. Sincronizando projeto Android via Capacitor...
call npx cap sync android
if errorlevel 1 goto error

echo.
echo 3. Compilando APK via Gradle...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    cd ..
    goto error
)
cd ..

echo.
echo 4. Copiando APK para a raiz com o nome APP_ICEMP.apk...
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "APP_ICEMP.apk"
if errorlevel 1 goto error

echo.
echo ===================================================
echo   APK GERADO COM SUCESSO: APP_ICEMP.apk
echo ===================================================
echo.
pause
exit /b 0

:error
echo.
echo ===================================================
echo   ERRO DURANTE O PROCESSO DE ATUALIZAÇÃO / BUILD
echo ===================================================
echo.
pause
exit /b 1
