import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa6'
import { SiTelegram, SiTiktok } from 'react-icons/si'

const PLATFORM_META = {
  whatsapp: { label: 'WhatsApp', Icon: FaWhatsapp },
  telegram: { label: 'Telegram', Icon: SiTelegram },
  facebook: { label: 'Facebook', Icon: FaFacebookF },
  instagram: { label: 'Instagram', Icon: FaInstagram },
  tiktok: { label: 'TikTok', Icon: SiTiktok },
}

function detectSocialPlatform(link) {
  const title = String(link?.title || '').toLowerCase()
  const url = String(link?.url || '').toLowerCase()

  if (title in PLATFORM_META) return title
  if (url.includes('wa.me') || url.includes('whatsapp')) return 'whatsapp'
  if (url.includes('t.me') || url.includes('telegram')) return 'telegram'
  if (url.includes('facebook.com') || url.includes('fb.com')) return 'facebook'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('tiktok.com')) return 'tiktok'

  return null
}

const DEFAULT_FALLBACK_LINKS = [
  { id: 1, platform: 'whatsapp', title: 'Official WhatsApp Channel', url: 'https://whatsapp.com', label: 'Official WhatsApp Channel' },
  { id: 2, platform: 'telegram', title: 'Telegram VIP Community', url: 'https://telegram.org', label: 'Telegram VIP Community' },
]

function getSupportedSocialLinks(links = []) {
  const source = Array.isArray(links) && links.length > 0 ? links : DEFAULT_FALLBACK_LINKS
  const result = source
    .map((link) => {
      const platform = detectSocialPlatform(link)
      if (!platform) return null
      return {
        ...link,
        platform,
        label: PLATFORM_META[platform].label,
        Icon: PLATFORM_META[platform].Icon,
      }
    })
    .filter(Boolean)

  if (result.length > 0) return result

  return DEFAULT_FALLBACK_LINKS.map((link) => ({
    ...link,
    Icon: PLATFORM_META[link.platform].Icon,
  }))
}

export { PLATFORM_META, detectSocialPlatform, getSupportedSocialLinks }
