'use client'

import { Building2, FileText, Image as ImageIcon, Mail, MapPin, MessageCircle, Phone, Sparkles, Bookmark, Clock } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Building2, title: 'Business onboarding', body: 'Add listings, verify operational details, and bring your business surface live quickly.' },
      { icon: Phone, title: 'Partnership support', body: 'Talk through bulk publishing, local growth, and operational setup questions.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Need a new geography or category lane? We can shape the directory around it.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Editorial submissions', body: 'Pitch essays, columns, and long-form ideas that fit the publication.' },
      { icon: Mail, title: 'Newsletter partnerships', body: 'Coordinate sponsorships, collaborations, and issue-level campaigns.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Get help with voice, formatting, and publication workflow questions.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Creator collaborations', body: 'Discuss gallery launches, creator features, and visual campaigns.' },
      { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about usage rights, commercial requests, and visual partnerships.' },
      { icon: Mail, title: 'Media kits', body: 'Request creator decks, editorial support, or visual feature placement.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Collection submissions', body: 'Suggest resources, boards, and links that deserve a place in the library.' },
    { icon: Mail, title: 'Resource partnerships', body: 'Coordinate curation projects, reference pages, and link programs.' },
    { icon: Sparkles, title: 'Curator support', body: 'Need help organizing shelves, collections, or profile-connected boards?' },
  ]
}

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-white text-neutral-900">
        <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 to-white">
          <div className="absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#f14a1c]/[0.03] blur-[100px]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-6 py-16 sm:py-20 lg:px-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f14a1c]/[0.08] px-4 py-1.5 text-xs font-semibold text-[#f14a1c]">
                <MessageCircle className="h-3.5 w-3.5" /> {pagesContent.contact.eyebrow}
              </span>
              <h1 className="editable-display mt-5 text-3xl font-bold leading-[1.08] tracking-[-0.025em] sm:text-4xl lg:text-5xl">{pagesContent.contact.title}</h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-neutral-500">{pagesContent.contact.description}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--editable-container)] px-6 pb-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div className="space-y-4">
              {lanes.map((lane) => (
                <div key={lane.title} className="group flex gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f14a1c]/30 hover:shadow-lg sm:p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f14a1c]/[0.08] text-[#f14a1c] transition-colors duration-300 group-hover:bg-[#f14a1c] group-hover:text-white">
                    <lane.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-bold">{lane.title}</h2>
                    <p className="mt-1.5 text-sm leading-6 text-neutral-500">{lane.body}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
                <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                  <Clock className="h-4 w-4 text-[#f14a1c]" />
                  Typical response time: within 24 hours
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f14a1c] text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="editable-display text-xl font-bold">{pagesContent.contact.formTitle}</h2>
                  <p className="text-[13px] text-neutral-500">Fill in the details below</p>
                </div>
              </div>
              <EditableContactLeadForm />
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
