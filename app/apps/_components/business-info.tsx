import type { Lang } from '@/app/_i18n/config';
import { BUSINESS_INFO, type BusinessInfoData } from '../_lib/business-info';

export type { Lang };

const LABELS: Record<Lang, Record<'heading' | 'name' | 'representative' | 'registration' | 'mailOrder' | 'address' | 'phone' | 'email', string>> = {
  ko: {
    heading: '사업자 정보',
    name: '상호',
    representative: '대표자',
    registration: '사업자등록번호',
    mailOrder: '통신판매업 신고번호',
    address: '주소',
    phone: '전화',
    email: '이메일',
  },
  en: {
    heading: 'Business information',
    name: 'Business name',
    representative: 'Representative',
    registration: 'Business registration no.',
    mailOrder: 'Mail-order business report no.',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
  },
  ja: {
    heading: '事業者情報',
    name: '商号',
    representative: '代表者',
    registration: '事業者登録番号',
    mailOrder: '通信販売業届出番号',
    address: '住所',
    phone: '電話',
    email: 'メール',
  },
};

interface BusinessInfoProps {
  lang?: Lang;
  info?: BusinessInfoData;
  className?: string;
}

/** 사업자 정보 표. 값이 없는 항목은 줄을 만들지 않는다. */
export default function BusinessInfo({ lang = 'ko', info = BUSINESS_INFO, className = '' }: BusinessInfoProps) {
  const t = LABELS[lang];
  const rows: [string, string | null][] = [
    [t.name, lang === 'ko' ? `${info.nameKo}(${info.nameEn})` : info.nameEn],
    [t.representative, lang === 'ko' ? info.representative : info.representativeEn],
    [t.registration, info.registrationNumber],
    [t.mailOrder, info.mailOrderNumber],
    [t.address, lang === 'ko' ? info.addressKo : info.addressEn],
    [t.phone, info.phone],
  ];

  return (
    <section aria-label={t.heading} className={`text-xs text-muted ${className}`}>
      <h2 className="text-xs font-bold text-foreground mb-2">{t.heading}</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {rows
          .filter((row): row is [string, string] => Boolean(row[1]))
          .map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="whitespace-nowrap">{label}</dt>
              <dd className="break-words text-foreground">{value}</dd>
            </div>
          ))}
        <div className="contents">
          <dt className="whitespace-nowrap">{t.email}</dt>
          <dd className="break-words">
            <a href={`mailto:${info.email}`} className="text-primary underline underline-offset-2">
              {info.email}
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
