import { Title, Text, Anchor, AspectRatio, Button } from '@mantine/core';
import classes from './Welcome.module.css';
import { useRouter } from 'next/navigation';

export function Welcome() {
  const router = useRouter();
  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
      <AspectRatio ratio={1080 / 720} maw={300} mx="auto">
      <img
        height={350}
        width={300}
        src="/logo.png"
        alt="ANA3D"
      />
    </AspectRatio>
        <Text inherit variant="gradient" component="span" gradient={{ from: 'blue', to: 'red' }}>
        Advance Nucleuc Acid 3D
        </Text>
      </Title>
      <Text  ta="center" size="xl" maw={580} mx="auto" mt="xl">
       ANA3D
      </Text>
      <Text color="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
       This is a official sandbox for ANA3D. ANA3D is a platform for visualizing and analyzing nucleic acid structures..
      </Text> 
      <center>
        <br />
      <Button gradient={{ from: 'red', to: 'blue' }} variant='gradient' onClick={() => { router.push('/test'); }}>Sandbox</Button>
      </center>
    </>
  );
}
