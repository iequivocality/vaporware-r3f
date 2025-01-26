import { createLazyFileRoute } from "@tanstack/react-router";

import {
	Canvas,
	extend,
	useFrame,
	useLoader,
	useThree,
} from "@react-three/fiber";

import { Effects, OrbitControls } from "@react-three/drei";
import { type Mesh, TextureLoader, SpotLight } from "three";
import { useMemo, useRef } from "react";
import {
	GammaCorrectionShader,
	RenderPass,
	RGBShiftShader,
	ShaderPass,
} from "three-stdlib";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

extend({ RenderPass, ShaderPass });

function Vaporwave() {
	const vaporPlane = useRef<Mesh>(null!);
	const otherVaporPlane = useRef<Mesh>(null!);
	const gridTexture = useLoader(TextureLoader, "/grid.png");
	const gridTerrainTexture = useLoader(TextureLoader, "/grid-terrain.png");
	const metalnessTexture = useLoader(TextureLoader, "/metalness.png");

	useFrame(({ clock }) => {
		const elapsedTime = clock.getElapsedTime();
		vaporPlane.current!.position.z = elapsedTime * 0.15;

		vaporPlane.current!.position.z = (elapsedTime * 0.15) % 2;
		otherVaporPlane.current!.position.z = ((elapsedTime * 0.15) % 2) - 2;
	});

	return (
		<>
			<ambientLight intensity={10} />
			<mesh
				ref={vaporPlane}
				rotation={[-Math.PI * 0.5, 0, 0]}
				position={[0, 0, 2]}
			>
				<planeGeometry args={[1, 2, 24, 24]} />
				<meshStandardMaterial
					map={gridTexture}
					displacementMap={gridTerrainTexture}
					displacementScale={0.4}
					metalnessMap={metalnessTexture}
					metalness={0.96}
					roughness={0.5}
				/>
			</mesh>
			<mesh
				ref={otherVaporPlane}
				rotation={[-Math.PI * 0.5, 0, 0]}
				position={[0, 0, 2]}
			>
				<planeGeometry args={[1, 2, 24, 24]} />
				<meshStandardMaterial
					map={gridTexture}
					displacementMap={gridTerrainTexture}
					displacementScale={0.4}
					metalnessMap={metalnessTexture}
					metalness={0.96}
					roughness={0.5}
				/>
			</mesh>
		</>
	);
}

function VaporwaveEffects() {
	const scene = useThree((state) => state.scene);
	const camera = useThree((state) => state.camera);

	return (
		<Effects>
			<renderPass args={[scene, camera]} />
			<shaderPass args={[RGBShiftShader]} />
			<shaderPass args={[GammaCorrectionShader]} />
		</Effects>
	);
}

function SpotLightLeft() {
	const spotlight = useMemo(
		() => new SpotLight(0xd53c3d, 20, 25, Math.PI * 0.1, 0.25),
		[],
	);

	return (
		<group>
			<primitive
				object={spotlight}
				intensity={100.0}
				distance={10.0}
				angle={Math.PI / 3}
				penumbra={1}
				position={[-0.5, 0.75, 2.2]}
			/>
			<primitive object={spotlight.target} position={[0.25, 0.25, 0.25]} />
		</group>
	);
}

function SpotLightRight() {
	const spotlight = useMemo(
		() => new SpotLight(0xd53c3d, 20, 25, Math.PI * 0.1, 0.25),
		[],
	);

	return (
		<group>
			<primitive
				object={spotlight}
				intensity={100.0}
				distance={10.0}
				angle={Math.PI / 3}
				penumbra={1}
				position={[0.5, 0.75, 2.2]}
			/>
			<primitive object={spotlight.target} position={[-0.25, 0.25, -0.25]} />
		</group>
	);
}

function Index() {
	return (
		<Canvas
			camera={{ fov: 75, near: 0.1, far: 15, position: [0, 0.1, 1.1] }}
			dpr={Math.min(window.devicePixelRatio, 2)}
		>
			<Vaporwave />
			<SpotLightLeft />
			<SpotLightRight />
			<fog attach="fog" args={[0x000000, 1, 2.5]} />
			<OrbitControls enableDamping />
			<VaporwaveEffects />
		</Canvas>
	);
}
