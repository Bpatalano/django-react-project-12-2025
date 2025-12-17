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
    <div className="mb-6">
      <label
        htmlFor="textAnswer"
        className="block mb-2 font-semibold text-slate-300 text-sm sm:text-base"
      >
        Answer
      </label>
      <input
        id="textAnswer"
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-4 py-3 text-base sm:text-lg bg-dark-elevated border-2 border-dark-border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        placeholder="Enter the answer (alphanumeric only)"
      />
      <p className="text-sm text-slate-400 mt-3 bg-dark-elevated p-3 rounded-lg border border-dark-border">
        💡 <strong>Note:</strong> Answer will be stored in lowercase. Type will be auto-detected: numbers = Numeric, text = Text Match.
      </p>
    </div>
  )
}
