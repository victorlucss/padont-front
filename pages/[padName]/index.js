import { useRouter } from "next/router";
import { Pad } from "business";

export default function PadPage() {
  const router = useRouter();
  const { padName } = router.query;

  return padName ? <Pad name={padName} /> : null;
}
