import { createContext, useContext, useState, useEffect } from 'react'
import { translations, RTL_LANGS } from '../i18n/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('hajj-lang') || 'en')

  const setLang = (code) => {
    setLangState(code)
    localStorage.setItem('hajj-lang', code)
  }

  useEffect(() => {
    const isRTL = RTL_LANGS.includes(lang)
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const t = (key) => {
    const tr = translations[lang]
    const val = tr?.[key] ?? translations['en']?.[key] ?? key
    return val
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL: RTL_LANGS.includes(lang) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
