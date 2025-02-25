import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import {
	Quaternion,
	type Mesh,
	Vector3,
	type Points,
	MathUtils,
	type ShaderMaterial,
  AdditiveBlending,
} from "three";

// https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

export const Route = createLazyFileRoute("/particle-basic")({
	component: ParticleBasic,
});

const TwistedBox = () => {
	// This reference gives us direct access to the mesh
	const mesh = useRef<Mesh>(null!);
	const quaternion = useMemo(() => new Quaternion(), []);

	useEffect(() => {
		// Get the current attributes of the geometry
		const currentPositions = mesh.current.geometry.attributes.position;
		// Copy the attributes
		const originalPositions = currentPositions.clone();
		const originalPositionsArray = originalPositions?.array || [];

		// Go through each vector (series of 3 values) and modify the values
		for (let i = 0; i < originalPositionsArray.length; i = i + 3) {
			const modifiedPositionVector = new Vector3(
				originalPositionsArray[i],
				originalPositionsArray[i + 1],
				originalPositionsArray[i + 2],
			);
			const upVector = new Vector3(0, 1, 0);

			// Rotate along the y axis (0, 1, 0)
			quaternion.setFromAxisAngle(
				upVector,
				(Math.PI / 180) * (modifiedPositionVector.y + 10) * 100, // the higher along the y axis the vertex is, the more we rotate
			);
			modifiedPositionVector.applyQuaternion(quaternion);

			// Apply the modified position vector coordinates to the current position attributes array
			currentPositions.array[i] = modifiedPositionVector.x;
			currentPositions.array[i + 1] = modifiedPositionVector.y;
			currentPositions.array[i + 2] = modifiedPositionVector.z;
		}
		// Set the needsUpdate flag to "true"
		currentPositions.needsUpdate = true;
	}, [quaternion]);

	return (
		<mesh ref={mesh} position={[0, 0, 0]}>
			<boxGeometry args={[0.5, 0.5, 0.5, 10, 10, 10]} />
			<meshLambertMaterial color="hotpink" emissive="hotpink" />
		</mesh>
	);
};

const BasicParticles = () => {
	// This reference gives us direct access to our points
	const points = useRef<Points>(null!);

	// You can see that, like our mesh, points also takes a geometry and a material,
	// but a specific material => pointsMaterial
	return (
		<points ref={points}>
			<sphereGeometry args={[1, 48, 48]} />
			<pointsMaterial color="#5786F5" size={0.015} sizeAttenuation />
		</points>
	);
};

const CustomGeometryParticles = (props: {
	count: number;
	shape: "box" | "sphere";
}) => {
	const { count, shape } = props;

	// This reference gives us direct access to our points
	const points = useRef<Points>(null!);

	// Generate our positions attributes array
	const particlesPosition = useMemo(() => {
		const positions = new Float32Array(count * 3);

		if (shape === "box") {
			for (let i = 0; i < count; i++) {
				const x = (Math.random() - 0.5) * 2;
				const y = (Math.random() - 0.5) * 2;
				const z = (Math.random() - 0.5) * 2;

				positions.set([x, y, z], i * 3);
			}
		}

		if (shape === "sphere") {
			const distance = 1;

			for (let i = 0; i < count; i++) {
				const theta = MathUtils.randFloatSpread(360);
				const phi = MathUtils.randFloatSpread(360);

				const x = distance * Math.sin(theta) * Math.cos(phi);
				const y = distance * Math.sin(theta) * Math.sin(phi);
				const z = distance * Math.cos(theta);

				positions.set([x, y, z], i * 3);
			}
		}

		return positions;
	}, [count, shape]);

	useFrame((state) => {
		const { clock } = state;

		for (let i = 0; i < count; i++) {
			const i3 = i * 3;

			points.current.geometry.attributes.position.array[i3] +=
				Math.sin(clock.elapsedTime + Math.random() * 10) * 0.01;
			points.current.geometry.attributes.position.array[i3 + 1] +=
				Math.cos(clock.elapsedTime + Math.random() * 10) * 0.01;
			points.current.geometry.attributes.position.array[i3 + 2] +=
				Math.sin(clock.elapsedTime + Math.random() * 10) * 0.01;
		}

		points.current.geometry.attributes.position.needsUpdate = true;
	});

	return (
		<points ref={points}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={particlesPosition.length / 3}
					array={particlesPosition}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={0.015}
				color="#5786F5"
				sizeAttenuation
				depthWrite={false}
			/>
		</points>
	);
};

