import { useEffect, useState } from 'react'

// Banner discreto que avisa quando o usuário está sem internet.
export default function OfflineBanner() {
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      📡 Você está offline — cifras já abertas continuam disponíveis.
    </div>
  )
}
