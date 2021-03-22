// import {}
import { useRouter } from "next/router";

import { Container, Content } from "layouts";
import { Pad } from "business";

export default function PadPage(context) {
  const router = useRouter();

  const { padName, subpadName } = router.query;

  return (
    <Container max="95vw" height="100vh" direction="row">
      <Content max="100%" height="90vh">
        {subpadName && <Pad name={subpadName} subOf={padName} />}
      </Content>
    </Container>
  );
}
