import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float,
  Environment,
  Lightformer,
  ContactShadows,
  MeshTransmissionMaterial,
} from '@react-three/drei'
import * as THREE from 'three'

/* A stylised amber dropper bottle built from primitives. */
function Bottle() {
  const group = useRef()

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
      <mesh castShadow position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 2, 64, 1, false]} />
        <MeshTransmissionMaterial
          thickness={1.2}
          roughness={0.06}
          transmission={1}
          ior={1.4}
          chromaticAberration={0.02}
          backside
          color="#f2f2f2"
          attenuationColor="#cfcfcf"
          attenuationDistance={2.4}
        />
      </mesh>

      {/* Dark oil inside */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.78, 0.78, 1.25, 48]} />
        <meshStandardMaterial
          color="#161616"
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
          color="#f2f2f2"
          backside
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.28, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 48]} />
        <MeshTransmissionMaterial thickness={0.6} roughness={0.1} transmission={1} ior={1.4} color="#f2f2f2" />
      </mesh>

      {/* Dropper cap */}
      <mesh castShadow position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.45, 48]} />
        <meshStandardMaterial color="#161616" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#000000" roughness={0.4} />
      </mesh>

      {/* Front label */}
      <mesh position={[0, -0.2, 0.86]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.1, 1.25, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* Soft floating botanical petals around the bottle. */
function Petals({ count = 7 }) {
  const items = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2
    const r = 2 + (i % 3) * 0.35
    return {
      pos: [Math.cos(a) * r, (Math.sin(a * 1.6) * 0.8), Math.sin(a) * r - 0.5],
      scale: 0.18 + (i % 4) * 0.05,
      speed: 1 + (i % 3) * 0.4,
      color: i % 2 ? '#2e2e2e' : '#a0a0a0',
    }
  })

  return items.map((p, i) => (
    <Float key={i} speed={p.speed} rotationIntensity={1.4} floatIntensity={1.6}>
      <mesh position={p.pos} scale={p.scale} rotation={[Math.random(), Math.random(), Math.random()]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={p.color} roughness={0.7} flatShading />
      </mesh>
    </Float>
  ))
}

function Rig() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 4]} intensity={1.6} castShadow />
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

export default function BottleScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 6], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Rig />
        <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.8}>
          <Bottle />
        </Float>
        <Petals />
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
