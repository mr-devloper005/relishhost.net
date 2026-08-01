'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, PlusCircle, ArrowRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-neutral-200 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
          : 'border-b border-transparent bg-white'
      }`}
      style={{ WebkitBackdropFilter: scrolled ? 'blur(20px)' : undefined }}
    >
      <nav className="mx-auto flex h-16 w-full max-w-[var(--editable-container)] items-center gap-8 px-5 sm:px-6 lg:h-[68px] lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <img
            src="/favicon.png?v=20260413"
            alt={SITE_CONFIG.name}
            className="h-10 w-10 object-contain transition duration-300 group-hover:scale-110 "
          />
          <span className="editable-display text-[17px] font-bold tracking-[-0.02em]">{SITE_CONFIG.name}</span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? 'text-neutral-900'
                    : 'text-neutral-900/55 hover:text-neutral-900'
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-[#f14a1c]" />
                ) : null}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-900/50 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Search className="h-[17px] w-[17px]" />
          </Link>

          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center gap-1.5 rounded-full bg-[#f14a1c] px-4 py-2 text-[13px] font-semibold text-[#ffffff] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-md hover:brightness-110 sm:inline-flex"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Submit
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden text-[13px] font-medium text-neutral-900/50 transition hover:text-neutral-900 sm:block"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-[13px] font-medium text-neutral-900/50 transition hover:text-neutral-900 sm:block"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:opacity-85 sm:inline-flex"
              >
                Get started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 transition hover:bg-neutral-50 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-neutral-200 bg-white shadow-xl lg:hidden">
          <div className="mx-auto max-w-[var(--editable-container)] px-5 py-5 sm:px-6">
            <div className="grid gap-0.5">
              {[
                { label: 'Home', href: '/' },
                ...navLinks,
                ...(session
                  ? [{ label: 'Submit resource', href: '/create' }]
                  : [{ label: 'Login', href: '/login' }, { label: 'Sign up', href: '/signup' }]),
              ].map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-4 py-3 text-[15px] font-medium transition ${
                      active ? 'bg-neutral-50 text-[#f14a1c]' : 'text-neutral-900/70 hover:bg-neutral-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <form action="/search" className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5">
                <Search className="h-4 w-4 text-neutral-400" />
                <input name="q" type="search" placeholder="Search resources..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400" />
              </form>
            </div>
            {session ? (
              <button
                type="button"
                onClick={() => { logout(); setOpen(false) }}
                className="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-900/60 transition hover:bg-neutral-50"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
