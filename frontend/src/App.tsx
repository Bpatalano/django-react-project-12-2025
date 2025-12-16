import { useState } from 'react'
import './App.css'
import QuestionCreate from './components/QuestionCreate'
import QuestionAnswer from './components/QuestionAnswer'

type Mode = 'create' | 'answer'

function App() {
  const [mode, setMode] = useState<Mode>('answer')

  const toggleMode = () => {
    setMode(mode === 'create' ? 'answer' : 'create')
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <button
        onClick={toggleMode}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}
      >
        {mode === 'create' ? 'Answer Questions' : 'Create Question'}
      </button>

      {mode === 'create' ? <QuestionCreate /> : <QuestionAnswer />}
    </div>
  )
}

export default App
