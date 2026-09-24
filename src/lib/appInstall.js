export function isAppInstalled() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if (window.navigator.standalone === true) return true
  return false
}

export function isIos() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function isAndroid() {
  if (typeof navigator === 'undefined') return false
  return /android/i.test(navigator.userAgent)
}

export function getApkDownloadUrl() {
  const raw = String(import.meta.env.VITE_APK_DOWNLOAD_URL || '').trim()
  if (raw && !raw.includes('/path/to/')) return raw
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return `${normalizedBase}fairinvest.apk`
}

export function downloadApk(url = getApkDownloadUrl()) {
  const link = document.createElement('a')
  link.href = url
  link.download = url.split('/').filter(Boolean).pop() || 'fairinvest.apk'
  link.rel = 'noopener noreferrer'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const APP_INSTALL_REQUEST_EVENT = 'fairinvest:install-app-request'

export function requestAppInstall() {
  window.dispatchEvent(new CustomEvent(APP_INSTALL_REQUEST_EVENT))
}

export function getInstallInstructions() {
  if (isIos()) {
    return {
      title: 'Add to Home Screen (iPhone/iPad)',
      steps: [
        'Tap the Share button in Safari (square with arrow).',
        'Scroll and tap "Add to Home Screen".',
        'Tap "Add" — FairInvest will open like an app.',
      ],
    }
  }
  if (isAndroid()) {
    return {
      title: 'Install on Android',
      steps: [
        'Tap App Download again to get the APK file.',
        'If Chrome offers "Install app", tap Install.',
        'Or open browser menu (⋮) → "Install app" / "Add to Home screen".',
      ],
    }
  }
  return {
    title: 'Install FairInvest',
    steps: [
      'Use your browser menu and choose "Install app" or "Add to Home screen".',
      'If no install option appears, use App Download to get the APK (Android).',
    ],
  }
}
