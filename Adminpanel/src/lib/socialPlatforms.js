import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa6'
import { SiTelegram, SiTiktok } from 'react-icons/si'

const PLATFORM_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp },
  { value: 'telegram', label: 'Telegram', Icon: SiTelegram },
  { value: 'facebook', label: 'Facebook', Icon: FaFacebookF },
  { value: 'instagram', label: 'Instagram', Icon: FaInstagram },
  { value: 'tiktok', label: 'TikTok', Icon: SiTiktok },
]

const PLATFORM_MAP = Object.fromEntries(PLATFORM_OPTIONS.map((item) => [item.value, item]))

function detectSocialPlatform(item) {
  const title = String(item?.title || '').toLowerCase()
  const url = String(item?.url || '').toLowerCase()
  if (PLATFORM_MAP[title]) return title
  if (url.includes('wa.me') || url.includes('whatsapp')) return 'whatsapp'
  if (url.includes('t.me') || url.includes('telegram')) return 'telegram'
  if (url.includes('facebook.com') || url.includes('fb.com')) return 'facebook'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('tiktok.com')) return 'tiktok'
  return 'whatsapp'
}

export { PLATFORM_OPTIONS, PLATFORM_MAP, detectSocialPlatform }
