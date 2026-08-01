'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { CATEGORY_OPTIONS } from '@/lib/categories'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()
  const categories = CATEGORY_OPTIONS.slice(0, 6)

  return (
    <footer className="mt-auto bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-5 sm:px-6 lg:px-8">
        <div className="border-b border-white/[0.08] py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
                <span className="editable-display text-[17px] font-bold">{SITE_CONFIG.name}</span>
              </Link>
              <p className="mt-5 max-w-sm text-[15px] leading-7 text-white/50">
                {globalContent.footer?.description || SITE_CONFIG.description}
              </p>
              <div className="mt-8 flex gap-3">
                <Link
                  href="/sbm"
                  className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-5 py-2.5 text-[13px] font-semibold text-white/80 transition-all duration-200 hover:bg-white/[0.14] hover:text-white"
                >
                  Browse collections <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] px-5 py-2.5 text-[13px] font-semibold text-white/60 transition-all duration-200 hover:border-white/25 hover:text-white"
                >
                  Submit
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">Collections</h3>
              <div className="mt-5 grid gap-2.5">
                <Link href="/sbm" className="text-[14px] text-white/55 transition hover:text-white">Browse all</Link>
                {categories.map((cat) => (
                  <Link key={cat.slug} href={`/sbm?category=${cat.slug}`} className="text-[14px] text-white/55 transition hover:text-white">{cat.name}</Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">Site</h3>
              <div className="mt-5 grid gap-2.5">
                <Link href="/about" className="text-[14px] text-white/55 transition hover:text-white">About</Link>
                <Link href="/contact" className="text-[14px] text-white/55 transition hover:text-white">Contact</Link>
                <Link href="/search" className="text-[14px] text-white/55 transition hover:text-white">Search</Link>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">Account</h3>
              <div className="mt-5 grid gap-2.5">
                {session ? (
                  <>
                    <Link href="/create" className="text-[14px] text-white/55 transition hover:text-white">Submit resource</Link>
                    <button type="button" onClick={logout} className="text-left text-[14px] text-white/55 transition hover:text-white">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-[14px] text-white/55 transition hover:text-white">Login</Link>
                    <Link href="/signup" className="text-[14px] text-white/55 transition hover:text-white">Sign up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-[13px] text-white/30">&copy; {year} {SITE_CONFIG.name}. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  )
}
