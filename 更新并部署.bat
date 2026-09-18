@echo off
chcp 65001 >nul
title 更新并部署品牌官网
cd /d "%~dp0"

rem 双击运行时系统 PATH 可能未刷新（新装的 Git 找不到），这里显式指定
set "PATH=C:\Program Files\Git\cmd;%PATH%"

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
echo 正在提交改动...
git add -A
if errorlevel 1 (
  echo.
  echo [错误] git add 失败，请确认 Git 已安装
  pause
  exit /b 1
)

git commit -m "更新品牌内容 %date% %time%"
if errorlevel 1 (
  echo.
  echo [提示] 没有需要推送的改动（内容未变化），无需部署
  pause
  exit /b 1
)

echo 正在推送到 GitHub...
git push origin main
if errorlevel 1 (
  echo.
  echo [错误] 推送失败！请检查网络或 GitHub 登录状态
  pause
  exit /b 1
)

echo.
echo 推送完成！GitHub 正在自动构建部署（约 1-2 分钟）
echo 之后访问 https://jubpenguin.github.io/brand-site/ 查看最新内容
echo.
pause
