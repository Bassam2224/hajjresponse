import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import { LANGUAGES } from '../i18n/translations'

export default function ThemeLangControls({ compact = false }) {
  const { isDark, toggle } = useTheme()
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <div className="flex items-center gap-1 relative">
      {/* Theme toggle */}
      <button
        onClick={toggle}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all text-base"
        aria-label="Toggle theme"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Language selector */}
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all text-base"
          aria-label="Change language"
          title="Change language"
        >
          🌐
        </button>

        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[900]" onClick={() => setOpen(false)} />
            {/* Dropdown */}
            <div className="absolute right-0 top-10 z-[1000] bg-[#0f1e45] border border-white/10 rounded-xl shadow-2xl overflow-hidden w-52"
              style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-widest border-b"
                style={{color:'var(--text-2)', borderColor:'var(--border)'}}>
                Language
              </div>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${
                    lang === l.code
                      ? 'bg-white/10 font-semibold'
                      : 'hover:bg-white/5'
                  }`}
                  style={{color: lang === l.code ? 'var(--text)' : 'var(--text-2)'}}
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="flex-1">{l.nativeLabel}</span>
                  {l.rtl && <span className="text-[9px] text-white/30 font-mono">RTL</span>}
                  {lang === l.code && <span className="text-green-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
