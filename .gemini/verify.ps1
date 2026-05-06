# .gemini/verify.ps1
# 프로젝트 정합성 및 안전성 검증 스크립트

Write-Host " 검증 프로세스를 시작합니다..." -ForegroundColor Cyan

# 1. 의존성 설치 확인 (생략 가능하지만 권장)
# npm install

# 2. Lint 체크
Write-Host "`n[1/4] Lint 체크 중..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Error "Lint 체크 실패!"
    exit 1
}

# 3. 테스트 실행
Write-Host "`n[2/4] 테스트 실행 중..." -ForegroundColor Yellow
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Error "테스트 실패!"
    exit 1
}

# 4. Git 추적되지 않은 파일 확인 (중요: 배포 에러 방지)
Write-Host "`n[3/4] Git 추적되지 않은 파일 확인 중..." -ForegroundColor Yellow
$untracked = git ls-files --others --exclude-standard
if ($untracked) {
    Write-Host " 경고: 다음 파일들이 Git에 의해 추적되지 않고 있습니다. 배포 시 누락될 수 있습니다:" -ForegroundColor Red
    $untracked | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    # 여기서 강제로 실패시키지는 않되, 사용자에게 명확한 경고를 줍니다.
    # 만약 배포에 필수적인 파일이 확실하다면 exit 1을 고려할 수 있습니다.
} else {
    Write-Host " 모든 파일이 정상적으로 추적되고 있습니다." -ForegroundColor Green
}

# 5. 빌드 시뮬레이션
Write-Host "`n[4/4] 프로덕션 빌드 시뮬레이션 중..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "빌드 실패!"
    exit 1
}

Write-Host "`n 모든 검증이 완료되었습니다. 안전하게 커밋/배포할 수 있습니다." -ForegroundColor Cyan
