import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '../config'

interface Question {
  id: number
  question: string
  type: string
  options: Record<string, string>
  answer: string[]
}

export default function QuestionAnswer() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_ENDPOINTS.questions)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setQuestions(data)
      if (data.length > 0) {
        setCurrentQuestion(data[Math.floor(Math.random() * data.length)])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getRandomQuestion = () => {
    if (questions.length === 0) return
    const randomIndex = Math.floor(Math.random() * questions.length)
    setCurrentQuestion(questions[randomIndex])
    setSelectedAnswers([])
    setShowAnswer(false)
  }

  const toggleOption = (key: string) => {
    if (showAnswer) return
    setSelectedAnswers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const checkAnswer = () => {
    setShowAnswer(true)
  }

  const isCorrect = () => {
    if (!currentQuestion) return false
    const correctSet = new Set(currentQuestion.answer)
    const selectedSet = new Set(selectedAnswers)
    return (
      correctSet.size === selectedSet.size &&
      [...correctSet].every((key) => selectedSet.has(key))
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading questions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '2rem' }}>
        <div
          style={{
            color: 'red',
            padding: '1rem',
            border: '1px solid red',
            borderRadius: '4px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>Answer Questions</h1>
        <p style={{ color: '#666', marginTop: '1rem' }}>
          No questions available. Create some questions first!
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h1>Answer Questions</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Select one or more correct answers, then check your response
      </p>

      {currentQuestion && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '2rem',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>
            {currentQuestion.question}
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              const isSelected = selectedAnswers.includes(key)
              const isCorrectAnswer = currentQuestion.answer.includes(key)
              const showCorrect = showAnswer && isCorrectAnswer
              const showIncorrect = showAnswer && isSelected && !isCorrectAnswer

              return (
                <div
                  key={key}
                  onClick={() => toggleOption(key)}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    border: `2px solid ${
                      showCorrect
                        ? '#28a745'
                        : showIncorrect
                        ? '#dc3545'
                        : isSelected
                        ? '#007bff'
                        : '#ccc'
                    }`,
                    borderRadius: '4px',
                    backgroundColor: showCorrect
                      ? '#d4edda'
                      : showIncorrect
                      ? '#f8d7da'
                      : isSelected
                      ? '#e7f3ff'
                      : 'white',
                    cursor: showAnswer ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        fontWeight: 'bold',
                        minWidth: '30px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {key}.
                    </span>
                    <span style={{ flex: 1 }}>{value}</span>
                    {showCorrect && (
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓</span>
                    )}
                    {showIncorrect && (
                      <span style={{ color: '#dc3545', fontWeight: 'bold' }}>✗</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {showAnswer && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: isCorrect() ? '#d4edda' : '#f8d7da',
                border: `1px solid ${isCorrect() ? '#28a745' : '#dc3545'}`,
                borderRadius: '4px',
                marginBottom: '1rem',
              }}
            >
              <strong>{isCorrect() ? 'Correct!' : 'Incorrect'}</strong>
              {!isCorrect() && (
                <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  Correct answer{currentQuestion.answer.length > 1 ? 's' : ''}:{' '}
                  {currentQuestion.answer.map((a) => a.toUpperCase()).join(', ')}
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            {!showAnswer && (
              <button
                onClick={checkAnswer}
                disabled={selectedAnswers.length === 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: selectedAnswers.length === 0 ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: selectedAnswers.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Check Answer
              </button>
            )}
            <button
              onClick={getRandomQuestion}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Next Question
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
