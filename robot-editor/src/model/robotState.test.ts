import { describe, expect, it } from 'vitest'
import { addBaseBody, createEmptyRobotState } from './robotState'

describe('robotState', () => {
  it('adds a default base body without mutating the previous state', () => {
    const initialState = createEmptyRobotState()

    const nextState = addBaseBody(initialState, 'body-1')

    expect(Object.keys(initialState.bodies)).toEqual([])
    expect(nextState.bodies['body-1']).toEqual({
      id: 'body-1',
      role: 'base',
      frame: {
        position: [0, 0, 0.1],
        rotation: [0, 0, 0, 1],
      },
      shape: {
        type: 'box',
        size: [2.4, 1.4, 0.2],
      },
    })
    expect(nextState.joints).toEqual({})
    expect(nextState).not.toHaveProperty('links')
  })
})
