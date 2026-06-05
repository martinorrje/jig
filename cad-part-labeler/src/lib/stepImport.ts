import initOcct from 'occt-import-js'
import wasmUrl from 'occt-import-js/dist/occt-import-js.wasm?url'
import type { CadColor, CadMeshData, ImportedStepModel } from '../types/cadMesh'

let occtPromise: ReturnType<typeof initOcct> | null = null

export async function importStepModel(sourceUrl: string): Promise<ImportedStepModel> {
  const [occt, response] = await Promise.all([getOcct(), fetch(sourceUrl)])

  if (!response.ok) {
    throw new Error(`Could not load STEP file: ${response.status}`)
  }

  const fileBuffer = new Uint8Array(await response.arrayBuffer())
  const result = occt.ReadStepFile(fileBuffer, {
    linearUnit: 'millimeter',
    linearDeflectionType: 'bounding_box_ratio',
    linearDeflection: 0.0005,
    angularDeflection: 0.35,
  })

  if (!result.success || !result.meshes) {
    throw new Error(result.error ?? 'Could not import STEP file')
  }

  return {
    meshes: result.meshes.map((mesh, index): CadMeshData => {
      const color = toColor(mesh.color, [0.72, 0.72, 0.68])

      return {
        name: mesh.name ?? `STEP mesh ${index + 1}`,
        positions: flattenNumbers(mesh.attributes.position.array),
        normals: mesh.attributes.normal
          ? flattenNumbers(mesh.attributes.normal.array)
          : null,
        indices: flattenNumbers(mesh.index.array).map((value) => Math.trunc(value)),
        color,
        faceColorRanges: (mesh.brep_faces ?? [])
          .filter((face) => face.color)
          .map((face) => ({
            firstTriangle: face.first,
            lastTriangle: face.last,
            color: toColor(face.color, color),
          })),
      }
    }),
  }
}

function getOcct() {
  occtPromise ??= initOcct({
    locateFile: (path) => (path.endsWith('.wasm') ? wasmUrl : path),
  })

  return occtPromise
}

function flattenNumbers(values: number[] | number[][]): number[] {
  return values.flatMap((value) => (Array.isArray(value) ? value : [value]))
}

function toColor(value: number[] | null | undefined, fallback: CadColor): CadColor {
  if (!value || value.length < 3) return fallback

  return [clampColor(value[0] ?? fallback[0]), clampColor(value[1] ?? fallback[1]), clampColor(value[2] ?? fallback[2])]
}

function clampColor(value: number) {
  return Math.max(0, Math.min(1, value))
}
