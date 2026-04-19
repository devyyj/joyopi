'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()

  if (!title || !content) {
    throw new Error('제목과 내용을 입력해주세요.')
  }

  const { db } = await import('@/db')
  const { profiles } = await import('@/db/schema')
  const { eq } = await import('drizzle-orm')

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id)
  })

  const authorName = profile?.nickname || '익명'

  await db.insert(posts).values({
    title,
    content,
    authorId: user.id,
    authorName,
  })

  revalidatePath('/board')
  redirect('/board')
}

export async function updatePost(id: number, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()

  if (!title || !content) {
    throw new Error('제목과 내용을 입력해주세요.')
  }

  // 본인이 작성한 글인지 확인 후 수정
  await db.update(posts)
    .set({ title, content })
    .where(and(eq(posts.id, id), eq(posts.authorId, user.id)))

  revalidatePath(`/board/${id}`)
  revalidatePath('/board')
  redirect(`/board/${id}`)
}

export async function deletePost(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  // 본인이 작성한 글만 삭제 가능하도록 체크
  await db.delete(posts).where(and(eq(posts.id, id), eq(posts.authorId, user.id)))
  
  revalidatePath('/board')
  redirect('/board')
}
