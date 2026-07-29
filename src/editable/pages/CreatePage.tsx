'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { isUiHiddenTask } from '@/editable/content/global.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: ArrowRight,
}

const fieldClass = 'rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#f14a1c]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled && !isUiHiddenTask(task.key)), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-white text-neutral-900">
          <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-5xl items-center gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_1fr]">
            <div className="flex h-full min-h-72 items-center justify-center rounded-xl bg-neutral-900 text-white">
              <Lock className="h-16 w-16 opacity-70" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f14a1c]">{pagesContent.create.locked.badge}</p>
              <h1 className="editable-display mt-4 text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-neutral-900 sm:text-4xl">{pagesContent.create.locked.title}</h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-neutral-500">{pagesContent.create.locked.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-[#f14a1c] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-90">Login <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-[#f14a1c]">Sign up</Link>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-white text-neutral-900">
        <section className="mx-auto max-w-5xl px-6 py-10 sm:py-14 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <aside>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f14a1c]">{pagesContent.create.hero.badge}</p>
              <h1 className="editable-display mt-4 text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-neutral-900 sm:text-4xl">{pagesContent.create.hero.title}</h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-neutral-500">{pagesContent.create.hero.description}</p>
              <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button key={item.key} type="button" onClick={() => setTask(item.key)} className={`rounded-xl border p-4 text-left transition duration-200 ${active ? 'border-[#f14a1c] bg-[#f14a1c] text-white' : 'border-neutral-200 bg-neutral-50 text-neutral-900 hover:-translate-y-0.5'}`}>
                      <Icon className="h-4 w-4" />
                      <span className="mt-2 block text-sm font-bold">{item.label}</span>
                      <span className="mt-1 block text-xs opacity-70">{item.description}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Create {activeTask?.label || 'post'}</p>
                  <h2 className="editable-display mt-1 text-xl font-bold text-neutral-900">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="rounded-md bg-[#f14a1c]/10 px-3 py-1.5 text-xs font-semibold text-[#f14a1c]">{session.name}</span>
              </div>

              <div className="mt-6 grid gap-3">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" required />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                <textarea className={`${fieldClass} min-h-20`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-40`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes, or description" required />
              </div>

              {created ? (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <p className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="h-4 w-4" /> {pagesContent.create.successTitle}</p>
                  <p className="mt-1 text-sm opacity-80">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#f14a1c] text-sm font-semibold text-white transition hover:brightness-90">
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
