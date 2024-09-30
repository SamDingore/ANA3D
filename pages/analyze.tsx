import React, { useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

const Home: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedParent = useRef<BABYLON.TransformNode | null>(null); // Store selected parent node

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 30, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    engine.runRenderLoop(() => {
      scene.render();
    });

    async function loadPDB(pdbId: string) {
      const pdbUrl = `https://files.rcsb.org/download/${pdbId}.pdb`;
      const response = await fetch(pdbUrl);
      if (!response.ok) {
        console.error(`Failed to fetch PDB file for ID: ${pdbId}`);
        return [];
      }
      const data = await response.text();
      return parsePDB(data);
    }

    function parsePDB(pdbData: string) {
      const lines = pdbData.split('\n');
      const backboneCoords: BABYLON.Vector3[] = [];

      for (const line of lines) {
        if (line.startsWith("ATOM") || line.startsWith("HETATM")) {
          const atomName = line.slice(12, 16).trim(); // Atom name
          const x = parseFloat(line.slice(30, 38)); // X coordinate
          const y = parseFloat(line.slice(38, 46)); // Y coordinate
          const z = parseFloat(line.slice(46, 54)); // Z coordinate

          if (atomName === "C4'") { // C4' atom of the RNA backbone
            backboneCoords.push(new BABYLON.Vector3(x, y, z));
          }
        }
      }

      console.log(`Parsed ${backboneCoords.length} C4' atoms from PDB.`);
      return backboneCoords;
    }

    async function loadAndVisualizePDBs(pdb1: string, pdb2: string) {
      const coords1 = await loadPDB(pdb1);
      const coords2 = await loadPDB(pdb2);

      visualizeStructures(coords1, coords2);
    }

    loadAndVisualizePDBs('3SIU', '2OZB');  // Example PDB IDs

    function visualizeStructures(coords1: BABYLON.Vector3[], coords2: BABYLON.Vector3[]) {
      if (coords1.length === 0 || coords2.length === 0) {
        console.error("No backbone coordinates found for one or both PDBs.");
        return;
      }

      // Create parent nodes for separate rotation
      const parent1 = new BABYLON.TransformNode("parent1", scene);
      const parent2 = new BABYLON.TransformNode("parent2", scene);

      // Center the parents at the average of the coordinates
      const center1 = BABYLON.Vector3.Center(...coords1);
      const center2 = BABYLON.Vector3.Center(...coords2);
      parent1.position = center1;
      parent2.position = center2;

      const curve1 = BABYLON.Curve3.CreateCatmullRomSpline(coords1, 20, false);
      const curve2 = BABYLON.Curve3.CreateCatmullRomSpline(coords2, 20, false);

      const lines1 = BABYLON.Mesh.CreateLines("rna1", curve1.getPoints(), scene);
      lines1.color = new BABYLON.Color3(1, 0, 0);
      lines1.parent = parent1; // Attach to parent for rotation

      const lines2 = BABYLON.Mesh.CreateLines("rna2", curve2.getPoints(), scene);
      lines2.color = new BABYLON.Color3(0, 0, 1);
      lines2.parent = parent2; // Attach to parent for rotation

      coords1.forEach(coord => {
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere1", { diameter: 0.1 }, scene);
        sphere.position = coord;
        sphere.material = new BABYLON.StandardMaterial("", scene);
        sphere.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        sphere.parent = parent1; // Attach to parent for rotation
      });

      coords2.forEach(coord => {
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere2", { diameter: 0.1 }, scene);
        sphere.position = coord;
        sphere.material = new BABYLON.StandardMaterial("", scene);
        sphere.material.diffuseColor = new BABYLON.Color3(0, 0, 1);
        sphere.parent = parent2; // Attach to parent for rotation
      });

      // Click event to select and rotate structures
      const pickObject = (evt: PointerEvent) => {
        const pickInfo = scene.pick(evt.clientX, evt.clientY);
        if (pickInfo.hit) {
          if (pickInfo.pickedMesh?.name === "rna1") {
            selectedParent.current = parent1;
          } else if (pickInfo.pickedMesh?.name === "rna2") {
            selectedParent.current = parent2;
          } else {
            selectedParent.current = null; // Clear selection
          }
        }
      };

      canvas.addEventListener('pointerdown', pickObject);

      // Add rotation controls for the selected parent
      scene.onBeforeRenderObservable.add(() => {
        if (selectedParent.current) {
          selectedParent.current.rotation.y += 0.01; // Rotate around Y-axis
        }
      });
    }

    return () => {
      engine.dispose();
      canvas.removeEventListener('pointerdown', pickObject); // Clean up event listener
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Home;
