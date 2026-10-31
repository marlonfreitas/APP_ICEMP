@echo off
title Servidor ICEB / ICEMP
echo ========================================================
echo   Iniciando o Aplicativo ICEMP / ICEs do Brasil
echo ========================================================
echo.
echo Servidor rodando em: http://localhost:8080
echo Abrindo navegador...
echo.
echo Pressione Ctrl + C para fechar o servidor quando terminar.
echo ========================================================
echo.
start http://localhost:8080
python -m http.server 8080
pause

