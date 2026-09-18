@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   快消品品牌官网模板 - 开发服务器
echo ============================================
echo.
echo 官网:   http://localhost:3000
echo 编辑器: http://localhost:3000/editor
echo.
echo 按 Ctrl+C 停止服务器
echo --------------------------------------------
echo.
npm run dev
pause
