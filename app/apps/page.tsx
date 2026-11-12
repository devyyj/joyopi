import { permanentRedirect } from 'next/navigation';

// 앱 목록은 홈(/)에 있다. /apps 로 들어오면 홈으로 보낸다.
export default function AppsIndex() {
  permanentRedirect('/');
}
