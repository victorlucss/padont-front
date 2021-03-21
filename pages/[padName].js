import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router'

import { Textarea } from 'components'

export default function Pad() {
  const router = useRouter()
  const contentText = useRef('');

  const { query } = router;

  console.log(query)

  
  const onChangePad = (text) => {
    contentText.current = text;
  }

  useEffect(() => {
    console.log(contentText.current)
  }, [contentText])
  

  return (
    <div>
      <Textarea onChange={onChangePad} placeholder="Write something good here and share with anyone you like" />
    </div>
  );
}