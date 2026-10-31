@echo off
chcp 65001 > nul
echo ===================================================
echo     ATUALIZADOR DE DADOS - ICEB BRASIL
echo ===================================================
echo.
echo 1. Lendo alteracoes da planilha e pasta dados_igrejas...
python build_data.py
echo.
echo 2. Sincronizando arquivos do aplicativo web...
node prepare_www.js
echo.
echo 3. Sincronizando projeto Android...
call npx cap sync android
echo.
echo ===================================================
echo   APLICATIVO E ANDROID ATUALIZADOS COM SUCESSO!
echo ===================================================
echo.
pause
