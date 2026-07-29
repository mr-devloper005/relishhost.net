import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Login', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-white text-neutral-900">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[var(--editable-container)] items-center gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f14a1c]">{pagesContent.auth.login.badge}</p>
            <h1 className="editable-display mt-4 max-w-xl text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-4xl">{pagesContent.auth.login.title}</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-neutral-500">{pagesContent.auth.login.description}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-7 shadow-sm sm:p-9">
            <h2 className="editable-display text-xl font-bold">{pagesContent.auth.login.formTitle}</h2>
            <EditableLocalLoginForm />
            <p className="mt-6 text-sm text-neutral-500">New here? <Link href="/signup" className="font-semibold text-[#f14a1c] underline-offset-4 hover:underline">{pagesContent.auth.login.createCta}</Link></p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
