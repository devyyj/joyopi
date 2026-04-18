# 프로젝트 자동 검증 스크립트 (Windows PowerShell)

$ErrorActionPreference = "Stop"

Write-Host ">>> [1/2] 린트 체크 시작 (ESLint)..." -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "!!! ESLint 검증 실패" -ForegroundColor Red
    exit 1
}

Write-Host ">>> [2/2] 타입 체크 시작 (TypeScript)..." -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "!!! 타입 체크 검증 실패" -ForegroundColor Red
    exit 1
}

Write-Host ">>> 모든 검증 성공!" -ForegroundColor Green
exit 0
