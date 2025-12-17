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
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h1>Create Question</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Choose your answer mode and create a question.
      </p>

      {/* Answer Mode Toggle */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold' }}>
          Answer Mode
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => {
              setAnswerMode('choice')
              setAnswerType('single-choice')
              setAnswerData(getEmptyAnswerForType('single-choice').data)
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '1rem',
              backgroundColor: answerMode === 'choice' ? '#007bff' : '#e9ecef',
              color: answerMode === 'choice' ? 'white' : '#495057',
              border: `2px solid ${answerMode === 'choice' ? '#007bff' : '#dee2e6'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: answerMode === 'choice' ? 'bold' : 'normal',
            }}
          >
            Multiple Choice
          </button>
          <button
            type="button"
            onClick={() => {
              setAnswerMode('text')
              setAnswerType('text-match')
              setAnswerData(getEmptyAnswerForType('text-match').data)
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '1rem',
              backgroundColor: answerMode === 'text' ? '#007bff' : '#e9ecef',
              color: answerMode === 'text' ? 'white' : '#495057',
              border: `2px solid ${answerMode === 'text' ? '#007bff' : '#dee2e6'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: answerMode === 'text' ? 'bold' : 'normal',
            }}
          >
            Text Answer
          </button>
        </div>
      </div>

      {/* Question Type Indicator */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#e7f3ff',
          border: '1px solid #007bff',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          display: 'inline-block',
        }}
      >
        <strong>Question Type:</strong> {answerType}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="question"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Question Text
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            placeholder="Enter your question"
          />
        </div>

        {answerMode === 'choice' ? (
          <QuestionCreateChoices
            data={answerData as MultipleChoiceAnswer}
            onChange={(data, type) => {
              setAnswerData(data)
              setAnswerType(type)
            }}
          />
        ) : (
          <QuestionCreateText
            data={answerData as TextAnswer | NumericAnswer}
            answerType={answerType as 'numeric' | 'text-match'}
            onChange={(data, type) => {
              setAnswerData(data)
              setAnswerType(type)
            }}
          />
        )}

        {submitError && (
          <div
            style={{
              color: 'red',
              padding: '1rem',
              border: '1px solid red',
              borderRadius: '4px',
              marginBottom: '1rem',
            }}
          >
            <strong>Error:</strong> {submitError}
          </div>
        )}

        {success && (
          <div
            style={{
              color: 'green',
              padding: '1rem',
              border: '1px solid green',
              borderRadius: '4px',
              marginBottom: '1rem',
            }}
          >
            Question created successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isFormValid}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            backgroundColor: loading || !isFormValid ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating...' : 'Create Question'}
        </button>
      </form>
    </div>
  )
}
