// components/MoleculeViewer.tsx
import React, { useEffect, useRef } from 'react';
import { Engine, Scene } from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { parsePDB, Atom } from '../utils/pdbParser';

interface MoleculeViewerProps {
  pdbData: string;
}

const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ pdbData }) => {
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
    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 100, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvasRef.current, true);

    // Create a basic light
    new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

    // Create materials for backbone and nucleotides
    const backboneMaterial = new StandardMaterial("backboneMaterial", scene);
    backboneMaterial.diffuseColor = new Color3(0, 0, 1); // Blue color for backbone

    const nucleotideMaterial = new StandardMaterial("nucleotideMaterial", scene);
    nucleotideMaterial.diffuseColor = new Color3(1, 0, 0); // Red color for nucleotides

    // Filter atoms to create backbone and nucleotide representations
    const backboneAtoms = atoms.filter(atom => atom.name === "CA");
    const nucleotideAtoms = atoms.filter(atom => ["A", "T", "C", "G"].includes(atom.resName));

    // Create backbone representation as a continuous tube
    if (backboneAtoms.length > 1) {
      const backbonePath = backboneAtoms.map(atom => new Vector3(atom.x, atom.y, atom.z));
      const tube = MeshBuilder.CreateTube("backbone", { path: backbonePath, radius: 0.2 }, scene);
      tube.material = backboneMaterial;
    }

    // Create nucleotide representation as connected spheres
    const nucleotidePath: Vector3[] = [];
    nucleotideAtoms.forEach(atom => {
      nucleotidePath.push(new Vector3(atom.x, atom.y, atom.z));
      const sphere = MeshBuilder.CreateSphere("nucleotide", { diameter: 1 }, scene);
      sphere.position = new Vector3(atom.x, atom.y, atom.z);
      sphere.material = nucleotideMaterial;
    });

    // Create lines connecting nucleotides
    if (nucleotidePath.length > 1) {
      const lines = MeshBuilder.CreateLines("nucleotideLines", { points: nucleotidePath }, scene);
      lines.color = new Color3(1, 0, 0); // Red color for connecting lines
    }

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

export default MoleculeViewer;
