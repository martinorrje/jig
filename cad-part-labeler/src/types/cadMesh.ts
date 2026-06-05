export type CadColor = [number, number, number]

export type CadFaceColorRange = {
  firstTriangle: number
  lastTriangle: number
  color: CadColor
}

export type CadMeshData = {
  name: string
  positions: number[]
  normals: number[] | null
  indices: number[]
  color: CadColor
  faceColorRanges: CadFaceColorRange[]
}

export type ImportedStepModel = {
  meshes: CadMeshData[]
}
