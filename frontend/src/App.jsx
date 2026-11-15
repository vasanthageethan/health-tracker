import { useState } from 'react'
import AuthGate from './components/AuthGate'
import HeroIllustration from './components/HeroIllustration'
import TodayView from './components/TodayView'
import ChecksView from './components/ChecksView'
import TrendsView from './components/TrendsView'
import SettingsView from './components/SettingsView'
import { CalendarIcon, ClipboardIcon, TrendingIcon, SettingsIcon } from './lib/icons'

const TABS = [
  { key: 'today', label: 'Today', icon: CalendarIcon },
  { key: 'checks', label: 'Checks', icon: ClipboardIcon },
  { key: 'trends', label: 'Trends', icon: TrendingIcon },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function App() {
  const [tab, setTab] = useState('today')

  return (
    <AuthGate>
      <div className="page">
        <header>
          <div className="brand">
            <HeroIllustration size={32} />
            <h1>Health Tracker</h1>
          </div>
          <nav className="tabs">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
                <Icon />
                {label}
              </button>
            ))}
          </nav>
        </header>

        {tab === 'today' && <TodayView />}
        {tab === 'checks' && <ChecksView />}
        {tab === 'trends' && <TrendsView />}
        {tab === 'settings' && <SettingsView />}
      </div>
    </AuthGate>
  )
}
