import { describe, expect, test } from 'vitest'
import { formatElapsedTime } from './time'

describe('formatElapsedTime', () => {
  test('formats elapsed seconds as mm:ss', () => {
    expect(formatElapsedTime(0)).toBe('00:00')
    expect(formatElapsedTime(7)).toBe('00:07')
    expect(formatElapsedTime(65)).toBe('01:05')
    expect(formatElapsedTime(754)).toBe('12:34')
  })
})
