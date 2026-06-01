export type Vec3 = [number, number, number]

export type QuaternionTuple = [number, number, number, number]

export type Frame = {
  position: Vec3
  rotation: QuaternionTuple
}

export type BodyRole = 'base' | 'link'

export type BodyShape = {
  type: 'box'
  size: Vec3
}

export type Body = {
  id: string
  role: BodyRole
  frame: Frame
  shape: BodyShape
}

export type JointAxis = 'yaw' | 'pitch' | 'roll' | 'spherical'

export type Joint = {
  id: string
  frame: Frame
  axis: JointAxis
  parentId: string | null
}

export type RobotState = {
  bodies: Record<string, Body>
  joints: Record<string, Joint>
}
