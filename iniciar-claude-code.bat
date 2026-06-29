@echo off
REM ================================================
REM  Script: Iniciar Claude Code con Ollama
REM  Sistema: Windows CMD
REM ================================================

setlocal enabledelayedexpansion

color 0B
cls

echo.
echo ================================================
echo    Claude Code + Ollama en Windows
echo ================================================
echo.

REM Verificar Ollama
echo [1/3] Verificando Ollama...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Ollama no esta instalado o no esta en PATH
    echo Descarga desde: https://ollama.ai
    echo.
    pause
    exit /b
)
echo [OK] Ollama encontrado
echo.

REM Verificar Node.js
echo [2/3] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js no esta instalado
    echo.
    pause
    exit /b
)
echo [OK] Node.js encontrado
echo.

REM Verificar Claude Code
echo [3/3] Verificando Claude Code...
claude-code --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Claude Code no esta instalado. Instalando...
    call npm install -g @anthropic-ai/claude-code
    if %errorlevel% neq 0 (
        echo ERROR: No se pudo instalar Claude Code
        pause
        exit /b
    )
)
echo [OK] Claude Code encontrado
echo.

REM Verificar conexión Ollama
echo Verificando conexion con Ollama en localhost:11434...
timeout /t 2 /nobreak >nul

REM Configurar variables de entorno
echo.
echo ================================================
echo   Configurando Claude Code
echo ================================================
echo.

set OLLAMA_API_BASE=http://localhost:11434
set OLLAMA_MODEL=mistral

echo API Base: %OLLAMA_API_BASE%
echo Modelo: %OLLAMA_MODEL%
echo.

REM Listar modelos disponibles
echo Modelos disponibles en Ollama:
echo.
ollama list
echo.

REM Permitir seleccionar modelo
set /p MODEL_INPUT="Ingresa modelo a usar (presiona Enter para usar 'mistral'): "
if not "!MODEL_INPUT!"=="" (
    set OLLAMA_MODEL=!MODEL_INPUT!
)

echo.
echo ================================================
echo   Iniciando Claude Code
echo ================================================
echo.

REM Ejecutar Claude Code
claude-code

pause
