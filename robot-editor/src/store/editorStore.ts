import { create } from 'zustand'
import { addBaseBody, createEmptyRobotState } from '../model/robotState'
import type { RobotState } from '../model/types'

type EditorState = {
  robot: RobotState
  addBase: () => void
}

let nextBaseIndex = 1

function createBodyId() {
  const id = `body-${nextBaseIndex}`
  nextBaseIndex += 1
  return id
}

export const useEditorStore = create<EditorState>((set) => ({
  robot: createEmptyRobotState(),

  addBase: () => {
    set((state) => ({
      robot: addBaseBody(state.robot, createBodyId()),
    }))
  },
}))
