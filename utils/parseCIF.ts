interface ParsedCIF {
    atom_positions: number[][];
    atom_names: string[];
  }

  export const parseCIF = (cifString: string): ParsedCIF => {
    const lines = cifString.split('\n');
    const atom_positions: number[][] = [];
    const atom_names: string[] = [];

    let parsingAtoms = false;
    let headers: string[] = [];
    let xIndex = -1;
    let yIndex = -1;
    let zIndex = -1;
    let atomNameIndex = -1;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('loop_')) {
        parsingAtoms = true;
        headers = [];
        continue;
      }

      if (parsingAtoms) {
        if (trimmedLine.startsWith('_')) {
          headers.push(trimmedLine);
          if (trimmedLine.includes('_atom_site.Cartn_x')) xIndex = headers.length - 1;
          if (trimmedLine.includes('_atom_site.Cartn_y')) yIndex = headers.length - 1;
          if (trimmedLine.includes('_atom_site.Cartn_z')) zIndex = headers.length - 1;
          if (trimmedLine.includes('_atom_site.label_atom_id')) atomNameIndex = headers.length - 1;
        } else {
          const parts = trimmedLine.split(/\s+/);
          if (parts.length > Math.max(xIndex, yIndex, zIndex, atomNameIndex)) {
            const x = parseFloat(parts[xIndex]);
            const y = parseFloat(parts[yIndex]);
            const z = parseFloat(parts[zIndex]);
            const atom_name = parts[atomNameIndex];

            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
              atom_positions.push([x, y, z]);
              atom_names.push(atom_name);
            }
          }
        }
      }
    }

    console.log('Parsed CIF Data:', { atom_positions, atom_names });
    return { atom_positions, atom_names };
  };
