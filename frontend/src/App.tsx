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
    <div className="min-h-screen font-sans bg-dark-bg text-slate-100">
      <button
        onClick={toggleMode}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-dark-elevated text-slate-100 border-2 border-dark-border rounded-lg cursor-pointer font-semibold shadow-lg z-[1000] hover:bg-primary hover:border-primary transition-all duration-200"
      >
        {mode === 'create' ? '📝 Answer Questions' : '✏️ Create Question'}
      </button>

      {mode === 'create' ? <QuestionCreate /> : <QuestionAnswer />}
    </div>
  )
}

export default App
