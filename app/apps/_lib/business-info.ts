// 사업자 정보 — 모든 앱 페이지가 이 상수 하나를 가져다 쓴다. (docs/03_앱_스토어_페이지.md 3장)
// 값이 null인 항목은 화면에 줄 자체가 나오지 않는다. 여기만 고치면 모든 페이지에 반영된다.
// 값의 원본: 사업자등록증·영문 사업자등록증명·통신판매업 신고증. 전화는 사업용 번호만 쓴다.

export interface BusinessInfoData {
  nameKo: string;
  nameEn: string;
  representative: string;
  /** 영문 사업자등록증명의 대표자 표기 */
  representativeEn: string;
  registrationNumber: string;
  /** 통신판매업 신고번호 (신고증) */
  mailOrderNumber: string | null;
  /** 국문 사업장 주소 */
  addressKo: string | null;
  /** 영문 사업자등록증명과 같은 표기 */
  addressEn: string | null;
  /** 사업용 전화 */
  phone: string | null;
  email: string;
  /** 개인정보 보호책임자 */
  privacyOfficer: string;
  privacyOfficerEn: string;
}

export const BUSINESS_INFO: BusinessInfoData = {
  nameKo: '조요피',
  nameEn: 'JOYOPI',
  representative: '조영용',
  representativeEn: 'JO YOUNGYONG',
  registrationNumber: '180-21-02731',
  mailOrderNumber: '제 2026-용인처인-02193 호',
  addressKo: '경기도 용인시 처인구 낙은로 11, 103동 1103호 (역북동, 역북신원아침도시)',
  addressEn: '103-1103, 11 Nageun-ro, Cheoin-gu, Yongin-si, Gyeonggi-do, 17046, Republic of Korea',
  phone: '010-6441-4436',
  email: 'hello@joyopi.com',
  privacyOfficer: '조영용',
  privacyOfficerEn: 'JO YOUNGYONG',
};

export const CONTACT_EMAIL = BUSINESS_INFO.email;
