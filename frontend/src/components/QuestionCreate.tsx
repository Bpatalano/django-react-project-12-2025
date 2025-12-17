import { useState } from 'react'
import { API_ENDPOINTS } from '../config'
import QuestionCreateChoices from './QuestionCreateChoices'
import QuestionCreateText from './QuestionCreateText'
import type {
  AnswerType,
  MultipleChoiceAnswer,
  TextAnswer,
  NumericAnswer,
} from '../types/question'
import { answerValidators, getEmptyAnswerForType } from '../types/question'

type AnswerMode = 'choice' | 'text'

export default function QuestionCreate() {
  const [submissionId, setSubmissionId] = useState<number>(1)
  const [question, setQuestion] = useState('')
  const [answerMode, setAnswerMode] = useState<AnswerMode>('choice')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Derive current answer type and data based on mode
  const [answerType, setAnswerType] = useState<AnswerType>(answerMode === 'choice' ? 'single-choice' : 'text-match')
  const [answerData, setAnswerData] = useState(getEmptyAnswerForType(answerType).data)

  // Derived validation using type-specific validators
  const answerError = answerValidators[answerType](answerData as any)
  const isFormValid = question.trim().length > 0 && answerError === null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      setSubmitError(answerError)
      return
    }

    setLoading(true)
    setSuccess(false)
    setSubmitError(null)

    // Build request body based on answer type
    const requestBody: any = {
      question: question,
      type: answerType,
    }

    // Map to API format based on type
    if (answerType === 'single-choice' || answerType === 'multiple-choice') {
      const data = answerData as MultipleChoiceAnswer
      requestBody.options = data.options
      requestBody.answer = data.correctKeys
    } else if (answerType === 'numeric' || answerType === 'text-match') {
      const data = answerData as NumericAnswer | TextAnswer
      requestBody.answer = [data.value]
    }

    try {
      const response = await fetch(API_ENDPOINTS.questions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      setSuccess(true)
      // Reset form
      setQuestion('')
      setAnswerData(getEmptyAnswerForType(answerType).data)
      setSubmissionId((id) => id + 1)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 mb-3">
          Create Question
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Choose your answer mode and create a question.
        </p>
      </div>

      {/* Answer Mode Toggle */}
      <div className="mb-6 sm:mb-8">
        <label className="block mb-3 font-semibold text-slate-300 text-sm sm:text-base">
          Answer Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setAnswerMode('choice')
              setAnswerType('single-choice')
              setAnswerData(getEmptyAnswerForType('single-choice').data)
            }}
            className={`px-4 py-3 sm:py-4 text-base sm:text-lg rounded-lg border-2 transition-all duration-200 font-semibold ${
              answerMode === 'choice'
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/50'
                : 'bg-dark-surface text-slate-300 border-dark-border hover:border-primary hover:bg-dark-elevated'
            }`}
          >
            🎯 Multiple Choice
          </button>
          <button
            type="button"
            onClick={() => {
              setAnswerMode('text')
              setAnswerType('text-match')
              setAnswerData(getEmptyAnswerForType('text-match').data)
            }}
            className={`px-4 py-3 sm:py-4 text-base sm:text-lg rounded-lg border-2 transition-all duration-200 font-semibold ${
              answerMode === 'text'
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/50'
                : 'bg-dark-surface text-slate-300 border-dark-border hover:border-primary hover:bg-dark-elevated'
            }`}
          >
            ✍️ Text Answer
          </button>
        </div>
      </div>

      {/* Question Type Indicator */}
      <div className="inline-block px-4 py-2 bg-dark-surface border-2 border-primary/30 rounded-lg mb-6 sm:mb-8">
        <span className="font-semibold text-slate-300 text-sm sm:text-base">Question Type:</span>{' '}
        <span className="text-primary-light font-bold">{answerType}</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-dark-surface rounded-xl p-4 sm:p-6 lg:p-8 border-2 border-dark-border shadow-xl">
        <div className="mb-6">
          <label
            htmlFor="question"
            className="block mb-2 font-semibold text-slate-300 text-sm sm:text-base"
          >
            Question Text
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-4 py-3 text-base sm:text-lg bg-dark-elevated border-2 border-dark-border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="Enter your question"
          />
        </div>

        {answerMode === 'choice' ? (
          <QuestionCreateChoices
            key={submissionId}
            data={answerData as MultipleChoiceAnswer}
            onChange={(data, type) => {
              setAnswerData(data)
              setAnswerType(type)
            }}
          />
        ) : (
          <QuestionCreateText
            key={submissionId}
            data={answerData as TextAnswer | NumericAnswer}
            answerType={answerType as 'numeric' | 'text-match'}
            onChange={(data, type) => {
              setAnswerData(data)
              setAnswerType(type)
            }}
          />
        )}

        {submitError && (
          <div className="p-4 mb-6 text-danger-light bg-danger-bg border-2 border-danger rounded-lg">
            <strong className="font-semibold">❌ Error:</strong> {submitError}
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 text-success-light bg-success-bg border-2 border-success rounded-lg">
            <strong className="font-semibold">✅ Success!</strong> Question created successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`w-full sm:w-auto px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-lg transition-all duration-200 ${
            loading || !isFormValid
              ? 'bg-dark-border text-slate-500 cursor-not-allowed opacity-50'
              : 'bg-primary text-white hover:bg-primary-hover cursor-pointer shadow-lg shadow-primary/30 hover:shadow-primary/50'
          }`}
        >
          {loading ? '⏳ Creating...' : '✨ Create Question'}
        </button>
      </form>
    </div>
  )
}
