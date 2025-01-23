import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { Color, DoubleSide, Mesh, ShaderMaterial } from "three";

export const Route = createLazyFileRoute("/shaderfun")({
	component: About,
});

const fragmentShader = `
  varying vec2 vUv;

  uniform vec3 u_colorA;
  uniform vec3 u_colorB;

  void main() {
    vec2 normalizedPixel = gl_FragCoord.xy / 600.0;
    vec3 color = mix(u_colorA, u_colorB, normalizedPixel.y);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const vertexShader = `
  varying vec2 vUv;

  uniform float u_time;

  void main() {
    vUv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);    
    modelPosition.y += sin(modelPosition.x * 4.0 + u_time * 2.0) * 0.2;
    modelPosition.z += sin(modelPosition.y * 4.0 + u_time * 2.0) * 0.2;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
  }
`;

function MovingPlane() {
	const mesh = useRef<Mesh>(null!);
	const uniforms = useMemo(
		() => ({
			u_time: {
				value: 0.0,
			},
			u_colorA: { value: new Color("#ff0000") },
			u_colorB: { value: new Color("#00ff00") },
		}),
		[],
	);

	useFrame((state) => {
		const { clock } = state;
		const material = mesh.current.material as ShaderMaterial;
		material.uniforms.u_time.value = clock.getElapsedTime();
	});

	return (
		<mesh ref={mesh} position={[0, 0, 0]} rotation={[-Math.PI * 0.5, 0, 0]} scale={1.5}>
			<planeGeometry args={[1, 1, 32, 32]} />
			<shaderMaterial
				fragmentShader={fragmentShader}
				vertexShader={vertexShader}
				uniforms={uniforms}
				side={DoubleSide}
        wireframe
			/>
		</mesh>
	);
}

function About() {
	return (
		<Canvas camera={{ position: [1.0, 1.5, 1.0] }}>
			<MovingPlane />
      <axesHelper />
			<OrbitControls />
		</Canvas>
	);
}
