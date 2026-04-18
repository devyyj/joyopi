# 프로젝트 자동 검증 스크립트 (Windows PowerShell)

$ErrorActionPreference = "Stop"

Write-Host ">>> [1/3] 린트 체크 시작 (ESLint)..." -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "!!! ESLint 검증 실패" -ForegroundColor Red
    exit 1
}

Write-Host ">>> [2/3] 타입 체크 시작 (TypeScript)..." -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "!!! 타입 체크 검증 실패" -ForegroundColor Red
    exit 1
}

Write-Host ">>> [3/3] 유닛 테스트 시작 (Vitest)..." -ForegroundColor Cyan
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "!!! 유닛 테스트 검증 실패" -ForegroundColor Red
    exit 1
}

Write-Host ">>> 모든 검증 성공!" -ForegroundColor Green
exit 0
