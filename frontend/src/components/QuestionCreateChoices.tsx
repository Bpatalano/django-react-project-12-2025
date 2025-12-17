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
    <div className="mb-6">
      <label className="block mb-3 font-semibold text-slate-300 text-sm sm:text-base">
        Options
      </label>
      {optionKeys.map((key) => (
        <div
          key={key}
          className="flex flex-col sm:flex-row items-start sm:items-center mb-3 gap-2"
        >
          <span className="font-bold min-w-[30px] uppercase text-primary-light text-lg">
            {key}.
          </span>
          <input
            type="text"
            value={localOptions[key]}
            onChange={(e) => handleOptionChange(key, e.target.value)}
            className="flex-1 w-full sm:w-auto px-4 py-3 text-base bg-dark-elevated border-2 border-dark-border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder={`Option ${key.toUpperCase()}`}
          />
          <label
            className={`flex items-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
              localCorrectKeys.includes(key)
                ? 'bg-success-bg border-success text-success-light shadow-lg shadow-success/20'
                : 'bg-dark-elevated border-dark-border text-slate-400 hover:border-success'
            }`}
          >
            <input
              type="checkbox"
              checked={localCorrectKeys.includes(key)}
              onChange={() => toggleCorrectAnswer(key)}
              disabled={!localOptions[key].trim()}
              className="w-4 h-4 cursor-pointer accent-success"
            />
            <span className="text-sm font-bold whitespace-nowrap">✓ Correct</span>
          </label>
        </div>
      ))}
      <p className="text-sm text-slate-400 mt-3 bg-dark-elevated p-3 rounded-lg border border-dark-border">
        💡 <strong>Tip:</strong> Leave options blank if not needed. Check "Correct" for one or more right answers.
      </p>
    </div>
  )
}