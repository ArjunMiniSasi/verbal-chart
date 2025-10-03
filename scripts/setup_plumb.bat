@echo off
echo 🚀 PlumbRAG Setup Script
echo =======================

echo 📋 This script will help you set up PlumbRAG for your Medora system.
echo.

REM Check if we're in the right directory
if not exist "..\src\lib\plumbRAG.ts" (
    echo ❌ Please run this script from the scripts directory
    echo Expected to find: ..\src\lib\plumbRAG.ts
    pause
    exit /b 1
)

echo ✅ Found PlumbRAG system files
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo ✅ Python is available
echo.

REM Install required packages
echo 📦 Installing required Python packages...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install packages
    pause
    exit /b 1
)

echo ✅ Packages installed successfully
echo.

REM Check if data directory exists
if not exist "..\data" (
    echo 📁 Creating data directory...
    mkdir "..\data"
)

echo ✅ Data directory ready
echo.

echo 🎯 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Place your Plumb PDF file somewhere accessible
echo 2. Get your OpenAI API key from https://platform.openai.com/api-keys
echo 3. Run: process_plumb.bat
echo 4. Follow the prompts to process your PDF
echo.
echo 💡 Tip: You can also run the Python script directly:
echo    python process_plumb_pdf.py "path\to\your\pdf.pdf" "your-api-key"
echo.
pause

