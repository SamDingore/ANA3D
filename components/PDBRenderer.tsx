// components/PDBRenderer.tsx
import React, { useEffect, useRef } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { parsePDB } from '../utils/pdbParser';

interface PDBRendererProps {
  pdbData: string;
}

const PDBRenderer: React.FC<PDBRendererProps> = ({ pdbData }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const atoms = parsePDB(pdbData);

    // Create the Babylon.js engine and scene
    const engine = new Engine(canvasRef.current, true);
    engineRef.current = engine;
    const scene = new Scene(engine);
    sceneRef.current = scene;

    // Create a basic camera
    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 50, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvasRef.current, true);

    // Create a basic light
    new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

    // Create a material for atoms
    const atomMaterial = new StandardMaterial("atomMaterial", scene);
    atomMaterial.diffuseColor = new Color3(0, 1, 0); // Green color for atoms

    // Create spheres for each atom
    atoms.forEach(atom => {
      const sphere = MeshBuilder.CreateSphere("atom", { diameter: 1 }, scene);
      sphere.position = new Vector3(atom.x, atom.y, atom.z);
      sphere.material = atomMaterial;
    });

    // Run the render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Resize the engine on window resize
    const resize = () => {
      engine.resize();
    };

    window.addEventListener('resize', resize);

    // Cleanup on component unmount
    return () => {
      engine.stopRenderLoop();
      window.removeEventListener('resize', resize);
      engine.dispose();
      scene.dispose();
    };
  }, [pdbData]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default PDBRenderer;
