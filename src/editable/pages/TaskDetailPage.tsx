import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink, FileText, Globe2, Link2, Lock, Mail, MapPin, Phone, Shield, Sparkles, Star, Tag, UserRound, Verified, Zap } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { dedupeUrls } from '@/editable/cards/PostCards'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return dedupeUrls([...media, ...images, ...singleImages]).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const comparable = (value: string) => stripHtml(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  if (!lead) return ''
  const leadKey = comparable(lead)
  return leadKey && comparable(getBody(post)).includes(leadKey) ? '' : lead
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <BackLink task="article" />
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
        <h1 className="editable-display mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-5xl">{post.title}</h1>
        {images[0] ? <img src={images[0]} alt="" className="mt-8 aspect-[16/9] w-full rounded-xl border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="listing" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-10 w-10 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Business listing</p>
              <h1 className="editable-display mt-2 text-3xl font-bold leading-[1.06] tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          {leadText(post) ? <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <div className="my-8 h-px bg-[var(--tk-line)]" />
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Showcase" />
        </article>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
          <RelatedPanel task="listing" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-6 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Classified</p>
            <h1 className="editable-display mt-3 text-2xl font-bold leading-tight">{post.title}</h1>
            <p className="editable-display mt-5 text-3xl font-bold text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-5 space-y-2">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-lg bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-lg border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-4 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-[var(--tk-line)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex items-center gap-2 rounded-md border border-[var(--tk-line)] px-3 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story</span>
            <h1 className="editable-display mt-5 text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-5 text-base leading-7 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

/* ===== PREMIUM BOOKMARK / RESOURCE DETAIL ===== */
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  const domain = website ? cleanDomain(website) : ''
  const category = categoryOf(post, 'Resource')
  const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean).slice(0, 8) : []
  const lead = leadText(post)

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 to-neutral-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(241,74,28,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-60" />
        <div className="relative mx-auto max-w-[var(--editable-container)] px-6 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm">
              <Bookmark className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {category}
            </span>
            {domain ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/60 backdrop-blur-sm">
                <Globe2 className="h-3.5 w-3.5" /> {domain}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          </div>

          <h1 className="editable-display mt-6 max-w-4xl text-balance text-3xl font-bold leading-[1.06] tracking-[-0.025em] sm:text-4xl lg:text-5xl">{post.title}</h1>

          {lead ? <p className="mt-5 max-w-2xl text-lg leading-8 text-white/55">{lead}</p> : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {website ? (
              <Link href={website} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--tk-accent)]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--tk-accent)]/30 hover:brightness-110">
                Visit resource <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ) : null}
            <Link href="/sbm" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> All collections
            </Link>
          </div>
        </div>
      </section>

      <div className="border-b border-[var(--tk-line)] bg-neutral-50/50">
        <div className="mx-auto flex max-w-[var(--editable-container)] items-center gap-px overflow-x-auto px-6 lg:px-8">
          {[
            { icon: Bookmark, label: 'Collection', value: category },
            { icon: Globe2, label: 'Source', value: domain || 'Direct' },
            { icon: Shield, label: 'Status', value: 'Curated' },
            { icon: Zap, label: 'Access', value: 'Free' },
          ].map((fact) => (
            <div key={fact.label} className="flex shrink-0 items-center gap-3 border-r border-[var(--tk-line)] px-5 py-4 last:border-r-0 sm:px-6">
              <fact.icon className="h-4 w-4 text-[var(--tk-accent)]" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--tk-muted)]">{fact.label}</p>
                <p className="text-sm font-semibold">{fact.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <article className="min-w-0">
          <h2 className="editable-display text-xl font-bold">About this resource</h2>
          <BodyContent post={post} />
          {tags.length ? (
            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[var(--tk-line)] bg-neutral-50 px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">{tag}</span>
                ))}
              </div>
            </div>
          ) : null}
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-[var(--tk-line)] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="bg-gradient-to-br from-[var(--tk-accent)] to-orange-600 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm"><Globe2 className="h-5 w-5 text-white" /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{post.title}</p>
                  {domain ? <p className="text-xs text-white/60">{domain}</p> : null}
                </div>
              </div>
            </div>
            <div className="p-5">
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--tk-accent)] py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-110">
                  Visit resource <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 text-sm text-[var(--tk-muted)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Link verified &amp; active</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--tk-muted)]">
                  <Shield className="h-4 w-4 text-[var(--tk-accent)]" />
                  <span>Curated by {SITE_CONFIG.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--tk-muted)]">
                  <Lock className="h-4 w-4 text-blue-500" />
                  <span>Safe &amp; secure link</span>
                </div>
              </div>
            </div>
          </div>

          <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel />

          {related.length ? (
            <div className="rounded-2xl border border-[var(--tk-line)] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">More from this collection</h2>
                <Link href="/sbm" className="text-xs font-medium text-[var(--tk-accent)] transition hover:underline">View all</Link>
              </div>
              <div className="mt-4 grid gap-2">
                {related.map((item) => (
                  <Link key={item.id || item.slug} href={`${getTaskConfig('sbm')?.route || '/sbm'}/${item.slug}`} className="group flex items-center gap-3 rounded-xl border border-[var(--tk-line)] p-3 transition-all duration-200 hover:border-[var(--tk-accent)]/30 hover:bg-neutral-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-[var(--tk-muted)] transition group-hover:bg-[var(--tk-accent)]/10 group-hover:text-[var(--tk-accent)]">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="line-clamp-1 text-[13px] font-semibold leading-snug">{item.title}</h3>
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-[var(--tk-muted)]">{stripHtml(summaryText(item))}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-7 w-7" /></div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">{categoryOf(post, 'Document')}</p>
              <h1 className="editable-display mt-2 text-2xl font-bold leading-[1.08] sm:text-3xl">{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-8 overflow-hidden rounded-xl border border-[var(--tk-line)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="text-sm font-semibold">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[var(--tk-accent)] px-4 py-2 text-xs font-semibold text-[var(--tk-on-accent)] transition hover:brightness-90">Download <Download className="h-4 w-4" /></Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] min-h-[520px] w-full bg-[var(--tk-raised)]" />
              <div className="border-t border-[var(--tk-line)] p-4 text-sm text-[var(--tk-muted)]">
                Can&apos;t see the document?{' '}
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="font-semibold text-[var(--tk-accent)] underline">Open it in a new tab</Link>.
              </div>
            </div>
          ) : null}
        </article>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <div className="rounded-xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
              <p className="text-sm font-semibold">Get this document</p>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--tk-accent)] py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-90">Download <Download className="h-4 w-4" /></Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

/* ===== PREMIUM PROFILE DETAIL (functional, hidden, no collections) ===== */
function ProfileDetail({ post }: { post: SitePost }) {
  const images = getImages(post)
  const avatar = images[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const location = getField(post, ['location', 'city', 'address'])
  const bio = leadText(post) || stripHtml(summaryText(post))
  const initials = post.title ? post.title.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?'

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(241,74,28,0.12),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--tk-bg)] to-transparent" />

        <div className="relative mx-auto max-w-[var(--editable-container)] px-6 pb-0 pt-16 sm:pt-20 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/20 bg-neutral-800 shadow-2xl shadow-black/40 sm:h-36 sm:w-36">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="editable-display text-4xl font-bold text-white/60 sm:text-5xl">{initials}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-900 bg-[var(--tk-accent)] text-white">
                <Verified className="h-4 w-4" />
              </div>
            </div>

            <h1 className="editable-display mt-6 text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem]">{post.title}</h1>
            {role ? (
              <p className="mt-2 inline-flex items-center gap-2 text-base font-medium text-white/50">
                <Sparkles className="h-4 w-4 text-[var(--tk-accent)]" /> {role}
              </p>
            ) : null}

            <div className="mt-7 flex flex-wrap justify-center gap-3 pb-16">
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-lg transition-all duration-200 hover:shadow-xl">
                  <ExternalLink className="h-4 w-4" /> Visit website
                </Link>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white">
                  <Mail className="h-4 w-4" /> Email
                </a>
              ) : null}
              {phone ? (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white">
                  <Phone className="h-4 w-4" /> Call
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--editable-container)] px-6 lg:px-8">
        <div className="-mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: UserRound, label: 'Member', value: SITE_CONFIG.name },
            { icon: Tag, label: 'Role', value: role || 'Curator' },
            { icon: MapPin, label: 'Location', value: location || 'Global' },
            { icon: CheckCircle2, label: 'Status', value: 'Verified' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[var(--tk-line)] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-[var(--tk-accent)]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--tk-muted)]">{item.label}</span>
              </div>
              <p className="mt-1.5 text-sm font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <article className="min-w-0">
          <h2 className="editable-display text-xl font-bold">About</h2>
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Gallery" />
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-[var(--tk-line)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="border-b border-[var(--tk-line)] bg-neutral-50 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Contact &amp; links</h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {website ? (
                  <Link href={website} target="_blank" rel="noreferrer" className="group flex items-center gap-3 text-sm text-[var(--tk-muted)] transition hover:text-[var(--tk-accent)]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 transition group-hover:bg-[var(--tk-accent)]/10">
                      <Globe2 className="h-4 w-4" />
                    </div>
                    <span className="truncate">{cleanDomain(website)}</span>
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                ) : null}
                {email ? (
                  <a href={`mailto:${email}`} className="group flex items-center gap-3 text-sm text-[var(--tk-muted)] transition hover:text-[var(--tk-accent)]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 transition group-hover:bg-[var(--tk-accent)]/10">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="truncate">{email}</span>
                  </a>
                ) : null}
                {phone ? (
                  <a href={`tel:${phone}`} className="group flex items-center gap-3 text-sm text-[var(--tk-muted)] transition hover:text-[var(--tk-accent)]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 transition group-hover:bg-[var(--tk-accent)]/10">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span>{phone}</span>
                  </a>
                ) : null}
                {location ? (
                  <div className="flex items-center gap-3 text-sm text-[var(--tk-muted)]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span>{location}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--tk-line)] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Identity</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-bold text-[var(--tk-muted)]">{initials}</span>}
              </div>
              <div>
                <p className="text-sm font-bold">{post.title}</p>
                <p className="flex items-center gap-1 text-xs text-[var(--tk-muted)]"><Verified className="h-3 w-3 text-[var(--tk-accent)]" /> Verified member</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </>
  )
}

/* ----- Shared building blocks ----- */
function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-6 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-2 break-words text-sm font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-3 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-xl border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--tk-line)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-64 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-lg border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-lg border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-5">{buttons}</div>
  return (
    <div className="rounded-xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-3">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-2.5 text-sm">
      <span className="font-medium text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-muted)]">About this post</p>
        <div className="mt-3 grid gap-2 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-base font-semibold">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-xs font-medium text-[var(--tk-accent)]">View all</Link>
          </div>
          <div className="mt-4 grid gap-2.5">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-xl font-bold">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-xl border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-6 w-6 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-4">
          <h3 className="editable-display line-clamp-2 text-sm font-semibold leading-snug">{post.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-lg border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-raised)]"><Globe2 className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{post.title}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}
