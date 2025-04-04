@echo off
echo Cleaning Next.js cache...
npx next clean

echo Building Next.js app...
npx next build

echo Build process completed
pause 