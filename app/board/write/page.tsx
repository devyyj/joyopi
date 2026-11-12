import PostForm from '../components/post-form';
import { SectionHeader } from '@/app/components/ui';

export default function WritePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SectionHeader 
        title="문의 작성"
        description="궁금한 점이나 문제를 적어 주세요. 누구나 볼 수 있으니 개인정보는 적지 마세요."
        className="mb-8"
      />
      <PostForm />
    </div>
  );
}
