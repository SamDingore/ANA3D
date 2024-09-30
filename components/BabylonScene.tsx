import { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, Color3, StandardMaterial, Quaternion } from '@babylonjs/core';
import { parseCIF } from '../utils/parseCIF';

interface BabylonSceneProps {
  cifData: string;
}

const createBond = (start: Vector3, end: Vector3, scene: Scene) => {
  const distance = Vector3.Distance(start, end);
  const midPoint = Vector3.Center(start, end);

  const bond = MeshBuilder.CreateCylinder('bond', { diameter: 0.1, height: distance }, scene);
  bond.position = midPoint;

  const direction = end.subtract(start).normalize();
  const up = new Vector3(0, 1, 0);
  const rotationAxis = Vector3.Cross(up, direction);
  const rotationAngle = Math.acos(Vector3.Dot(up, direction));
  bond.rotationQuaternion = Quaternion.RotationAxis(rotationAxis, rotationAngle);

  return bond;
};

const BabylonScene: React.FC<BabylonSceneProps> = ({ cifData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 50, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
    light.intensity = 0.7;

    const { atom_positions, atom_names } = parseCIF(cifData);

    const atomMeshes: MeshBuilder.CreateSphere[] = atom_positions.map((position, index) => {
      const sphere = MeshBuilder.CreateSphere(`atom_${index}`, { diameter: 0.5 }, scene);
      sphere.position = new Vector3(position[0], position[1], position[2]);
      const material = new StandardMaterial(`mat_${index}`, scene);
      material.diffuseColor = new Color3(Math.random(), Math.random(), Math.random());
      sphere.material = material;
      return sphere;
    });

    for (let i = 0; i < atomMeshes.length; i++) {
      for (let j = i + 1; j < atomMeshes.length; j++) {
        const distance = Vector3.Distance(atomMeshes[i].position, atomMeshes[j].position);
        if (distance < 1.6) { // Approximate bond length
          createBond(atomMeshes[i].position, atomMeshes[j].position, scene);
        }
      }
    }

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      engine.dispose();
    };
  }, [cifData]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default BabylonScene;
