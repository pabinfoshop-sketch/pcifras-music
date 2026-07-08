import { useState, useCallback, useRef } from 'react'

export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') return initialValue
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  // Mantém a chave estável para o setter (evita recriar setValue quando key muda de referência).
  const keyRef = useRef(key)
  keyRef.current = key

  // IMPORTANTE: setValue precisa ser estável entre renders para não causar loops
  // em useEffect/useCallback que o listam como dependência.
  const setValue = useCallback(value => {
    setStoredValue(prev => {
      const next = value instanceof Function ? value(prev) : value
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(keyRef.current, JSON.stringify(next))
        }
      } catch (e) {
        console.warn('localStorage write failed:', e)
      }
      return next
    })
  }, [])

  return [storedValue, setValue]
}
