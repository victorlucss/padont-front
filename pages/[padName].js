import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useToggle, useInterval } from 'react-use';


import { Textarea } from 'components'

import { padService } from 'api';

export default function Pad() {
  const router = useRouter();

  const [changed, toggleChanged] = useToggle(false);
  const [content, setContent] = useState({});

  const { query } = router;
  
  const onChangePad = (text) => {
    toggleChanged(true);
    setContent({
      ...content,
      text
    })
  }

  const requestPad = async () => {
    const data = await padService.get(query.padName)

    setContent(data);
  }

  const savePad = async () => {
    const data = {
      ...content,
      content: content.text,
      updatedAt: new Date().toISOString()
    }
    await padService.put(query.padName, data)


  }

  useEffect(() => {
    requestPad();
  }, [query.padName])

  useInterval(() => {
    if (!changed) requestPad();
    else savePad();
    toggleChanged(false);
  }, 5000)

  return (
      <Textarea value={content.text || ''}  onChange={onChangePad} placeholder="Write something good here and share with anyone you like" />
  );
}