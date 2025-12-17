// Answer type definitions
export type AnswerType = 'single-choice' | 'multiple-choice' | 'numeric' | 'text-match'

export type OptionKey = 'a' | 'b' | 'c' | 'd' | 'e'

export type MultipleChoiceAnswer = {
  options: Record<OptionKey, string> // { a: "option 1", b: "option 2", ... }
  correctKeys: OptionKey[] // ["a"] for single, ["a", "b"] for multiple
}

export type TextAnswer = {
  value: string // normalized lowercase
}

export type NumericAnswer = {
  value: string // stored as string to preserve user input
}

export type AnswerPayload =
  | { type: 'single-choice'; data: MultipleChoiceAnswer }
  | { type: 'multiple-choice'; data: MultipleChoiceAnswer }
  | { type: 'numeric'; data: NumericAnswer }
  | { type: 'text-match'; data: TextAnswer }

// Validation functions keyed by answer type
export const answerValidators = {
  'single-choice': (data: MultipleChoiceAnswer): string | null => {
    const optionCount = Object.keys(data.options).length
    if (optionCount < 2) {
      return 'Please provide at least 2 options'
    }
    if (data.correctKeys.length !== 1) {
      return 'Please select exactly one correct answer'
    }
    const optionKeys = new Set(Object.keys(data.options))
    const hasInvalidKeys = data.correctKeys.some(key => !optionKeys.has(key))
    if (hasInvalidKeys) {
      return 'Selected answer must be one of the options'
    }
    return null
  },

  'multiple-choice': (data: MultipleChoiceAnswer): string | null => {
    const optionCount = Object.keys(data.options).length
    if (optionCount < 2) {
      return 'Please provide at least 2 options'
    }
    if (data.correctKeys.length < 2) {
      return 'Please select at least 2 correct answers for multiple-choice'
    }
    const optionKeys = new Set(Object.keys(data.options))
    const hasInvalidKeys = data.correctKeys.some(key => !optionKeys.has(key))
    if (hasInvalidKeys) {
      return 'Selected answers must be from the options'
    }
    return null
  },

  'numeric': (data: NumericAnswer): string | null => {
    const trimmed = data.value.trim()
    if (trimmed.length === 0) {
      return 'Please provide a numeric answer'
    }
    if (!/^-?\d+\.?\d*$/.test(trimmed)) {
      return 'Answer must be a valid number'
    }
    return null
  },

  'text-match': (data: TextAnswer): string | null => {
    const trimmed = data.value.trim()
    if (trimmed.length === 0) {
      return 'Please provide a text answer'
    }
    // Only alphanumeric and spaces allowed
    if (!/^[a-z0-9 ]+$/.test(trimmed)) {
      return 'Answer must contain only letters, numbers, and spaces'
    }
    return null
  },
} as const

const createEmptyOptions = (): Record<OptionKey,string> => {
  return {
    a: '',
    b: '',
    c: '',
    d: '',
    e: '',
  }
}

// Helper to create empty answer for a given type
export function getEmptyAnswerForType(type: AnswerType): AnswerPayload {
  switch (type) {
    case 'single-choice':
    case 'multiple-choice':
      return {
        type,
        data: { options: createEmptyOptions(), correctKeys: [] }
      }
    case 'numeric':
      return {
        type,
        data: { value: '' }
      }
    case 'text-match':
      return {
        type,
        data: { value: '' }
      }
  }
}

// Helper to detect answer type from text input
export function detectAnswerType(value: string): 'numeric' | 'text-match' {
  const trimmed = value.trim()
  if (/^-?\d+\.?\d*$/.test(trimmed)) {
    return 'numeric'
  }
  return 'text-match'
}
