import { useState } from 'react'
import AuthGate from './components/AuthGate'
import HeroIllustration from './components/HeroIllustration'
import TodayView from './components/TodayView'
import ChecksView from './components/ChecksView'
import TrendsView from './components/TrendsView'
import SettingsView from './components/SettingsView'

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
            <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}>Today</button>
            <button className={tab === 'checks' ? 'active' : ''} onClick={() => setTab('checks')}>Checks</button>
            <button className={tab === 'trends' ? 'active' : ''} onClick={() => setTab('trends')}>Trends</button>
            <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Settings</button>
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
