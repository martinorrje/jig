import { useEffect, useRef } from 'react'
import type { BufferGeometry } from 'three'
import type { CadMeshData } from '../types/cadMesh'
import type {
  AttachmentPoint,
  CadFormat,
  CircularFeature,
  Vec3,
} from '../types/catalog'

type ViewportModel = {
  url: string
  format: CadFormat
}

type CadViewportProps = {
  model: ViewportModel | null
  circularFeatures: CircularFeature[]
  attachmentPoints: AttachmentPoint[]
  selectedAttachmentId: string | null
  onSelectCircularFeatureCenter: (feature: CircularFeature) => void
  onSelectAttachment: (id: string) => void
  onDimensionsChange: (dimensionsMm: Vec3) => void
}

export function CadViewport({
  model,
  circularFeatures,
  attachmentPoints,
  selectedAttachmentId,
  onSelectCircularFeatureCenter,
  onSelectAttachment,
  onDimensionsChange,
}: CadViewportProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const modelUrl = model?.url ?? null
  const modelFormat = model?.format ?? null
  const callbacksRef = useRef({
    circularFeatures,
    attachmentPoints,
    selectedAttachmentId,
    onSelectCircularFeatureCenter,
    onSelectAttachment,
    onDimensionsChange,
  })

  useEffect(() => {
    callbacksRef.current = {
      circularFeatures,
      attachmentPoints,
      selectedAttachmentId,
      onSelectCircularFeatureCenter,
      onSelectAttachment,
      onDimensionsChange,
    }
  }, [
    circularFeatures,
    attachmentPoints,
    selectedAttachmentId,
    onSelectCircularFeatureCenter,
    onSelectAttachment,
    onDimensionsChange,
  ])

  useEffect(() => {
    const host = hostRef.current
    if (!host || !modelUrl || !modelFormat) return

    const mount = host
    const sourceUrl = modelUrl
    const sourceFormat = modelFormat
    let disposed = false
    let cleanup: (() => void) | null = null

    async function setup() {
      const [
        {
          AmbientLight,
          AxesHelper,
          Box3,
          BufferAttribute,
          BufferGeometry,
          CanvasTexture,
          Color,
          DirectionalLight,
          EdgesGeometry,
          Float32BufferAttribute,
          GridHelper,
          Group,
          LineBasicMaterial,
          LineSegments,
          Mesh,
          MeshBasicMaterial,
          MeshStandardMaterial,
          Object3D,
          PerspectiveCamera,
          Raycaster,
          Scene,
          SphereGeometry,
          Sprite,
          SpriteMaterial,
          Vector2,
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
      scene.background = new Color('#101214')

      const camera = new PerspectiveCamera(42, 1, 0.01, 10000)
      camera.up.set(0, 0, 1)

      const renderer = new WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      mount.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true

      const grid = new GridHelper(120, 24, '#48505a', '#252b31')
      grid.rotation.x = Math.PI / 2
      scene.add(grid)
      scene.add(new AmbientLight('#ffffff', 0.62))

      const light = new DirectionalLight('#ffffff', 1.55)
      light.position.set(35, -45, 55)
      scene.add(light)

      const partGroup = new Group()
      const markerGroup = new Group()
      const hoverGroup = new Group()
      const axesGroup = new Group()
      scene.add(partGroup, markerGroup, hoverGroup, axesGroup)

      const axes = new AxesHelper(40)
      axesGroup.add(axes)
      axesGroup.add(createAxisLabel('X', '#ff6b5f', [46, 0, 0]))
      axesGroup.add(createAxisLabel('Y', '#5bd978', [0, 46, 0]))
      axesGroup.add(createAxisLabel('Z', '#65a7ff', [0, 0, 46]))

      const raycaster = new Raycaster()
      const pointer = new Vector2()
      const modelCenter = new Vector3()
      const partMeshes: Array<InstanceType<typeof Mesh>> = []
      const edgeLines: Array<InstanceType<typeof LineSegments>> = []
      let hoveredFeature: CircularFeature | null = null
      let worldScale = 1
      let normalizedRadius = 20

      const attachmentGeometry = new SphereGeometry(1.4, 24, 16)
      const hoverGeometry = new SphereGeometry(1.65, 24, 16)
      const markerMaterial = new MeshBasicMaterial({ color: '#f0b84f' })
      const selectedMarkerMaterial = new MeshBasicMaterial({ color: '#65d6ff' })
      const hoverMaterial = new MeshBasicMaterial({ color: '#ffffff' })
      const edgeMaterial = new LineBasicMaterial({
        color: '#111417',
        transparent: true,
        opacity: 0.42,
      })

      if (sourceFormat === 'step') {
        void loadStepMeshes()
      } else {
        loadStlMesh()
      }

      async function loadStepMeshes() {
        try {
          const { importStepModel } = await import('../lib/stepImport')
          const importedModel = await importStepModel(sourceUrl)
          if (disposed) return

          const modelBox = new Box3()
          for (const meshData of importedModel.meshes) {
            const mesh = buildStepMesh(meshData)
            partMeshes.push(mesh)
            partGroup.add(mesh)
            addEdges(mesh)
            mesh.geometry.computeBoundingBox()
            if (mesh.geometry.boundingBox) modelBox.union(mesh.geometry.boundingBox)
          }

          applyModelFrame(modelBox)
        } catch {
          callbacksRef.current.onDimensionsChange([0, 0, 0])
        }
      }

      function loadStlMesh() {
        new STLLoader().load(
          sourceUrl,
          (geometry: BufferGeometry) => {
            if (disposed) {
              geometry.dispose()
              return
            }

            geometry.computeVertexNormals()
            const mesh = new Mesh(
              geometry,
              new MeshStandardMaterial({
                color: '#b8b8ac',
                metalness: 0.08,
                roughness: 0.5,
              }),
            )
            partMeshes.push(mesh)
            partGroup.add(mesh)
            addEdges(mesh)
            geometry.computeBoundingBox()
            applyModelFrame(geometry.boundingBox ?? new Box3())
          },
          undefined,
          () => {
            callbacksRef.current.onDimensionsChange([0, 0, 0])
          },
        )
      }

      function buildStepMesh(meshData: CadMeshData) {
        const geometry = new BufferGeometry()
        geometry.setAttribute(
          'position',
          new Float32BufferAttribute(meshData.positions, 3),
        )
        if (meshData.normals) {
          geometry.setAttribute('normal', new Float32BufferAttribute(meshData.normals, 3))
        }
        geometry.setIndex(
          new BufferAttribute(Uint32Array.from(meshData.indices), 1),
        )
        if (!meshData.normals) geometry.computeVertexNormals()

        const baseMaterial = new MeshStandardMaterial({
          color: new Color(...meshData.color),
          metalness: 0.06,
          roughness: 0.48,
        })
        const materials = [baseMaterial]

        if (meshData.faceColorRanges.length > 0) {
          const ranges = [...meshData.faceColorRanges].sort(
            (a, b) => a.firstTriangle - b.firstTriangle,
          )
          let triangleIndex = 0

          for (const range of ranges) {
            if (triangleIndex < range.firstTriangle) {
              geometry.addGroup(
                triangleIndex * 3,
                (range.firstTriangle - triangleIndex) * 3,
                0,
              )
            }

            const materialIndex = materials.length
            materials.push(
              new MeshStandardMaterial({
                color: new Color(...range.color),
                metalness: 0.06,
                roughness: 0.48,
              }),
            )
            geometry.addGroup(
              range.firstTriangle * 3,
              (range.lastTriangle - range.firstTriangle + 1) * 3,
              materialIndex,
            )
            triangleIndex = range.lastTriangle + 1
          }

          const triangleCount = meshData.indices.length / 3
          if (triangleIndex < triangleCount) {
            geometry.addGroup(
              triangleIndex * 3,
              (triangleCount - triangleIndex) * 3,
              0,
            )
          }
        }

        const mesh = new Mesh(geometry, materials.length > 1 ? materials : baseMaterial)
        mesh.name = meshData.name
        return mesh
      }

      function addEdges(mesh: InstanceType<typeof Mesh>) {
        const edges = new LineSegments(
          new EdgesGeometry(mesh.geometry, 35),
          edgeMaterial,
        )
        edges.name = `${mesh.name || 'mesh'} edges`
        edgeLines.push(edges)
        mesh.add(edges)
      }

      function applyModelFrame(modelBox: InstanceType<typeof Box3>) {
        const center = modelBox.getCenter(modelCenter)
        const size = modelBox.getSize(new Vector3())
        const maxDimension = Math.max(size.x, size.y, size.z, 1)

        worldScale = 80 / maxDimension
        normalizedRadius = maxDimension * worldScale * 0.72
        partGroup.scale.setScalar(worldScale)
        partGroup.position.set(
          -center.x * worldScale,
          -center.y * worldScale,
          -center.z * worldScale,
        )
        axesGroup.scale.setScalar(Math.max(0.45, normalizedRadius / 40))

        callbacksRef.current.onDimensionsChange([
          roundMm(size.x),
          roundMm(size.y),
          roundMm(size.z),
        ])
        renderMarkers()
        frameCamera()
      }

      function renderMarkers() {
        markerGroup.clear()
        hoverGroup.clear()

        for (const point of callbacksRef.current.attachmentPoints) {
          const marker = new Mesh(
            attachmentGeometry,
            point.id === callbacksRef.current.selectedAttachmentId
              ? selectedMarkerMaterial
              : markerMaterial,
          )
          marker.position.copy(modelToWorld(point.positionMm))
          marker.userData = { attachmentId: point.id }
          markerGroup.add(marker)
        }

        if (hoveredFeature) {
          const marker = new Mesh(hoverGeometry, hoverMaterial)
          marker.position.copy(modelToWorld(hoveredFeature.centerMm))
          hoverGroup.add(marker)
        }
      }

      function modelToWorld(positionMm: Vec3) {
        return new Vector3(
          (positionMm[0] - modelCenter.x) * worldScale,
          (positionMm[1] - modelCenter.y) * worldScale,
          (positionMm[2] - modelCenter.z) * worldScale,
        )
      }

      function updatePointer(event: PointerEvent) {
        const rect = renderer.domElement.getBoundingClientRect()
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      }

      function updateHover(event: PointerEvent) {
        updatePointer(event)
        raycaster.setFromCamera(pointer, camera)
        raycaster.params.Line.threshold = Math.max(0.9, worldScale * 0.75)

        const edgeHit = raycaster.intersectObjects(edgeLines, true)[0]
        const meshHit =
          edgeHit ?? raycaster.intersectObjects(partMeshes, false)[0]

        hoveredFeature = meshHit
          ? findCircularFeatureAt(worldToModel(meshHit.point))
          : null
        mount.style.cursor = hoveredFeature ? 'crosshair' : 'default'
        renderMarkers()
      }

      function handlePointerMove(event: PointerEvent) {
        if (partMeshes.length === 0) return

        updateHover(event)
      }

      function handlePointerLeave() {
        hoveredFeature = null
        mount.style.cursor = 'default'
        renderMarkers()
      }

      function handlePointerDown(event: PointerEvent) {
        if (partMeshes.length === 0) return

        updateHover(event)

        const markerHit = raycaster.intersectObjects(markerGroup.children, false)[0]
        if (markerHit?.object.userData.attachmentId) {
          callbacksRef.current.onSelectAttachment(
            markerHit.object.userData.attachmentId as string,
          )
          return
        }

        if (hoveredFeature) {
          callbacksRef.current.onSelectCircularFeatureCenter(hoveredFeature)
        }
      }

      function worldToModel(position: InstanceType<typeof Vector3>): Vec3 {
        return [
          roundMm(position.x / worldScale + modelCenter.x),
          roundMm(position.y / worldScale + modelCenter.y),
          roundMm(position.z / worldScale + modelCenter.z),
        ]
      }

      function findCircularFeatureAt(positionMm: Vec3) {
        let bestFeature: CircularFeature | null = null
        let bestScore = Number.POSITIVE_INFINITY

        for (const feature of callbacksRef.current.circularFeatures) {
          const score = circularFeatureScore(positionMm, feature)
          const tolerance = Math.max(0.75, feature.radiusMm * 0.12)

          if (score < tolerance && score < bestScore) {
            bestFeature = feature
            bestScore = score
          }
        }

        return bestFeature
      }

      function frameCamera() {
        const radius = Math.max(normalizedRadius, 10)
        const direction = new Vector3(1.15, -1.2, 0.82).normalize()
        const verticalFov = (camera.fov * Math.PI) / 180
        const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect)
        const distance = (radius * 1.35) / Math.sin(Math.min(verticalFov, horizontalFov) / 2)

        controls.target.set(0, 0, 0)
        camera.near = Math.max(0.01, distance / 200)
        camera.far = distance * 50
        camera.position.copy(direction.multiplyScalar(distance))
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
        controls.update()
      }

      function createAxisLabel(text: string, color: string, position: Vec3) {
        const canvas = document.createElement('canvas')
        canvas.width = 96
        canvas.height = 96

        const context = canvas.getContext('2d')
        if (context) {
          context.fillStyle = 'rgba(16, 18, 20, 0.74)'
          context.beginPath()
          context.arc(48, 48, 31, 0, Math.PI * 2)
          context.fill()

          context.fillStyle = color
          context.font = '700 46px system-ui, sans-serif'
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(text, 48, 49)
        }

        const texture = new CanvasTexture(canvas)
        const material = new SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false,
        })
        const sprite = new Sprite(material)
        sprite.position.set(...position)
        sprite.scale.set(9, 9, 1)
        return sprite
      }

      function resize() {
        const { width, height } = mount.getBoundingClientRect()
        camera.aspect = width / Math.max(height, 1)
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        frameCamera()
      }

      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(mount)
      renderer.domElement.addEventListener('pointermove', handlePointerMove)
      renderer.domElement.addEventListener('pointerleave', handlePointerLeave)
      renderer.domElement.addEventListener('pointerdown', handlePointerDown)
      resize()

      let frameId = 0
      function animate() {
        renderMarkers()
        controls.update()
        renderer.render(scene, camera)
        frameId = requestAnimationFrame(animate)
      }
      animate()

      cleanup = () => {
        cancelAnimationFrame(frameId)
        resizeObserver.disconnect()
        renderer.domElement.removeEventListener('pointermove', handlePointerMove)
        renderer.domElement.removeEventListener('pointerleave', handlePointerLeave)
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
        controls.dispose()
        attachmentGeometry.dispose()
        hoverGeometry.dispose()
        markerMaterial.dispose()
        selectedMarkerMaterial.dispose()
        hoverMaterial.dispose()
        edgeMaterial.dispose()
        axes.geometry.dispose()
        if (Array.isArray(axes.material)) {
          axes.material.forEach((material) => material.dispose())
        } else {
          axes.material.dispose()
        }
        axesGroup.traverse((object) => {
          if (!(object instanceof Sprite)) return
          object.material.map?.dispose()
          object.material.dispose()
        })
        edgeLines.forEach((edge) => edge.geometry.dispose())
        for (const mesh of partMeshes) {
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

    void setup()

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [modelFormat, modelUrl])

  if (!model) {
    return (
      <div className="empty-viewer">
        <p>Select an Adafruit STEP/STL or upload a local CAD file to start labeling.</p>
      </div>
    )
  }

  return <div className="cad-viewport" ref={hostRef} />
}

function roundMm(value: number) {
  return Math.round(value * 1000) / 1000
}

function circularFeatureScore(positionMm: Vec3, feature: CircularFeature) {
  const delta: Vec3 = [
    positionMm[0] - feature.centerMm[0],
    positionMm[1] - feature.centerMm[1],
    positionMm[2] - feature.centerMm[2],
  ]
  const normal = normalize(feature.normal)
  const axialDistance = Math.abs(dot(delta, normal))
  const radialDistance = Math.sqrt(
    Math.max(0, dot(delta, delta) - axialDistance * axialDistance),
  )
  const radiusError = Math.abs(radialDistance - feature.radiusMm)

  if (feature.kind === 'cylindrical-surface') {
    return radiusError
  }

  return Math.hypot(radiusError, axialDistance)
}

function normalize(vector: Vec3): Vec3 {
  const length = Math.hypot(vector[0], vector[1], vector[2])
  if (length === 0) return [0, 0, 1]

  return [vector[0] / length, vector[1] / length, vector[2] / length]
}

function dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
