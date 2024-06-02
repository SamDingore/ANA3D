// utils/pdbParser.ts
export interface Atom {
    chainID: string;
    resSeq: number;
    resName: string;
    x: number;
    y: number;
    z: number;
    element: string;
    name: string;
  }
  
  export const parsePDB = (pdbData: string): Atom[] => {
    const atoms: Atom[] = [];
    const lines = pdbData.split('\n');
  
    for (const line of lines) {
      if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
        const chainID = line.substring(21, 22).trim();
        const resSeq = parseInt(line.substring(22, 26).trim(), 10);
        const resName = line.substring(17, 20).trim();
        const name = line.substring(12, 16).trim();
        const x = parseFloat(line.substring(30, 38).trim());
        const y = parseFloat(line.substring(38, 46).trim());
        const z = parseFloat(line.substring(46, 54).trim());
        const element = line.substring(76, 78).trim();
        atoms.push({ chainID, resSeq, resName, name, x, y, z, element });
      }
    }
  
    return atoms;
  };
  