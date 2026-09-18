@echo off
chcp 65001 >nul
title 更新并部署品牌官网
cd /d "%~dp0"

echo ============================================
echo   更新并部署品牌官网到 GitHub Pages
echo ============================================
echo.
echo 步骤1：启动本地编辑器（编辑品牌内容）
echo   - 运行「启动网站.bat」，打开 http://localhost:3000/editor
echo   - 修改内容后保存
echo.
echo 步骤2：本脚本会把改动推送到 GitHub，自动导出并部署
echo   线上地址：https://jubpenguin.github.io/brand-site/
echo.
set /p confirm=确认已保存好内容？按回车开始推送（取消请关窗口）...

echo.
echo 正在推送...
git add -A
git commit -m "更新品牌内容 %date% %time%"
git push origin main

echo.
echo 推送完成！GitHub 正在自动构建部署（约 1-2 分钟）。
echo 之后访问 https://jubpenguin.github.io/brand-site/ 查看最新内容
echo.
pause
