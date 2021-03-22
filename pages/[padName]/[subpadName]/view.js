import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useInterval } from "react-use";

import markdownToHtml from 'utils/markdownToHtml'
import { Content } from 'layouts'

import { padService } from "api";

export default function Pad() {
  const router = useRouter();

  const [contentHtml, setContentHtml] = useState('');

  const { padName, subpadName } = router.query;

  const requestPad = async () => {
    const data = await padService.get(subpadName);
    const mdToHTML = await markdownToHtml(data.text)

    setContentHtml(mdToHTML)
  };

  useEffect(() => {
    requestPad();
  }, [subpadName]);

  useInterval(() => {
    requestPad();
  }, 5000);

  return (
    <Content>
      <h1>{subpadName}</h1>

      <div dangerouslySetInnerHTML={{ __html: contentHtml }}/>
    </Content>
  );
}
