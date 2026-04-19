import PostForm from '../components/post-form';
import { SectionHeader } from '@/app/components/ui/core';

export default function WritePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SectionHeader 
        title="새 글 작성"
        description="새로운 이야기를 들려주세요."
        className="mb-8"
      />
      <PostForm />
    </div>
  );
}
