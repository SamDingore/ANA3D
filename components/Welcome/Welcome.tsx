import { Title, Text, Anchor } from '@mantine/core';
import classes from './Welcome.module.css';

export function Welcome() {
  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'orange', to: 'violet' }}>
          ANA3D
        </Text>
        {' '}Sandbox
      </Title>
      <Text color="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
       This is a official sandbox for ANA3D. You can use this platform to test and learn ANA3D.
      </Text>
    </>
  );
}
