import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uInkColor;

varying vec2 vUv;

vec3 mod289v3(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289v2(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289v3(((x * 34.0) + 1.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

float warpedFbm(vec2 p, float t) {
  vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t * 0.04), fbm(p + vec2(5.2, 1.3) + t * 0.03));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.02), fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.05));
  return fbm(p + 3.5 * r);
}

float inkPool(vec2 uv, float t, float seed) {
  vec2 center = vec2(snoise(vec2(seed * 3.7, t * 0.07 + seed)) * 0.4, snoise(vec2(seed * 1.3 + 50.0, t * 0.09 + seed * 2.1)) * 0.4);
  vec2 p = uv - center;
  float angle = atan(p.y, p.x);
  float dist = length(p);
  float deform = snoise(vec2(angle * 3.0 + seed * 7.1, t * 0.15 + seed)) * 0.12 + snoise(vec2(angle * 7.0 - seed * 2.3, t * 0.2 - seed * 1.7)) * 0.06;
  float shape = smoothstep(0.25 + deform, 0.0, dist);
  float edgeNoise = snoise(vec2(angle * 4.0 + seed, t * 0.3)) * 0.5 + 0.5;
  shape *= 0.5 + edgeNoise * 0.5;
  float turbulence = snoise(vec2(p.x * 8.0 + t * 0.2, p.y * 8.0 + seed * 3.3)) * 0.08;
  shape += turbulence * smoothstep(0.4, 0.0, dist);
  return max(shape, 0.0);
}

float diffusion(vec2 uv, float t) {
  float n1 = snoise(uv * 6.0 + vec2(t * 0.3, t * 0.2));
  float n2 = snoise(uv * 12.0 - vec2(t * 0.4, t * 0.25));
  float n3 = snoise(uv * 3.0 + vec2(t * 0.15, -t * 0.35));
  return (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 0.15;
}

void main() {
  vec2 uv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float t = uTime;
  vec2 distortedUv = uv + vec2(snoise(uv * 2.0 + t * 0.1) * 0.08, snoise(uv * 2.0 + t * 0.13 + 100.0) * 0.08);
  float warped = warpedFbm(distortedUv * 2.5, t);
  float ink = 0.0;
  ink += smoothstep(0.35, 0.7, inkPool(distortedUv, t, 1.0)) * 0.6;
  ink += smoothstep(0.3, 0.65, inkPool(distortedUv, t * 0.8 + 20.0, 2.5)) * 0.45;
  ink += smoothstep(0.25, 0.6, inkPool(distortedUv, t * 1.2 + 40.0, 4.0)) * 0.3;
  ink += smoothstep(0.2, 0.5, inkPool(distortedUv, t * 0.6 + 60.0, 6.0)) * 0.2;
  ink += smoothstep(0.45, 0.8, warped) * 0.4;
  ink += diffusion(distortedUv, t);
  float fadeIn = smoothstep(0.0, 3.0, t);
  ink *= fadeIn;
  float grain = (fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.02;
  ink += grain;
  float bloom = smoothstep(0.3, 0.8, ink) * 0.08;
  gl_FragColor = vec4(uInkColor + vec3(bloom), clamp(ink + bloom, 0.0, 1.0));
}
`

function InkPlane() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { viewport, camera } = useThree()

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uInkColor: { value: new THREE.Vector3(0.172, 0.141, 0.125) },
      },
      transparent: true,
    })
  }, [])

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uResolution.value.set(viewport.width * 100, viewport.height * 100)
  })

  const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180)
  const aspect = viewport.width / viewport.height
  const planeHeight = 2 * Math.tan(fov / 2) * (camera as THREE.PerspectiveCamera).position.z
  const planeWidth = planeHeight * aspect

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} material={material}>
      <planeGeometry args={[planeWidth, planeHeight]} />
    </mesh>
  )
}

export default function InkWave() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#E8E1D6' }} />}>
        <Canvas
          gl={{ alpha: true, antialias: false }}
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%' }}
        >
          <InkPlane />
        </Canvas>
      </Suspense>
    </div>
  )
}
