import { Center, Container, Logo } from 'layouts'

import { Input } from 'components'

export default function Home() {
  return (
    <Center>
      <Container max="60%" direction="column" justify="center" height="100vh">
        
        <Logo>{`{ Padont }`}</Logo>

        <Input placeholder="What do you want to create today?" />
      </Container> 
    </Center>
  )
}
