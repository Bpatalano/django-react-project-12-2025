import { useState } from 'react'
import type { TextAnswer, NumericAnswer } from '../types/question'
import { detectAnswerType } from '../types/question'

interface Props {
  data: TextAnswer | NumericAnswer
  answerType: 'numeric' | 'text-match'
  onChange: (data: TextAnswer | NumericAnswer, type: 'text-match' | 'numeric') => void
}

export default function QuestionCreateText({ data, onChange }: Props) {
  const [localValue, setLocalValue] = useState(data.value)

  const handleChange = (value: string) => {
    // Only allow alphanumeric characters and spaces
    const filtered = value.replace(/[^a-zA-Z0-9 ]/g, '')
    setLocalValue(filtered)

    // Convert to lowercase and detect type
    const normalized = filtered.trim().toLowerCase()
    const detectedType = detectAnswerType(normalized)

    const newData = { value: normalized }
    onChange(newData, detectedType)
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        htmlFor="textAnswer"
        style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
      >
        Answer
      </label>
      <input
        id="textAnswer"
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: '1rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box',
        }}
        placeholder="Enter the answer (alphanumeric only)"
      />
      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
        Answer will be stored in lowercase. Type will be auto-detected: numbers = Numeric, text = Text Match.
      </p>
    </div>
  )
}
