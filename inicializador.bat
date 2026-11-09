@echo off

IF EXIST node_modules (
    echo Pasta node_modules encontrada. Pulando instalacao...
) ELSE (
    echo Pasta node_modules nao encontrada.
    echo Instalando dependencias do projeto...
    call npm install
    echo.
    echo Dependencias instaladas com sucesso!
)

echo Iniciando o servidor de desenvolvimento...
call npm run dev
pause
