import { describe, expect, test } from 'vitest'
import {
  hardwareSpecSchema,
  isHardwareSpec,
} from '../../supabase/functions/_shared/hardwareSpecContract'

describe('hardwareSpecContract', () => {
  test('does not require nextSteps on hardware specs', () => {
    const spec = {
      title: 'Desk Plant Monitor',
      summary: 'A compact monitor for a desk plant.',
      requirements: ['Measure soil moisture.'],
      constraints: ['Use beginner-friendly modules.'],
      assumptions: ['The plant is indoors.'],
      risks: ['Moisture probes can corrode.'],
    }

    expect(isHardwareSpec(spec)).toBe(true)
    expect(hardwareSpecSchema.required).not.toContain('nextSteps')
    expect(hardwareSpecSchema.properties).not.toHaveProperty('nextSteps')
  })
})
