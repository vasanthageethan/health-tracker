import { useState } from 'react'
import AuthGate from './components/AuthGate'
import TodayView from './components/TodayView'
import ChecksView from './components/ChecksView'

export default function App() {
  const [tab, setTab] = useState('today')

  return (
    <AuthGate>
      <div className="page">
        <header>
          <h1>Health Tracker</h1>
          <nav className="tabs">
            <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}>Today</button>
            <button className={tab === 'checks' ? 'active' : ''} onClick={() => setTab('checks')}>Checks</button>
          </nav>
        </header>

        {tab === 'today' ? <TodayView /> : <ChecksView />}
      </div>
    </AuthGate>
  )
}
