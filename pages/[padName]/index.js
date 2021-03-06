// import {}
import { useRouter } from "next/router";

import { Container, Content } from "layouts";
import { Pad } from "business";

export default function PadPage(context) {
  const router = useRouter();

  const { padName } = router.query;

  return (
    <Container max="95vw" height="100vh" direction="row">
      {padName && <Pad name={padName} />}
    </Container>
  );
}
