// pages/index.tsx
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const DynamicMoleculeViewer = dynamic(() => import('../components/MoleculeViewer'), { ssr: false });

const Home: React.FC = () => {
  const [pdbData, setPdbData] = useState<string | null>(null);

  useEffect(() => {
    fetch('/1Y26.pdb')
      .then(response => response.text())
      .then(data => setPdbData(data));
  }, []);

  if (!pdbData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <DynamicMoleculeViewer pdbData={pdbData} />
    </div>
  );
};

export default Home;
