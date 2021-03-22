import { useState } from 'react';
import { useRouter } from 'next/router';

import { Center, Container, Logo } from 'layouts'

import { Input } from 'components'

export default function Home() {
  const router = useRouter();


  return (
    <Center>
      <Container max="60%" direction="column" justify="center" height="100vh">
        
        <Logo>{`{ Padont }`}</Logo>

        <Input onPressEnter={(pad) => router.replace(pad)} placeholder="Where do we go? Press enter to continue..." />
      </Container> 
    </Center>
  )
}
