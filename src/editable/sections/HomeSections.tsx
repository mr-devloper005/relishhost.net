import Link from 'next/link'
import {
  ArrowRight, Bookmark, ChevronRight, CheckCircle2, Globe, Shield, Users, Zap,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref, toPlainText } from '@/editable/cards/PostCards'
import { EditableHeroCollage } from '@/editable/sections/EditableHeroCollage'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

function latestPostImages(posts: SitePost[], max = 8) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function getDomain(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const url = (typeof content.website === 'string' && content.website) || (typeof content.url === 'string' && content.url) || (typeof content.link === 'string' && content.link) || ''
  try { return url ? new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '') : '' } catch { return '' }
}

/* --------------------------------- Hero --------------------------------- */
export function EditableHomeHero({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const heroImages = latestPostImages(pool)
  const heroTitle = pagesContent.home.hero.title?.join(' ') || `Discover the best of ${SITE_CONFIG.name}`

  return (
    <section className="relative overflow-hidden bg-[var(--slot4-page-bg)]">
      <div className={`grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28 ${container}`}>
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{pagesContent.home.hero.badge}</p>
          <h1 className="editable-display mt-4 text-4xl font-bold leading-[1.12] tracking-[-0.02em] sm:text-5xl lg:text-[3.5rem]">
            {heroTitle}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--slot4-muted-text)]">{pagesContent.home.hero.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryRoute} className="inline-flex items-center gap-2 rounded-lg bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-90">
              {pagesContent.home.hero.primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-lg border border-[var(--editable-border)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
              {pagesContent.home.hero.secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl lg:block">
          <EditableHeroCollage images={heroImages} />
        </div>
      </div>
    </section>
  )
}

/* ---------------------- Collections marquee band ----------------------- */
export function EditableStoryRail({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const categories = [...new Set(pool.map((p) => categoryOf(p)).filter(Boolean))].slice(0, 12)
  if (!categories.length) return null

  return (
    <section className="overflow-hidden border-y border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
      <div className="flex items-center gap-6 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex shrink-0 items-center gap-6 px-8">
          {[...categories, ...categories].map((cat, i) => (
            <Link key={`${cat}-${i}`} href={`/sbm?category=${encodeURIComponent(cat)}`} className="shrink-0 text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]">
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------- Alternating features section --------------------- */
const features = [
  { icon: Bookmark, title: 'Curated collections', description: 'Resources organized into browsable collections by topic, tool type, and use case.' },
  { icon: Shield, title: 'Verified resources', description: 'Every link is reviewed with trust signals, domain checks, and metadata before publishing.' },
  { icon: Zap, title: 'Fast discovery', description: 'Clean layouts, smart filters, and search designed to surface the right resource quickly.' },
  { icon: Users, title: 'Community curators', description: 'Real people submit and organize resources — no algorithms, just trusted curation.' },
]

function FeatureGrid() {
  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`py-16 sm:py-20 lg:py-28 ${container}`}>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">How it works</p>
          <h2 className="editable-display mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Built around your workflow</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--slot4-muted-text)]">Intelligent curation designed to simplify how you discover and organize resources.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="editable-display mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------- Collections grid from data ---------------------- */
function CollectionsGrid({ primaryTask, primaryRoute, posts }: { primaryTask: TaskKey; primaryRoute: string; posts: SitePost[] }) {
  const items = posts.slice(0, 6)
  if (!items.length) return null

  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`py-16 sm:py-20 lg:py-28 ${container}`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Collections</p>
            <h2 className="editable-display mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Browse curated collections</h2>
          </div>
          <Link href={primaryRoute} className="hidden items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)] transition hover:underline sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => {
            const domain = getDomain(post)
            return (
              <Link
                key={post.id || post.slug}
                href={postHref(primaryTask, post, primaryRoute)}
                className="group flex gap-4 rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 100)}</p>
                  {domain ? <p className="mt-2 text-xs font-medium text-[var(--slot4-accent)]">{domain}</p> : null}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* -------------------- Featured + stats from real data ------------------- */
function FeaturedStats({ posts }: { posts: SitePost[] }) {
  const totalPosts = posts.length
  const domains = new Set(posts.map((p) => getDomain(p)).filter(Boolean)).size
  const categories = new Set(posts.map((p) => categoryOf(p)).filter(Boolean)).size

  const stats = [
    { value: `${totalPosts > 0 ? totalPosts : '50'}+`, label: 'Curated resources' },
    { value: `${domains > 0 ? domains : '25'}+`, label: 'Domains covered' },
    { value: `${categories > 0 ? categories : '10'}+`, label: 'Collections' },
    { value: '100%', label: 'Verified links' },
  ]

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`py-16 sm:py-20 lg:py-28 ${container}`}>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Platform stats</p>
          <h2 className="editable-display mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Simplify discovery. Amplify impact.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--slot4-muted-text)]">Curate, organize, and discover with a platform designed for quality-first resource management.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 text-center">
              <p className="editable-display text-3xl font-bold tracking-[-0.02em] text-[var(--slot4-accent)]">{s.value}</p>
              <p className="mt-2 text-sm font-medium text-[var(--slot4-muted-text)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------- Dynamic bookmark grids ------------------------- */
function BookmarkGrids({ primaryTask, primaryRoute, posts }: { primaryTask: TaskKey; primaryRoute: string; posts: SitePost[] }) {
  const recent = posts.slice(0, 8)
  if (!recent.length) return null

  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`py-16 sm:py-20 ${container}`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Latest resources</p>
            <h2 className="editable-display mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Recently added</h2>
          </div>
          <Link href={primaryRoute} className="hidden items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)] transition hover:underline sm:inline-flex">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((post) => {
            const image = getEditablePostImage(post)
            const category = categoryOf(post)
            return (
              <Link
                key={post.id || post.slug}
                href={postHref(primaryTask, post, primaryRoute)}
                className="group overflow-hidden rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
                  <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
                  {category ? <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[var(--slot4-page-text)]">{category}</span> : null}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--slot4-muted-text)]">{getExcerpt(post, 90)}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ----------------------- Social proof / trust band --------------------- */
function TrustBand() {
  return (
    <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-page-bg)]">
      <div className={`flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-5 text-sm text-[var(--slot4-muted-text)] ${container}`}>
        <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--slot4-accent)]" /> Verified resources</span>
        <span className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-[var(--slot4-accent)]" /> Trusted curation</span>
        <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-[var(--slot4-accent)]" /> Updated regularly</span>
        <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-[var(--slot4-accent)]" /> Community-driven</span>
      </div>
    </section>
  )
}

/* ------------------------------- FAQ ----------------------------------- */
const faqItems = [
  { q: 'What is a collection?', a: 'A collection is a curated group of related resources — tools, links, references — organized around a topic or use case by our curators.' },
  { q: 'How are resources verified?', a: 'Every resource goes through a review process that checks the link, domain, and metadata before it becomes part of a collection.' },
  { q: 'Can I submit a resource?', a: 'Yes! Create an account and use the submit form to add resources. Our curators will review and organize them into the right collection.' },
  { q: 'Is this platform free to use?', a: 'Browsing collections and discovering resources is completely free. Creating an account to submit resources is also free.' },
]

function FaqSection() {
  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`py-16 sm:py-20 lg:py-28 ${container}`}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">FAQ</p>
          <h2 className="editable-display mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Frequently asked questions</h2>
        </div>
        <div className="mx-auto mt-14 max-w-3xl divide-y divide-[var(--editable-border)]">
          {faqItems.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronRight className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)] transition duration-200 group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ----------------------------- Magazine split -------------------------- */
export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  return (
    <>
      <FeatureGrid />
      <CollectionsGrid primaryTask={primaryTask} primaryRoute={primaryRoute} posts={pool} />
      <FeaturedStats posts={pool} />
      <BookmarkGrids primaryTask={primaryTask} primaryRoute={primaryRoute} posts={pool} />
      <TrustBand />
      <FaqSection />
    </>
  )
}

/* ----------------------- Time-based collections ------------------------ */
const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'New in the last 7 days' },
  browse: { eyebrow: 'Trending now', title: 'Popular this month' },
  index: { eyebrow: 'Evergreen', title: 'From the archive' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((s) => s.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, idx) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        return (
          <section key={section.key} className={idx % 2 === 0 ? 'bg-[var(--slot4-surface-bg)]' : 'bg-[var(--slot4-panel-bg)]'}>
            <div className={`py-14 sm:py-16 ${container}`}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{copy.eyebrow}</p>
                  <h2 className="editable-display mt-2 text-2xl font-bold tracking-[-0.01em] sm:text-3xl">{copy.title}</h2>
                </div>
                <Link href={section.href || primaryRoute} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--slot4-accent)] hover:underline">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post) => {
                  const image = getEditablePostImage(post)
                  const category = categoryOf(post)
                  return (
                    <Link
                      key={post.id || post.slug}
                      href={postHref(primaryTask, post, primaryRoute)}
                      className="group overflow-hidden rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
                        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
                        {category ? <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold">{category}</span> : null}
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--slot4-muted-text)]">{getExcerpt(post, 100)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* --------------------------------- CTA --------------------------------- */
export function EditableHomeCta() {
  return (
    <section className="bg-[var(--slot4-accent)]">
      <div className={`flex flex-col items-center gap-6 py-16 text-center sm:py-20 ${container}`}>
        <h2 className="editable-display max-w-2xl text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
          {pagesContent.home.cta.title}
        </h2>
        <p className="max-w-xl text-base text-white/90 sm:text-lg">
          {pagesContent.home.cta.description}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/create" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-[var(--slot4-accent)] transition hover:brightness-95">
            {pagesContent.home.cta.primaryCta.label}
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            {pagesContent.home.cta.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  )
}