const CustomGeometryShaderParticles = (props: {
	count: number;
	shape: "box" | "sphere";
}) => {
	const { count, shape } = props;
	const points = useRef<Points>(null!);

	const particlesPosition = useMemo(() => {
		const positions = new Float32Array(count * 3);

		if (shape === "box") {
			for (let i = 0; i < count; i++) {
				const x = (Math.random() - 0.5) * 2;
				const y = (Math.random() - 0.5) * 2;
				const z = (Math.random() - 0.5) * 2;

				positions.set([x, y, z], i * 3);
			}
		}

		if (shape === "sphere") {
			const distance = 1;

			for (let i = 0; i < count; i++) {
				const theta = MathUtils.randFloatSpread(360);
				const phi = MathUtils.randFloatSpread(360);

				const x = distance * Math.sin(theta) * Math.cos(phi);
				const y = distance * Math.sin(theta) * Math.sin(phi);
				const z = distance * Math.cos(theta);

				positions.set([x, y, z], i * 3);
			}
		}

		return positions;
	}, [count, shape]);

	const uniforms = useMemo(
		() => ({
			uTime: {
				value: 0.0,
			},
			// Add any other attributes here
		}),
		[],
	);

	useFrame((state) => {
		const { clock } = state;

		(points.current.material as ShaderMaterial).uniforms.uTime.value =
			clock.elapsedTime;
	});

	return (
		<points ref={points}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={particlesPosition.length / 3}
					array={particlesPosition}
					itemSize={3}
				/>
			</bufferGeometry>
			<shaderMaterial
        blending={AdditiveBlending}
				depthWrite={false}
				fragmentShader={`
            varying float vDistance;

            void main() {
              vec3 color = vec3(0.34, 0.53, 0.96);
              float strength = distance(gl_PointCoord, vec2(0.5));
              strength = 1.0 - strength;
              strength = pow(strength, 3.0);

              color = mix(color, vec3(0.97, 0.70, 0.45), vDistance * 0.5);
              color = mix(vec3(0.0), color, strength);
              gl_FragColor = vec4(color, strength);
            }

          `}
				vertexShader={`
            uniform float uTime;
            uniform float uRadius;

            varying float vDistance;

            // Source: https://github.com/dmnsgn/glsl-rotate/blob/main/rotation-3d-y.glsl.js
            mat3 rotation3dY(float angle) {
              float s = sin(angle);
              float c = cos(angle);
              return mat3(
                c, 0.0, -s,
                0.0, 1.0, 0.0,
                s, 0.0, c
              );
            }


            void main() {
              float distanceFactor = pow(uRadius - distance(position, vec3(0.0)), 1.5);
              float size = distanceFactor * 10.0 + 10.0;
              vec3 particlePosition = position * rotation3dY(uTime * 0.3 * distanceFactor);

              vDistance = distanceFactor;

              vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
              vec4 viewPosition = viewMatrix * modelPosition;
              vec4 projectedPosition = projectionMatrix * viewPosition;

              gl_Position = projectedPosition;

              gl_PointSize = size;
              // Size attenuation;
              gl_PointSize *= (1.0 / - viewPosition.z);
            }

          `}
				uniforms={uniforms}
			/>
		</points>
	);
};

function ParticleBasic() {
	return (
		<Canvas
			camera={{ fov: 75, near: 0.1, far: 15, position: [0, 0.1, 0.8] }}
			dpr={Math.min(window.devicePixelRatio, 2)}
		>
			<ambientLight intensity={0.5} />
			{/* <directionalLight position={[-1, 2, 2]} intensity={4} /> */}
			{/* <TwistedBox /> */}
			{/* <BasicParticles /> */}
			<CustomGeometryShaderParticles count={2000} shape="sphere" />
			<OrbitControls autoRotate />
		</Canvas>
	);
}
