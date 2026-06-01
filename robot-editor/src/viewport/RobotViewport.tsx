import { useEffect, useRef } from 'react'
import {
  AmbientLight,
  AxesHelper,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useEditorStore } from '../store/editorStore'
import { replaceBodyMeshes } from './sceneObjects'

Object3D.DEFAULT_UP.set(0, 0, 1)

export function RobotViewport() {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const bodyGroupRef = useRef<Group | null>(null)
  const bodies = useEditorStore((state) => state.robot.bodies)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const scene = new Scene()
    scene.background = new Color('#eef1f4')

    const camera = new PerspectiveCamera(50, 1, 0.01, 1000)
    camera.up.set(0, 0, 1)
    camera.position.set(6, -8, 5)
    camera.lookAt(0, 0, 0)

    const renderer = new WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    host.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)
    controls.enableDamping = true

    const grid = new GridHelper(10, 20, '#3a404a', '#252a33')
    grid.rotation.x = Math.PI / 2 // Three grid is x-z by default; make it x-y.
    scene.add(grid)

    scene.add(new AxesHelper(1.5))

    const bodyGroup = new Group()
    scene.add(bodyGroup)
    sceneRef.current = scene
    bodyGroupRef.current = bodyGroup

    const ambient = new AmbientLight('#ffffff', 0.55)
    scene.add(ambient)

    const keyLight = new DirectionalLight('#ffffff', 1.2)
    keyLight.position.set(4, -6, 8)
    scene.add(keyLight)

    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()

    let frameId = 0

    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      sceneRef.current = null
      bodyGroupRef.current = null
    }
  }, [])

  useEffect(() => {
    const bodyGroup = bodyGroupRef.current
    if (!bodyGroup) return

    replaceBodyMeshes(bodyGroup, Object.values(bodies))
  }, [bodies])

  return <div className="robot-viewport" ref={hostRef} />
}
