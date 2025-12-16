import { useState } from 'react'
import { API_ENDPOINTS } from '../config'

type OptionKey = 'a' | 'b' | 'c' | 'd' | 'e'

export default function QuestionCreate() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<Record<OptionKey, string>>({
    a: '',
    b: '',
    c: '',
    d: '',
    e: '',
  })
  const [correctAnswers, setCorrectAnswers] = useState<OptionKey[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOptionChange = (key: OptionKey, value: string) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const toggleCorrectAnswer = (key: OptionKey) => {
    setCorrectAnswers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(null)

    // Filter out empty options
    const filledOptions = Object.entries(options)
      .filter(([_, value]) => value.trim() !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

    if (Object.keys(filledOptions).length < 2) {
      setError('Please provide at least 2 options')
      setLoading(false)
      return
    }

    if (correctAnswers.length === 0) {
      setError('Please select at least one correct answer')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(API_ENDPOINTS.questions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          type: 'multiple-choice',
          options: filledOptions,
          answer: correctAnswers,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      setSuccess(true)
      setQuestion('')
      setOptions({ a: '', b: '', c: '', d: '', e: '' })
      setCorrectAnswers([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const optionKeys: OptionKey[] = ['a', 'b', 'c', 'd', 'e']

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h1>Create Multiple Choice Question</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Create a question with multiple options and select one or more correct answers
      </p>

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
            required
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

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold' }}>
            Options
          </label>
          {optionKeys.map((key) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.75rem',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  fontWeight: 'bold',
                  minWidth: '30px',
                  textTransform: 'uppercase',
                }}
              >
                {key}.
              </span>
              <input
                type="text"
                value={options[key]}
                onChange={(e) => handleOptionChange(key, e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                placeholder={`Option ${key.toUpperCase()}`}
              />
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  backgroundColor: correctAnswers.includes(key) ? '#d4edda' : '#f8f9fa',
                  border: `2px solid ${correctAnswers.includes(key) ? '#28a745' : '#ccc'}`,
                  borderRadius: '4px',
                }}
              >
                <input
                  type="checkbox"
                  checked={correctAnswers.includes(key)}
                  onChange={() => toggleCorrectAnswer(key)}
                  disabled={!options[key].trim()}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Correct</span>
              </label>
            </div>
          ))}
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
            Leave options blank if not needed. Check "Correct" for one or more right answers.
          </p>
        </div>

        {error && (
          <div
            style={{
              color: 'red',
              padding: '1rem',
              border: '1px solid red',
              borderRadius: '4px',
              marginBottom: '1rem',
            }}
          >
            <strong>Error:</strong> {error}
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
          disabled={loading}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating...' : 'Create Question'}
        </button>
      </form>
    </div>
  )
}
