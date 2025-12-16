import { useState, useEffect } from 'react'
import './App.css'
import { API_ENDPOINTS } from './config'

function App() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(API_ENDPOINTS.question(1))
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Question API Test</h1>
      <p>Fetching question with ID: 1</p>
      <p>API URL: {API_ENDPOINTS.question(1)}</p>

      {loading && <p>Loading...</p>}

      {error && (
        <div style={{ color: 'red', padding: '1rem', border: '1px solid red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div style={{ marginTop: '1rem' }}>
          <h2>Response:</h2>
          <pre style={{
            backgroundColor: '#f4f4f4',
            padding: '1rem',
            borderRadius: '4px',
            textAlign: 'left',
            overflow: 'auto'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App
