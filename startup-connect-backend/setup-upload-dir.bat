@echo off
echo Setting up upload directory for pitch decks...

set UPLOAD_DIR=D:\startup-connect\uploads\pitchdecks

echo Creating directory: %UPLOAD_DIR%
if not exist "%UPLOAD_DIR%" mkdir "%UPLOAD_DIR%"

echo Setting permissions...
icacls "%UPLOAD_DIR%" /grant "Everyone:(OI)(CI)F" /T

echo Testing write permissions...
echo Test > "%UPLOAD_DIR%\test.txt"
if exist "%UPLOAD_DIR%\test.txt" (
    echo Write test successful
    del "%UPLOAD_DIR%\test.txt"
) else (
    echo WARNING: Write test failed
)

echo Setup complete!
pause 