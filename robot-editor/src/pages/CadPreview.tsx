import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CadStorageObject, ProjectCadState } from '../services/projectService'
import { formatElapsedTime } from '../utils/time'
import { useElapsedSeconds } from '../utils/useElapsedSeconds'

type CadPreviewProps = {
  cad: ProjectCadState | undefined
}

export function CadPreview({ cad }: CadPreviewProps) {
  const stlStorage = cad?.status === 'ready' ? cad.workerResult.storage?.stl : undefined
  const elapsedSeconds = useElapsedSeconds(cad?.status === 'loading' || !cad)

  return (
    <aside className="cad-panel" aria-labelledby="cad-panel-title">
      <div className="cad-panel-copy">
        <p className="eyebrow">Generated CAD</p>
        <h2 id="cad-panel-title">Housing preview</h2>
      </div>

      {cad?.status === 'ready' && stlStorage ? (
        <CadMeshViewer storage={stlStorage} />
      ) : (
        <div className="cad-placeholder">
          <span>{createCadStatusMessage(cad, elapsedSeconds)}</span>
          {cad?.status === 'loading' || !cad ? (
            <small>Build123d generation and upload can take a few minutes.</small>
          ) : null}
        </div>
      )}
    </aside>
  )
}

function CadMeshViewer({ storage }: { storage: CadStorageObject }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const target = host
    let cleanup: (() => void) | null = null
    let disposed = false

    async function setupViewer() {
      const [
        {
          AmbientLight,
          Box3,
          Color,
          DirectionalLight,
          GridHelper,
          Mesh,
          MeshStandardMaterial,
          Object3D,
          PerspectiveCamera,
          Scene,
          Vector3,
          WebGLRenderer,
        },
        { OrbitControls },
        { STLLoader },
      ] = await Promise.all([
        import('three'),
        import('three/examples/jsm/controls/OrbitControls.js'),
        import('three/examples/jsm/loaders/STLLoader.js'),
      ])

      if (disposed) return

      Object3D.DEFAULT_UP.set(0, 0, 1)

      const scene = new Scene()
      scene.background = new Color('#f3efe5')

      const camera = new PerspectiveCamera(45, 1, 0.01, 1000)
      camera.up.set(0, 0, 1)
      camera.position.set(7, -8, 5)

      const renderer = new WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      target.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.target.set(0, 0, 0)
      controls.enableDamping = true

      const grid = new GridHelper(6, 12, '#b7ab94', '#ded6c6')
      grid.rotation.x = Math.PI / 2
      scene.add(grid)
      scene.add(new AmbientLight('#ffffff', 0.75))

      const keyLight = new DirectionalLight('#ffffff', 1.3)
      keyLight.position.set(4, -6, 8)
      scene.add(keyLight)

      let mesh: InstanceType<typeof Mesh> | null = null
      let normalizedRadius = 2.5
      const publicUrl = supabase.storage.from(storage.bucket).getPublicUrl(storage.path).data.publicUrl

      new STLLoader().load(
        publicUrl,
        (geometry) => {
          if (disposed) {
            geometry.dispose()
            return
          }

          geometry.computeBoundingBox()

          const box = geometry.boundingBox ?? new Box3()
          const center = box.getCenter(new Vector3())
          const size = new Vector3()
          box.getSize(size)
          const maxDimension = Math.max(size.x, size.y, size.z, 1)

          geometry.translate(-center.x, -center.y, -center.z)
          geometry.scale(5 / maxDimension, 5 / maxDimension, 5 / maxDimension)
          geometry.computeBoundingSphere()
          normalizedRadius = geometry.boundingSphere?.radius ?? 2.5

          mesh = new Mesh(
            geometry,
            new MeshStandardMaterial({
              color: '#d6a84f',
              metalness: 0.08,
              roughness: 0.58,
            }),
          )
          scene.add(mesh)
          frameScene()
        },
        undefined,
        () => {
          if (!disposed) setLoadError('Could not load the generated STL.')
        },
      )

      const resize = () => {
        const { width, height } = target.getBoundingClientRect()
        camera.aspect = width / Math.max(height, 1)
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        if (mesh) frameScene()
      }

      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(target)
      resize()

      let frameId = 0
      const animate = () => {
        controls.update()
        renderer.render(scene, camera)
        frameId = requestAnimationFrame(animate)
      }
      animate()

      function frameScene() {
        const radius = normalizedRadius * 1.35
        const direction = new Vector3(1.15, -1.25, 0.78).normalize()
        const verticalFov = (camera.fov * Math.PI) / 180
        const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect)
        const fitFov = Math.min(verticalFov, horizontalFov)
        const distance =
          radius / Math.sin(fitFov / 2)

        controls.target.set(0, 0, 0)
        camera.near = Math.max(0.01, distance / 100)
        camera.far = distance * 100
        camera.position.copy(direction.multiplyScalar(distance))
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
        controls.update()
      }

      cleanup = () => {
        cancelAnimationFrame(frameId)
        resizeObserver.disconnect()
        controls.dispose()
        if (mesh) {
          mesh.geometry.dispose()
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => material.dispose())
          } else {
            mesh.material.dispose()
          }
        }
        renderer.dispose()
        renderer.domElement.remove()
      }
    }

    void setupViewer()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [storage.bucket, storage.path])

  return (
    <div className="cad-viewer-shell">
      <div className="cad-viewer" ref={hostRef} />
      {loadError ? <p className="cad-viewer-error">{loadError}</p> : null}
    </div>
  )
}

function createCadStatusMessage(
  cad: ProjectCadState | undefined,
  elapsedSeconds = 0,
) {
  if (!cad || cad.status === 'loading') {
    return `Loading CAD... ${formatElapsedTime(elapsedSeconds)}`
  }
  if (cad.status === 'skipped') return `CAD skipped: ${cad.reason}`
  if (cad.status === 'error') return `CAD failed: ${cad.message}`

  return 'Generated CAD is missing an STL artifact.'
}
