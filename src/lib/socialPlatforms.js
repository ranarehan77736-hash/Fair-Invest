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

function getSupportedSocialLinks(links = []) {
  return links
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
}

export { PLATFORM_META, detectSocialPlatform, getSupportedSocialLinks }
