import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
} from 'three'
import type { Body } from '../model/types'

export function replaceBodyMeshes(
  bodyGroup: Group,
  bodies: Body[],
) {
  disposeGroupChildren(bodyGroup)
  bodyGroup.clear()

  for (const body of bodies) {
    bodyGroup.add(createBodyMesh(body))
  }
}

function createBodyMesh(body: Body) {
  const geometry = new BoxGeometry(...body.shape.size)
  const material = new MeshStandardMaterial({
    color: '#6f8fb4',
    roughness: 0.62,
    metalness: 0.05,
  })
  const mesh = new Mesh(geometry, material)

  mesh.position.set(...body.frame.position)
  mesh.quaternion.set(...body.frame.rotation)
  mesh.userData = {
    kind: 'body',
    id: body.id,
  }

  return mesh
}

function disposeGroupChildren(group: Group) {
  group.traverse((object) => {
    if (!(object instanceof Mesh)) return

    object.geometry.dispose()

    if (Array.isArray(object.material)) {
      for (const material of object.material) {
        material.dispose()
      }
      return
    }

    object.material.dispose()
  })
}
