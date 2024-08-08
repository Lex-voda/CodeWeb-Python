@echo off
cd /d "D:\PythonWorkShop\CodeWeb_release\CodeWeb-Python\frontend"
if %errorlevel% neq 0 (
    echo "Error: frontend directory not found."
    exit /b 1
)
call wt -w 0 nt -d . "npm run dev"
if %errorlevel% neq 0 (
    echo "Error: npm run dev failed."
    exit /b 1
)
cd /d "D:\PythonWorkShop\CodeWeb_release\CodeWeb-Python"
call wt -w 0 nt -d . "D:/anaconda3/python.exe d:/PythonWorkShop/Project/CodeWeb_python/Management_Layer/app.py"