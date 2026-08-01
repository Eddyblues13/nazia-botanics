import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  Float,
  Environment,
  Lightformer,
  ContactShadows,
  MeshTransmissionMaterial,
} from '@react-three/drei'
import * as THREE from 'three'
import labelUrl from '@/assets/label.png'

/* A stylised amber dropper bottle built from primitives. */
function Bottle({ shadows }) {
  const group = useRef()
  const loaded = useLoader(THREE.TextureLoader, labelUrl)
  // clone so colour-space/anisotropy tweaks don't mutate the cached loader result
  const labelTex = useMemo(() => {
    const tex = loaded.clone()
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
  }, [loaded])

  // Gentle mouse-driven parallax tilt + idle sway.
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime()
    const targetY = state.pointer.x * 0.5 + Math.sin(t * 0.3) * 0.15
    const targetX = -state.pointer.y * 0.25
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.05
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05
  })

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      {/* Glass body */}
      <mesh castShadow={shadows} position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 2, 64, 1, false]} />
        <MeshTransmissionMaterial
          thickness={1.2}
          roughness={0.06}
          transmission={1}
          ior={1.4}
          chromaticAberration={0.02}
          backside={shadows}
          color="#b06a24"
          attenuationColor="#6e3a0d"
          attenuationDistance={1.6}
        />
      </mesh>

      {/* Amber oil inside */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.78, 0.78, 1.25, 48]} />
        <meshStandardMaterial
          color="#5a2c07"
          roughness={0.25}
          metalness={0.1}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Shoulder */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.32, 0.85, 0.45, 64]} />
        <MeshTransmissionMaterial
          thickness={0.8}
          roughness={0.08}
          transmission={1}
          ior={1.4}
          color="#b06a24"
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.28, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 48]} />
        <MeshTransmissionMaterial thickness={0.6} roughness={0.1} transmission={1} ior={1.4} color="#b06a24" />
      </mesh>

      {/* Dropper cap — deep teal like the product photo */}
      <mesh castShadow={shadows} position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.45, 48]} />
        <meshStandardMaterial color="#122a28" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#0b1c1a" roughness={0.4} />
      </mesh>

      {/* Wrapped front label with the Nazia Botanics logo */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.87, 0.87, 1.3, 64, 1, true, -0.8, 1.6]} />
        <meshStandardMaterial map={labelTex} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* Soft floating botanical petals around the bottle. */
function Petals({ count = 7, palette }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        const r = 2 + (i % 3) * 0.35
        return {
          pos: [Math.cos(a) * r, Math.sin(a * 1.6) * 0.8, Math.sin(a) * r - 1.1],
          scale: 0.15 + (i % 4) * 0.04,
          speed: 1 + (i % 3) * 0.4,
          rotation: [a, a * 1.7, a * 0.6],
        }
      }),
    [count],
  )

  return items.map((p, i) => (
    <Float key={i} speed={p.speed} rotationIntensity={1.4} floatIntensity={1.6}>
      <mesh position={p.pos} scale={p.scale} rotation={p.rotation}>
        <sphereGeometry args={[1, 16, 16]} />
        {/* colour is tweened per variant rather than remounting the mesh */}
        <PetalMaterial color={palette[i % palette.length]} />
      </mesh>
    </Float>
  ))
}

function PetalMaterial({ color }) {
  const ref = useRef()
  const target = useMemo(() => new THREE.Color(color), [color])
  useFrame((_, dt) => {
    if (ref.current) ref.current.color.lerp(target, Math.min(1, dt * 3))
  })
  return <meshStandardMaterial ref={ref} roughness={0.7} flatShading />
}

function Rig({ shadows }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 4]} intensity={1.6} castShadow={shadows} />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#bfbfbf" />

      {/* Procedural studio environment — no external HDR file needed. */}
      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 4, 2]} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer intensity={1.1} position={[-4, 1, 1]} scale={[3, 4, 1]} color="#e8e8e8" />
        <Lightformer intensity={0.9} position={[4, -1, 2]} scale={[3, 4, 1]} color="#d0d0d0" />
        <Lightformer intensity={1.4} position={[0, -3, -3]} scale={[10, 4, 1]} color="#9a9a9a" />
      </Environment>
    </>
  )
}

const _pos = new THREE.Vector3()
const _aim = new THREE.Vector3()

/* Glide the camera between variants instead of remounting a canvas per slide. */
function CameraRig({ camY, zoom, aimY }) {
  const camera = useThree((s) => s.camera)
  const look = useRef(new THREE.Vector3(0, aimY, 0))

  useFrame((_, dt) => {
    // frame-rate independent smoothing
    const k = 1 - Math.pow(0.0015, Math.min(dt, 0.1))
    camera.position.lerp(_pos.set(0, camY, zoom), k)
    look.current.lerp(_aim.set(0, aimY, 0), k)
    camera.lookAt(look.current)
  })

  return null
}

/* Report context loss upward so the slider can fall back to the poster. */
function ContextGuard({ onLost, onRestored }) {
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const canvas = gl.domElement
    const handleLost = (e) => {
      // preventDefault tells the browser we want a restore attempt
      e.preventDefault()
      onLost?.()
    }
    const handleRestored = () => onRestored?.()
    canvas.addEventListener('webglcontextlost', handleLost)
    canvas.addEventListener('webglcontextrestored', handleRestored)
    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost)
      canvas.removeEventListener('webglcontextrestored', handleRestored)
    }
  }, [gl, onLost, onRestored])

  return null
}

export default function BottleScene({
  camY = 0.4,
  zoom = 6,
  petals = ['#9c4f56', '#95a075'],
  aimY = -0.1,
  lite = false,
  paused = false,
  onReady,
  onLost,
  onRestored,
}) {
  const shadows = !lite

  return (
    <Canvas
      shadows={shadows}
      dpr={lite ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, camY, zoom], fov: 32 }}
      gl={{ antialias: !lite, alpha: true, powerPreference: 'low-power' }}
      frameloop={paused ? 'never' : 'always'}
      style={{ width: '100%', height: '100%' }}
      onCreated={() => onReady?.()}
    >
      <ContextGuard onLost={onLost} onRestored={onRestored} />
      <Suspense fallback={null}>
        <CameraRig camY={camY} zoom={zoom} aimY={aimY} />
        <Rig shadows={shadows} />
        <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.8}>
          <Bottle shadows={shadows} />
        </Float>
        <Petals palette={petals} />
        <ContactShadows
          position={[0, -2.2, 0]}
          opacity={0.4}
          scale={9}
          blur={2.6}
          far={3}
          color="#000000"
        />
      </Suspense>
    </Canvas>
  )
}
