import { useRouter } from "next/router";
import { Pad } from "business";

export default function SubPadPage() {
  const router = useRouter();
  const { padName, subpadName } = router.query;

  // Wait for router to be ready to prevent double-mount during hydration
  if (!router.isReady) {
    return null;
  }

  return subpadName ? <Pad name={subpadName} subOf={padName} /> : null;
}
