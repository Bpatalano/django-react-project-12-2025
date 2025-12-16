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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [textAnswer, setTextAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizSeed] = useState(() => Date.now().toString())

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use quiz-set endpoint with seed for consistent question sets
      // Note: Seed is not yet used for caching, but route is prepared for it
      const response = await fetch(API_ENDPOINTS.quizSet(quizSeed))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setQuestions(data.questions)
      setCurrentQuestionIndex(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex] || null

  const getNextQuestion = () => {
    if (questions.length === 0) return
    // Cycle to next question in the quiz set
    const nextIndex = (currentQuestionIndex + 1) % questions.length
    setCurrentQuestionIndex(nextIndex)
    setSelectedAnswers([])
    setTextAnswer('')
    setShowAnswer(false)
  }

  const toggleOption = (key: string) => {
    if (showAnswer) return
    setSelectedAnswers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleTextAnswerChange = (value: string) => {
    if (showAnswer) return
    // For text-match questions, only allow alphanumeric and spaces
    if (currentQuestion?.type === 'text-match') {
      const filtered = value.replace(/[^a-zA-Z0-9 ]/g, '')
      setTextAnswer(filtered)
    } else {
      // For numeric, the input type="number" handles validation
      setTextAnswer(value)
    }
  }

  const checkAnswer = () => {
    setShowAnswer(true)
  }

  const isCorrect = () => {
    if (!currentQuestion) return false

    if (currentQuestion.type === 'numeric' || currentQuestion.type === 'text-match') {
      // For text-based answers, compare normalized lowercase version
      const userAnswer = textAnswer.trim().toLowerCase()
      const correctAnswer = currentQuestion.answer[0]
      return userAnswer === correctAnswer
    } else {
      // For multiple choice, compare selected options
      const correctSet = new Set(currentQuestion.answer)
      const selectedSet = new Set(selectedAnswers)
      return (
        correctSet.size === selectedSet.size &&
        [...correctSet].every((key) => selectedSet.has(key))
      )
    }
  }

  const isTextBasedQuestion = currentQuestion && (currentQuestion.type === 'numeric' || currentQuestion.type === 'text-match')
  const canSubmitAnswer = isTextBasedQuestion ? textAnswer.trim() !== '' : selectedAnswers.length > 0

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
        Select the correct answer(s) and check your response. Single-choice questions have one answer, multiple-choice have more.
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
          <div
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor:
                currentQuestion.type === 'single-choice'
                  ? '#fff3cd'
                  : currentQuestion.type === 'numeric'
                  ? '#d4edda'
                  : currentQuestion.type === 'text-match'
                  ? '#f8d7da'
                  : '#d1ecf1',
              border: `1px solid ${
                currentQuestion.type === 'single-choice'
                  ? '#ffc107'
                  : currentQuestion.type === 'numeric'
                  ? '#28a745'
                  : currentQuestion.type === 'text-match'
                  ? '#dc3545'
                  : '#0dcaf0'
              }`,
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            {currentQuestion.type === 'single-choice'
              ? 'Single Choice'
              : currentQuestion.type === 'multiple-choice'
              ? 'Multiple Choice'
              : currentQuestion.type === 'numeric'
              ? 'Numeric'
              : 'Text Match'}
          </div>
          <h2 style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: '#333' }}>
            {currentQuestion.question}
          </h2>

          {isTextBasedQuestion ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="answerInput"
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
              >
                Your Answer
              </label>
              <input
                id="answerInput"
                type={currentQuestion.type === 'numeric' ? 'number' : 'text'}
                value={textAnswer}
                onChange={(e) => handleTextAnswerChange(e.target.value)}
                disabled={showAnswer}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
                placeholder={currentQuestion.type === 'numeric' ? 'Enter a number' : 'Enter your answer'}
              />
              {currentQuestion.type === 'text-match' && (
                <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Answer is case-insensitive and will be converted to lowercase.
                </p>
              )}
            </div>
          ) : (
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
          )}

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
                disabled={!canSubmitAnswer}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: !canSubmitAnswer ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !canSubmitAnswer ? 'not-allowed' : 'pointer',
                }}
              >
                Check Answer
              </button>
            )}
            <button
              onClick={getNextQuestion}
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

          <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#666', textAlign: 'center' }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      )}
    </div>
  )
}
