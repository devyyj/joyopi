// 사업자 정보 — 모든 앱 페이지가 이 상수 하나를 가져다 쓴다. (docs/03_앱_스토어_페이지.md 3장)
// 값이 null인 항목은 화면에 줄 자체가 나오지 않는다. 받은 뒤 여기만 채우면 모든 페이지에 반영된다.

export interface BusinessInfoData {
  nameKo: string;
  nameEn: string;
  representative: string;
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
}

export const BUSINESS_INFO: BusinessInfoData = {
  nameKo: '조요피',
  nameEn: 'JOYOPI',
  representative: '조영용',
  registrationNumber: '180-21-02731',
  mailOrderNumber: null,
  addressKo: null,
  addressEn: null,
  phone: null,
  email: 'hello@joyopi.com',
  privacyOfficer: '조영용',
};

export const CONTACT_EMAIL = BUSINESS_INFO.email;
