import { useRouter } from "next/router";
import { Pad } from "business";

export default function PadPage() {
  const router = useRouter();
  const { padName } = router.query;

  // Wait for router to be ready to prevent double-mount during hydration
  if (!router.isReady) {
    return null;
  }

  return padName ? <Pad name={padName} /> : null;
}
