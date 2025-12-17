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
      <div className="text-center p-8">
        <div className="inline-block animate-pulse">
          <p className="text-slate-300 text-lg">⏳ Loading questions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="p-4 sm:p-6 text-danger-light bg-danger-bg border-2 border-danger rounded-lg">
          <strong className="font-semibold">❌ Error:</strong> {error}
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 mb-4">
          Answer Questions
        </h1>
        <p className="text-slate-400 text-lg mt-4">
          📝 No questions available. Create some questions first!
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 mb-3">
          Answer Questions
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Select the correct answer(s) and check your response. Test your knowledge!
        </p>
      </div>

      {currentQuestion && (
        <div className="bg-dark-surface border-2 border-dark-border rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl">
          <div className={`inline-block px-4 py-2 rounded-lg text-sm font-bold mb-4 border-2 ${
            currentQuestion.type === 'single-choice'
              ? 'bg-warning-bg border-warning text-warning'
              : currentQuestion.type === 'numeric'
              ? 'bg-success-bg border-success text-success-light'
              : currentQuestion.type === 'text-match'
              ? 'bg-pink-900 border-pink-500 text-pink-300'
              : 'bg-primary/20 border-primary text-primary-light'
          }`}>
            {currentQuestion.type === 'single-choice'
              ? '🎯 Single Choice'
              : currentQuestion.type === 'multiple-choice'
              ? '✅ Multiple Choice'
              : currentQuestion.type === 'numeric'
              ? '🔢 Numeric'
              : '✍️ Text Match'}
          </div>
          <h2 className="mt-2 mb-6 text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100">
            {currentQuestion.question}
          </h2>

          {isTextBasedQuestion ? (
            <div className="mb-6">
              <label
                htmlFor="answerInput"
                className="block mb-2 font-semibold text-slate-300"
              >
                Your Answer
              </label>
              <input
                id="answerInput"
                type={currentQuestion.type === 'numeric' ? 'number' : 'text'}
                value={textAnswer}
                onChange={(e) => handleTextAnswerChange(e.target.value)}
                disabled={showAnswer}
                className="w-full px-4 py-3 text-base sm:text-lg bg-dark-elevated border-2 border-dark-border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                placeholder={currentQuestion.type === 'numeric' ? 'Enter a number' : 'Enter your answer'}
              />
              {currentQuestion.type === 'text-match' && (
                <p className="text-sm text-slate-400 mt-2 bg-dark-elevated p-2 rounded border border-dark-border">
                  💡 Answer is case-insensitive and will be converted to lowercase.
                </p>
              )}
            </div>
          ) : (
            <div className="mb-6 space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => {
              const isSelected = selectedAnswers.includes(key)
              const isCorrectAnswer = currentQuestion.answer.includes(key)
              const showCorrect = showAnswer && isCorrectAnswer
              const showIncorrect = showAnswer && isSelected && !isCorrectAnswer

              return (
                <div
                  key={key}
                  onClick={() => toggleOption(key)}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    showCorrect
                      ? 'border-success bg-success-bg shadow-lg shadow-success/20'
                      : showIncorrect
                      ? 'border-danger bg-danger-bg shadow-lg shadow-danger/20'
                      : isSelected
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : 'border-dark-border bg-dark-elevated hover:border-primary/50'
                  } ${showAnswer ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01]'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold min-w-[30px] uppercase text-primary-light text-lg">
                      {key}.
                    </span>
                    <span className={`flex-1 ${
                      showCorrect ? 'text-success-light font-semibold' :
                      showIncorrect ? 'text-danger-light font-semibold' :
                      isSelected ? 'text-slate-100 font-medium' :
                      'text-slate-300'
                    }`}>{value}</span>
                    {showCorrect && (
                      <span className="text-success text-2xl font-bold">✓</span>
                    )}
                    {showIncorrect && (
                      <span className="text-danger text-2xl font-bold">✗</span>
                    )}
                  </div>
                </div>
              )
              })}
            </div>
          )}

          {showAnswer && (
            <div
              className={`p-4 sm:p-6 border-2 rounded-lg mb-6 ${
                isCorrect()
                  ? 'bg-success-bg border-success shadow-lg shadow-success/20'
                  : 'bg-danger-bg border-danger shadow-lg shadow-danger/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{isCorrect() ? '🎉' : '❌'}</span>
                <strong className={`text-lg ${isCorrect() ? 'text-success-light' : 'text-danger-light'}`}>
                  {isCorrect() ? 'Correct!' : 'Incorrect'}
                </strong>
              </div>
              {!isCorrect() && (
                <p className={`mt-2 mb-0 text-slate-300`}>
                  <strong>Correct answer{currentQuestion.answer.length > 1 ? 's' : ''}:</strong>{' '}
                  <span className="text-success-light font-bold">
                    {currentQuestion.answer.map((a) => a.toUpperCase()).join(', ')}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {!showAnswer && (
              <button
                onClick={checkAnswer}
                disabled={!canSubmitAnswer}
                className={`px-6 py-3 sm:py-4 text-base sm:text-lg font-bold border-none rounded-lg transition-all duration-200 ${
                  !canSubmitAnswer
                    ? 'bg-dark-border text-slate-500 cursor-not-allowed opacity-50'
                    : 'bg-success text-white hover:bg-success-hover cursor-pointer shadow-lg shadow-success/30 hover:shadow-success/50'
                }`}
              >
                ✅ Check Answer
              </button>
            )}
            <button
              onClick={getNextQuestion}
              className="px-6 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-primary hover:bg-primary-hover border-none rounded-lg cursor-pointer shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-200"
            >
              ➡️ Next Question
            </button>
          </div>

          <div className="mt-6 text-sm sm:text-base text-slate-400 text-center bg-dark-elevated p-3 rounded-lg border border-dark-border">
            📊 Question <span className="text-primary-light font-bold">{currentQuestionIndex + 1}</span> of <span className="text-primary-light font-bold">{questions.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
