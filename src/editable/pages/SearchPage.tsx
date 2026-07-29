import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { toPlainText } from '@/editable/cards/PostCards'
import { pagesContent } from '@/editable/content/pages.content'
import { isUiHiddenTask } from '@/editable/content/global.content'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const summaryOf = (post: SitePost) => {
  const content = getContent(post)
  return toPlainText(
    (typeof post.summary === 'string' && post.summary) ||
    compactRaw(content.description) ||
    compactRaw(content.excerpt) ||
    compactRaw(content.body) ||
    '',
  )
}

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post }: { post: SitePost }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'

  return (
    <Link href={href} className="group flex gap-5 rounded-xl border border-neutral-200 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#f14a1c] hover:shadow-lg sm:p-5">
      {image ? (
        <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:block">
          <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#f14a1c]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#f14a1c]">{taskLabel}</span>
        </div>
        <h2 className="mt-2 line-clamp-2 text-base font-bold leading-snug tracking-[-0.01em]">{post.title}</h2>
        {summary ? <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-neutral-500">{summary}</p> : null}
      </div>
      <ArrowUpRight className="mt-1 hidden h-4 w-4 shrink-0 text-neutral-500 transition group-hover:text-[#f14a1c] sm:block" />
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && !isUiHiddenTask(item.key))

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-white text-neutral-900">
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f14a1c]">{pagesContent.search.hero.badge}</p>
            <h1 className="editable-display mt-4 max-w-2xl text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-4xl">{pagesContent.search.hero.title}</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-500">{pagesContent.search.hero.description}</p>

            <form action="/search" className="mt-8 max-w-3xl">
              <input type="hidden" name="master" value="1" />
              <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#f14a1c] focus-within:shadow-md">
                <Search className="h-5 w-5 text-neutral-500" />
                <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-neutral-400" />
                <button type="submit" className="rounded-lg bg-[#f14a1c] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-90">Search</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <input name="category" defaultValue={category} placeholder="Category" className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium outline-none placeholder:text-neutral-400 focus:border-[#f14a1c]" />
                <select name="task" defaultValue={task} className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#f14a1c]">
                  <option value="">All types</option>
                  {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
              </div>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-10 sm:py-14 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-500">{results.length} results</p>
              <h2 className="editable-display mt-1 text-xl font-bold tracking-[-0.01em]">{query ? `Results for "${query}"` : pagesContent.search.resultsTitle}</h2>
            </div>
          </div>

          {results.length ? (
            <div className="mt-6 grid gap-3">
              {results.map((post) => <SearchResultCard key={post.id || post.slug} post={post} />)}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
              <p className="text-lg font-bold">No matching results found.</p>
              <p className="mt-2 text-sm text-neutral-500">Try a different keyword, type, or category.</p>
            </div>
          )}

          <div className="mt-12">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
