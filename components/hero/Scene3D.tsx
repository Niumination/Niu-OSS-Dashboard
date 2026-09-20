'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

/*
 * ============================================================================
 *  Scene3D — "tech core" + network node graph (Three.js / @react-three/fiber)
 * ----------------------------------------------------------------------------
 *  - Icosahedron wireframe ganda (cyan luar, ember dalam) + intan glow aditif.
 *  - 56 node konstelasi (fibonacci sphere) dengan garis radial + ring.
 *  - 350 partikel ambient aditif.
 *  - Parallax mengikuti kursor (lerp halus).
 *  - FPS MONITOR internal: rata-rata FPS diukur tiap detik; jika <45 fps
 *    selama 2 detik (setelah 3 detik warm-up), `onDegrade()` dipanggil dan
 *    Hero3D mengganti scene ini dengan fallback CSS/canvas ringan (60 fps).
 * ============================================================================
 */

interface SceneProps {
  onFps: (fps: number) => void;
  onDegrade: () => void;
}

/** Deterministic pseudo-random 0..1 dari integer. */
function rand(i: number): number {
  let x = (i + 1) * 2654435761;
  x = (x ^ (x >>> 13)) * 1274126177;
  x = x ^ (x >>> 16);
  return (x >>> 0) / 4294967296;
}

function fibonacciSphere(n: number, radius: number, jitter: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = ga * i;
    const rr = radius + (rand(i) - 0.5) * jitter;
    pts.push([Math.cos(th) * r * rr, y * rr, Math.sin(th) * r * rr]);
  }
  return pts;
}

const NODE_COUNT = 56;
const PARTICLE_COUNT = 350;

function Core() {
  const inner = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (inner.current) {
      inner.current.rotation.y += delta * 0.22;
      inner.current.rotation.x += delta * 0.07;
    }
    if (outer.current) {
      outer.current.rotation.y -= delta * 0.13;
      outer.current.rotation.z += delta * 0.05;
    }
  });
  return (
    <group>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.45, 1]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh ref={outer} scale={1.04}>
        <icosahedronGeometry args={[1.45, 0]} />
        <meshBasicMaterial color="#e05a1e" wireframe transparent opacity={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.92, 32, 32]} />
        <meshBasicMaterial color="#e05a1e" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={1.7}>
        <sphereGeometry args={[0.92, 32, 32]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Network() {
  const group = useRef<THREE.Group>(null);
  const { nodePos, nodeColors, edgePos, hubPositions, hubColors } = useMemo(() => {
    const pts = fibonacciSphere(NODE_COUNT, 2.55, 1.15);
    const colors = new Float32Array(NODE_COUNT * 3);
    const cyan = new THREE.Color('#00e5ff');
    const ember = new THREE.Color('#e05a1e');
    pts.forEach((p, i) => {
      const c = i % 4 === 0 ? ember : cyan;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    });
    // garis radial (node -> inti) + ring konstelasi (node -> node berikutnya)
    const edges: number[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      edges.push(...pts[i], 0, 0, 0);
      const next = pts[(i + 1) % NODE_COUNT];
      if (rand(i * 7) > 0.35) edges.push(...pts[i], ...next);
    }
    const edgeArr = new Float32Array(edges);
    const hubIdx = [0, 5, 11, 19, 27, 34, 41, 50];
    const hubPositions: [number, number, number][] = hubIdx.map((i) => pts[i]);
    const hubColors = hubIdx.map((i) => (i % 4 === 0 ? '#e05a1e' : '#00e5ff'));
    return { nodePos: new Float32Array(pts.flat()), nodeColors: colors, edgePos: edgeArr, hubPositions, hubColors };
  }, []);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePos, 3]} />
          <bufferAttribute attach="attributes-color" args={[nodeColors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.085} vertexColors transparent opacity={0.95} sizeAttenuation depthWrite={false} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePos, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#67e8f9" transparent opacity={0.14} depthWrite={false} />
      </lineSegments>
      {hubPositions.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color={hubColors[i]} transparent opacity={0.95} depthWrite={false} />
          </mesh>
          <mesh scale={3.2}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color={hubColors[i]} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Particles() {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 3.4 + rand(i * 13) * 1.9;
      const th = rand(i * 31) * Math.PI * 2;
      const ph = Math.acos(2 * rand(i * 53) - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.cos(ph);
      arr[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    return arr;
  }, []);
  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y -= delta * 0.012;
      group.current.rotation.x += delta * 0.004;
    }
  });
  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#67e8f9" size={0.035} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
}

/** Parallax kursor + penghitung FPS (degrade otomatis bila perangkat lemah). */
function Rig({ children, onFps, onDegrade }: SceneProps & { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const acc = useRef({ frames: 0, t: 0, warm: 0, low: 0, done: false });
  const cbs = useRef({ onFps, onDegrade });
  cbs.current = { onFps, onDegrade };

  useFrame((state, delta) => {
    const g = ref.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, state.pointer.x * 0.5, 0.045);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.35, 0.045);
    }
    const a = acc.current;
    if (a.t === 0) a.t = performance.now();
    a.frames += 1;
    const now = performance.now();
    if (now - a.t >= 1000) {
      const fps = (a.frames * 1000) / (now - a.t);
      a.frames = 0;
      a.t = now;
      a.warm += 1;
      cbs.current.onFps(Math.round(fps));
      if (a.warm >= 3 && !a.done) {
        if (fps < 45) a.low += 1;
        else a.low = 0;
        if (a.low >= 2) {
          a.done = true;
          cbs.current.onDegrade();
        }
      }
    }
  });

  return <group ref={ref}>{children}</group>;
}

/** Dipakai saat Canvas tidak bisa membuat konteks WebGL: picu degrade ke lite. */
function GlFallback({ onDegrade }: { onDegrade: () => void }) {
  useEffect(() => {
    onDegrade();
  }, [onDegrade]);
  return null;
}

export default function Scene3D(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="!absolute inset-0"
      aria-hidden
      fallback={<GlFallback onDegrade={props.onDegrade} />}
      onCreated={({ gl }) => {
        // WebGL context loss (driver reset / tab background lama / GPU lemah):
        // cegah default browser + degrade ke SceneLite — bukan layar mati.
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          props.onDegrade();
        });
      }}
    >
      <Rig onFps={props.onFps} onDegrade={props.onDegrade}>
        <Float speed={1.3} rotationIntensity={0.45} floatIntensity={0.65}>
          <Core />
          <Network />
        </Float>
      </Rig>
      <Particles />
    </Canvas>
  );
}
