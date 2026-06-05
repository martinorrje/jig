declare module 'occt-import-js' {
  type OcctMesh = {
    name?: string
    color?: number[]
    brep_faces?: Array<{
      first: number
      last: number
      color: number[] | null
    }>
    attributes: {
      position: { array: number[] | number[][] }
      normal?: { array: number[] | number[][] }
    }
    index: { array: number[] | number[][] }
  }

  type OcctResult = {
    success: boolean
    error?: string
    meshes?: OcctMesh[]
  }

  type OcctModule = {
    ReadStepFile: (content: Uint8Array, params: object | null) => OcctResult
  }

  const initOcct: (options?: {
    locateFile?: (path: string) => string
  }) => Promise<OcctModule>

  export default initOcct
}

declare module 'occt-import-js/dist/occt-import-js.wasm?url' {
  const url: string
  export default url
}
