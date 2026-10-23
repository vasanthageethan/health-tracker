import { useEffect, useState } from 'react'
import { getDueStatus } from '../api'

export default function DueStatusCard() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    getDueStatus().then(setStatus)
  }, [])

  if (!status) return null

  return (
    <section className="card">
      <h2>What's due</h2>
      {Object.values(status).map((item) => (
        <div key={item.label} className={`due-row ${item.overdue ? 'overdue' : 'ok'}`}>
          <span>{item.label}</span>
          <span>
            {item.lastDate
              ? `${item.daysSince}d ago${item.overdue ? ' · due' : ''}`
              : 'never logged · due'}
          </span>
        </div>
      ))}
    </section>
  )
}
