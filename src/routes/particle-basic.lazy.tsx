import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Quaternion, type Mesh, Vector3 } from "three";

// https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/

export const Route = createLazyFileRoute("/particle-basic")({
  component: ParticleBasic,
});

const TwistedBox = () => {
  // This reference gives us direct access to the mesh
  const mesh = useRef<Mesh>(null!);
  const quaternion = new Quaternion();

  useEffect(() => {
    // Get the current attributes of the geometry
    const currentPositions = mesh.current.geometry.attributes.position;
    // Copy the attributes
    const originalPositions = currentPositions.clone();
    const originalPositionsArray = originalPositions?.array || [];

    // Go through each vector (series of 3 values) and modify the values
    for (let i = 0; i < originalPositionsArray.length; i=i+3) {
      const modifiedPositionVector = new Vector3(originalPositionsArray[i], originalPositionsArray[i+1], originalPositionsArray[i+2]);
      const upVector = new Vector3(0, 1, 0);

      // Rotate along the y axis (0, 1, 0)
      quaternion.setFromAxisAngle(
        upVector, 
        (Math.PI / 180) * (modifiedPositionVector.y + 10) * 100 // the higher along the y axis the vertex is, the more we rotate
      );
      modifiedPositionVector.applyQuaternion(quaternion);

      // Apply the modified position vector coordinates to the current position attributes array
      currentPositions.array[i] = modifiedPositionVector.x 
      currentPositions.array[i+1] = modifiedPositionVector.y
      currentPositions.array[i+2] = modifiedPositionVector.z
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

function ParticleBasic() {
  return (
    <Canvas
      camera={{ fov: 75, near: 0.1, far: 15, position: [0, 0.1, 1.1] }}
      dpr={Math.min(window.devicePixelRatio, 2)}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[-1, 2, 2]} intensity={4} />
      <TwistedBox />
      <OrbitControls autoRotate />
    </Canvas>
  );
}