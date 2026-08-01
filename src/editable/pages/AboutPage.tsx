import Link from 'next/link'
import { ArrowRight, CheckCircle2, Globe2, Layers3, Shield, Sparkles, Users2, Zap } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const stats = [
  { value: '10k+', label: 'Curated resources' },
  { value: '500+', label: 'Collections' },
  { value: '100+', label: 'Active curators' },
  { value: '24/7', label: 'Access' },
]

const principles = [
  { icon: Shield, title: 'Quality first', body: 'Every resource is reviewed before joining a collection. We never trade quality for volume.' },
  { icon: Layers3, title: 'Organized by design', body: 'Collections group resources by topic so you explore deeply rather than bounce between disconnected results.' },
  { icon: Users2, title: 'Community-driven', body: 'Curators submit and organize resources, building collections that surface the best tools faster.' },
  { icon: Zap, title: 'Always current', body: 'Collections evolve. Dead links are removed, new finds are added, and quality stays high over time.' },
]

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-white text-neutral-900">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/3 rounded-full bg-[#f14a1c]/[0.04] blur-[120px]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-6 py-20 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f14a1c]">{pagesContent.about.badge}</p>
              <h1 className="editable-display mt-5 text-balance text-4xl font-bold leading-[1.06] tracking-[-0.025em] sm:text-5xl lg:text-[3.5rem]">
                A better way to discover and organize resources
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-500">{pagesContent.about.description}</p>
            </div>
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-neutral-50/50">
          <div className="mx-auto grid max-w-[var(--editable-container)] grid-cols-2 gap-px bg-[var(--editable-border)] sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-neutral-50/80 px-6 py-10 text-center sm:py-12">
                <p className="editable-display text-3xl font-bold tracking-[-0.02em] text-[#f14a1c] sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-[13px] font-medium text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-20 sm:py-24 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f14a1c]/[0.08] px-4 py-1.5 text-xs font-semibold text-[#f14a1c]">
                <Sparkles className="h-3.5 w-3.5" /> Our mission
              </span>
              <h2 className="editable-display mt-5 text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem]">
                Trusted curation beats algorithms every time
              </h2>
              <div className="mt-6 space-y-5 text-[1.0625rem] leading-8 text-neutral-500">
                {pagesContent.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/sbm"
                  className="inline-flex items-center gap-2 rounded-full bg-[#f14a1c] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-110"
                >
                  Browse collections <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold transition-all duration-200 hover:border-[#f14a1c] hover:text-[#f14a1c]"
                >
                  Get in touch
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {principles.map((item) => (
                <div key={item.title} className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f14a1c]/[0.08] text-[#f14a1c] transition-colors duration-300 group-hover:bg-[#f14a1c] group-hover:text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-neutral-500">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200">
          <div className="mx-auto max-w-[var(--editable-container)] px-6 py-16 sm:py-20 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-3">
              {pagesContent.about.values.map((value, i) => (
                <div key={value.title} className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-7 sm:p-8">
                  <span className="editable-display absolute right-4 top-3 text-[80px] font-bold leading-none text-neutral-100">{i + 1}</span>
                  <div className="relative">
                    <CheckCircle2 className="h-5 w-5 text-[#f14a1c]" />
                    <h2 className="editable-display mt-4 text-xl font-bold">{value.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-neutral-500">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f14a1c]">
          <div className="mx-auto flex max-w-[var(--editable-container)] flex-col items-center gap-6 px-6 py-16 text-center sm:py-20 lg:px-8">
            <h2 className="editable-display max-w-xl text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white sm:text-4xl">Ready to discover curated resources?</h2>
            <p className="max-w-lg text-base leading-7 text-white/75">Join curators who organize the best tools, references, and links on the web.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sbm" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#f14a1c] shadow-sm transition hover:shadow-md">
                <Globe2 className="h-4 w-4" /> Explore now
              </Link>
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                Create account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
