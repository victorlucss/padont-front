import { useRouter } from "next/router";
import { Pad } from "business";

export default function SubPadPage() {
  const router = useRouter();
  const { padName, subpadName } = router.query;

  return subpadName ? <Pad name={subpadName} subOf={padName} /> : null;
}
