// components/PDBViewer.tsx
import React, { useEffect, useRef } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

const PDBViewer: React.FC<{ pdbUrl: string }> = ({ pdbUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create the Babylon.js engine and scene
    const engine = new Engine(canvasRef.current, true);
    engineRef.current = engine;
    const scene = new Scene(engine);
    sceneRef.current = scene;

    // Create a basic camera
    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 20, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvasRef.current, true);

    // Create a basic light
    new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

    // Load the PDB file
    SceneLoader.ImportMesh("", pdbUrl, "", scene, (meshes) => {
      meshes.forEach((mesh) => {
        if (mesh.material) {
          const material = mesh.material as StandardMaterial;
          material.emissiveColor = new Color3(1, 1, 1); // Set emissive color to white
        }
      });
      scene.createDefaultEnvironment();
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
  }, [pdbUrl]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default PDBViewer;
