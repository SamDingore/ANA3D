// pages/index.tsx
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Input } from '@mantine/core';

const DynamicMoleculeViewer = dynamic(() => import('../components/MoleculeViewer'), { ssr: false });

const Home: React.FC = () => {
  const [pdbId, setPdbId] = useState<string>('1Y26');
  const [pdbData, setPdbData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetchPdbData = () => {
    setLoading(true);
    fetch(`https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`)
      .then(response => response.text())
      .then(data => {
        setPdbData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching PDB data:', error);
        setLoading(false);
      });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ marginBottom: 20 }}>
        <Input
          placeholder="Enter PDB ID"
          value={pdbId}
          onChange={(event) => setPdbId(event.currentTarget.value)}
          style={{ marginRight: 10 }}
        />
        <Button gradient={{ from: 'blue', to: 'red' }} variant="gradient" onClick={handleFetchPdbData} disabled={!pdbId || loading}>
          {loading ? 'Loading...' : 'Load Structure'}
        </Button>
      </div>
      {pdbData && <DynamicMoleculeViewer pdbData={pdbData} />}
    </div>
  );
};

export default Home;
