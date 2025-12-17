import { useState } from 'react'
import type { MultipleChoiceAnswer, OptionKey } from '../types/question'

interface Props {
  data: MultipleChoiceAnswer
  onChange: (data: MultipleChoiceAnswer, type: 'single-choice' | 'multiple-choice') => void
}

export default function QuestionCreateChoices({ data, onChange }: Props) {
  const [localOptions, setLocalOptions] = useState(data.options)
  const [localCorrectKeys, setLocalCorrectKeys] = useState(data.correctKeys)

  const handleOptionChange = (key: OptionKey, value: string) => {
    const newOptions = { ...localOptions, [key]: value }
    setLocalOptions(newOptions)

    // Filter out empty options and emit
    const filledOptions = Object.entries(newOptions)
      .filter(([_, v]) => v.trim() !== '')
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) as Record<string, string>

    const newData: MultipleChoiceAnswer = {
      options: filledOptions,
      correctKeys: localCorrectKeys,
    }

    const type = localCorrectKeys.length === 1 ? 'single-choice' : 'multiple-choice'
    onChange(newData, type)
  }

  const toggleCorrectAnswer = (key: OptionKey) => {
    const newCorrectKeys = localCorrectKeys.includes(key)
      ? localCorrectKeys.filter((k) => k !== key)
      : [...localCorrectKeys, key]

    setLocalCorrectKeys(newCorrectKeys)

    // Emit with new correct keys
    const filledOptions = Object.entries(localOptions)
      .filter(([_, v]) => v.trim() !== '')
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) as Record<string, string>

    const newData: MultipleChoiceAnswer = {
      options: filledOptions,
      correctKeys: newCorrectKeys,
    }

    const type = newCorrectKeys.length === 1 ? 'single-choice' : 'multiple-choice'
    onChange(newData, type)
  }

  const optionKeys: OptionKey[] = ['a', 'b', 'c', 'd', 'e']

  return (
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
            value={localOptions[key]}
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
              backgroundColor: localCorrectKeys.includes(key) ? '#d4edda' : '#f8f9fa',
              border: `2px solid ${localCorrectKeys.includes(key) ? '#28a745' : '#ccc'}`,
              borderRadius: '4px',
            }}
          >
            <input
              type="checkbox"
              checked={localCorrectKeys.includes(key)}
              onChange={() => toggleCorrectAnswer(key)}
              disabled={!localOptions[key].trim()}
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
  )
}