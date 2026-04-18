import MainHeader from '@/app/components/main-header';
import { createPost } from '@/app/actions/board';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function WritePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인하지 않은 경우 목록으로 쫓아냄
  if (!user) {
    redirect('/board');
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6FF]">
      <MainHeader />
      
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight text-[#1E1B4B]">새 글 작성</h2>
        </div>

        <form action={createPost} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-bold text-slate-700">제목</label>
            <input 
              type="text" 
              name="title" 
              id="title"
              required 
              className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all font-medium text-[#1E1B4B]" 
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="content" className="font-bold text-slate-700">내용</label>
            <textarea 
              name="content" 
              id="content"
              required 
              rows={10}
              className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all font-medium resize-none text-[#1E1B4B]" 
              placeholder="자유롭게 글을 작성해보세요"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Link href="/board" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
              취소
            </Link>
            <button type="submit" className="px-8 py-3 rounded-xl bg-[#4F46E5] text-white font-bold hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95">
              등록하기
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
