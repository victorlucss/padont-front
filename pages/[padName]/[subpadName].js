import { useRouter } from 'next/router'
import ErrorPage from 'next/error'

export default function Subpad({ pad }) {
  const router = useRouter()

  const { query } = router;

  console.log(router)
  // if (!router.isFallback && !pad?.slug) {
  //   return <ErrorPage statusCode={404} />
  // }

  return (
    <div>
      tdxtd
    </div>
  );
}