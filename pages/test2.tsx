import { useState } from 'react';
import BabylonScene from '../components/BabylonScene';

const fetchCIF = async (pdbId: string): Promise<string> => {
  const response = await fetch(`https://files.rcsb.org/view/${pdbId}.cif`);
  if (!response.ok) {
    throw new Error(`Failed to fetch CIF file for PDB ID: ${pdbId}`);
  }
  return response.text();
};

const Home: React.FC = () => {
  const [cifData, setCifData] = useState<string>('');
  const [pdbId, setPdbId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCifData(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handlePdbIdSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cifText = await fetchCIF(pdbId);
      setCifData(cifText);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handlePdbIdSubmit}>
        <label>
          Enter PDB ID:
          <input
            type="text"
            value={pdbId}
            onChange={(e) => setPdbId(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>Fetch CIF</button>
      </form>
      {error && <p>Error: {error}</p>}
      <input type="file" accept=".cif" onChange={handleFileUpload} />
      {cifData && <BabylonScene cifData={cifData} />}
    </div>
  );
};

export default Home;
