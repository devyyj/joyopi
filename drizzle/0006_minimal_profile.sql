-- 프로필 최소화: 한줄 자기소개와 프로필 사진 주소를 없앤다.
-- 스냅샷(meta/0006)은 이전에 스키마에서 빠진 meals·meal_images·name_ranks·shingeki_results 도 함께 따라잡지만,
-- 그 테이블들은 이 마이그레이션에서 지우지 않는다(이번 변경 범위 밖).
ALTER TABLE "profiles" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "avatar_url";
