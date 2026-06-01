import type { Body, RobotState } from './types'

export function createEmptyRobotState(): RobotState {
  return {
    bodies: {},
    joints: {},
  }
}

export function createBaseBody(id: string): Body {
  return {
    id,
    role: 'base',
    frame: {
      position: [0, 0, 0.1],
      rotation: [0, 0, 0, 1],
    },
    shape: {
      type: 'box',
      size: [2.4, 1.4, 0.2],
    },
  }
}

export function addBaseBody(state: RobotState, id: string): RobotState {
  return {
    ...state,
    bodies: {
      ...state.bodies,
      [id]: createBaseBody(id),
    },
  }
}
