@echo off
echo 🚀 Plumb PDF Processing Script
echo =============================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Check if required packages are installed
echo 📦 Checking required packages...
python -c "import chromadb, openai, PyPDF2" >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing required packages...
    pip install chromadb openai PyPDF2
    if errorlevel 1 (
        echo ❌ Failed to install packages
        pause
        exit /b 1
    )
)

REM Get PDF path from user
set /p PDF_PATH="Enter the path to your Plumb PDF file: "
if not exist "%PDF_PATH%" (
    echo ❌ PDF file not found: %PDF_PATH%
    pause
    exit /b 1
)

REM Get OpenAI API key from user
set /p API_KEY="Enter your OpenAI API key: "
if "%API_KEY%"=="" (
    echo ❌ OpenAI API key is required
    pause
    exit /b 1
)

echo.
echo 🔄 Processing PDF...
echo PDF: %PDF_PATH%
echo.

REM Run the Python script
python "%~dp0process_plumb_pdf.py" "%PDF_PATH%" "%API_KEY%"

if errorlevel 1 (
    echo ❌ Processing failed
    pause
    exit /b 1
)

echo.
echo ✅ Processing completed successfully!
echo Your PlumbRAG system is now ready to use.
pause

