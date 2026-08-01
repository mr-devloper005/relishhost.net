import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, Download, FileText, Globe, MapPin, Phone, Search, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { dedupeUrls } from '@/editable/cards/PostCards'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return dedupeUrls([...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])]).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value
  .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#0?39;|&apos;/gi, "'")
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-7 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const cardBase = 'group block rounded-xl border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="border-b border-[var(--tk-line)] bg-[var(--tk-bg)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-6 py-16 sm:py-20 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">{theme.kicker}</p>
            <h1 className="editable-display mt-4 max-w-3xl text-balance text-[2.5rem] font-bold leading-[1.08] tracking-[-0.02em] sm:text-5xl">
              {voice?.headline || `Browse ${label}`}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>
            {voice?.chips?.length ? (
              <div className="mt-7 flex flex-wrap gap-2">
                {voice.chips.map((chip) => (
                  <span key={chip} className="rounded-md border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3 py-1.5 text-xs font-medium text-[var(--tk-muted)]">{chip}</span>
                ))}
              </div>
            ) : null}

            <div className="mt-10 flex flex-col gap-4 border-t border-[var(--tk-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--tk-muted)]">
                <span className="font-semibold text-[var(--tk-text)]">{posts.length}</span> {posts.length === 1 ? 'post' : 'posts'} · {categoryLabel}
              </p>
              <form action={basePath} className="flex items-center gap-2.5">
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-10 appearance-none rounded-lg border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className="inline-flex h-10 items-center rounded-lg bg-[var(--tk-accent)] px-5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-90">Apply</button>
              </form>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
          {posts.length ? (
            <>
              <div className={taskGrid[task]}>
                {posts.map((post, index) => {
                  const card = <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />
                  if (task === 'sbm' && index === 4) {
                    return (
                      <div key={`ad-${post.id || post.slug}`} className="contents">
                        {card}
                        <div className="col-span-full py-4">
                          <Ads slot="in-feed" size={pickRandom(getSlotSizes('in-feed'))} showLabel />
                        </div>
                      </div>
                    )
                  }
                  return card
                })}
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-xl border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-semibold tracking-[-0.02em]">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-14 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-lg border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-lg border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-lg border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} />
}

function ArticleArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{category}</p>
        <h2 className="editable-display mt-2.5 text-xl font-semibold leading-snug tracking-[-0.01em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex items-center gap-5 p-5`}>
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-8 w-8 text-[var(--tk-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display truncate text-lg font-semibold">{post.title}</h2>
        <p className="mt-1.5 line-clamp-1 text-sm text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website</span> : null}
        </div>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-2xl font-bold text-[var(--tk-accent)]">{price || 'Open offer'}</span>
        {condition ? <span className="rounded-md bg-[var(--tk-accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--tk-accent)]">{condition}</span> : null}
      </div>
      <h2 className="editable-display mt-4 text-lg font-semibold leading-snug">{post.title}</h2>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-5 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-xs font-medium text-[var(--tk-muted)]">
        <span>{location ? <><MapPin className="mr-1 inline h-3.5 w-3.5" />{location}</> : 'Details inside'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)]" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-xl border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.72))] opacity-80 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className="editable-display line-clamp-2 text-base font-semibold leading-snug text-white">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const website = getField(post, ['website', 'url', 'link'])
  const image = getImage(post)
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
          {website ? <span className="truncate text-xs font-medium text-[var(--tk-accent)]">{cleanDomain(website)}</span> : <span className="text-xs font-medium text-[var(--tk-muted)]">Resource</span>}
        </div>
        <h2 className="editable-display mt-2.5 line-clamp-2 text-base font-semibold leading-snug">{post.title}</h2>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Document')
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-5 w-5" /></div>
        <span className="rounded-md border border-[var(--tk-line)] px-2.5 py-1 text-[11px] font-medium text-[var(--tk-muted)]">{category}</span>
      </div>
      <h2 className="editable-display mt-5 text-lg font-semibold leading-snug">{post.title}</h2>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">Open document <Download className="h-4 w-4" /></span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-6 text-center`}>
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-4 text-base font-semibold">{post.title}</h2>
      {role ? <p className="mt-1 text-xs font-medium text-[var(--tk-accent)]">{role}</p> : null}
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
