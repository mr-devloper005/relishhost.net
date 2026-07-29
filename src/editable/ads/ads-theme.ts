import type { AdSkin } from '@/lib/ads/ad-frame'

export const adSkin: AdSkin = {
  radius: '12px',
  border: '1px solid rgba(0,0,0,0.06)',
  shadow: '0 4px 20px rgba(0,0,0,0.04)',
  background: '#ffffff',
  labelClassName: 'bg-[#f14a1c] text-white',
}

export const adSkinBySlot: Partial<Record<string, AdSkin>> = {
  sidebar: { radius: '12px', shadow: 'none', border: '1px solid rgba(0,0,0,0.08)' },
  popup: { radius: '16px' },
  header: { radius: '12px', background: '#f7f7f8' },
  rail: { radius: '12px' },
  feature: { radius: '12px' },
  interstitial: { radius: '16px', shadow: '0 20px 60px rgba(0,0,0,0.5)' },
  anchor: { radius: '12px', shadow: '0 6px 24px rgba(0,0,0,0.18)' },
}

export function skinFor(slot: string): AdSkin {
  return { ...adSkin, ...(adSkinBySlot[slot] ?? {}) }
}
