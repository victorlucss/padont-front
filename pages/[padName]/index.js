import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useToggle, useInterval } from "react-use";

import { Time32, Launch32 } from '@carbon/icons-react';

import { Textarea } from "components";
import { Container, Content } from 'layouts';
import { TextareaWrapper, Info, Title } from "./styles";

import { padService } from "api";

import formatDate from 'utils/formatDate';

export default function Pad() {
  const router = useRouter();

  const [changed, toggleChanged] = useToggle(false);
  const [content, setContent] = useState({});

  const { query } = router;

  const onChangePad = (text) => {
    toggleChanged(true);
    setContent({
      ...content,
      text,
    });
  };

  const requestPad = async () => {
    const data = await padService.get(query.padName);

    setContent(data);
  };

  const savePad = async () => {
    const data = {
      ...content,
      content: content.text,
      updatedAt: new Date().toISOString(),
    };
    await padService.put(query.padName, data);
  };

  useEffect(() => {
    requestPad();
  }, [query.padName]);

  useInterval(() => {
    if (!changed) requestPad();
    else savePad();
    toggleChanged(false);
  }, 5000);

  return (
    <Container max="95vw" height="100vh">
      <Content max="100%" height="90vh">
        <Title>
          <h2>{query.padName}</h2>
          <a href={`${query.padName}/view`} target="_blank" rel="noreferrer">
            <Launch32 with="20px" height="20px" className="icon" />
          </a>
        </Title>

        <TextareaWrapper>
          <Textarea
            value={content.text || ""}
            onChange={onChangePad}
            placeholder="Write something good here and share with anyone you like"
            spaceBottom={80}
          />
          <Info>
            <Time32 with="20px" height="20px" />
            <span>
              Last updated at {formatDate(content.updatedAt) || "never"}
            </span>
          </Info>
        </TextareaWrapper>
      </Content>
    </Container>
  );
}
