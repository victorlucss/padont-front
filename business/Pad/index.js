import Link from 'next/link'

import { useEffect, useState } from "react";
import { useToggle, useInterval } from "react-use";

import { Time32, Launch32 } from '@carbon/icons-react';

import { Textarea } from "components";
import { Content } from 'layouts';
import { TextareaWrapper, Info, Title, Subpads, Subpad } from "./styles";

import { padService } from "api";

import formatDate from 'utils/formatDate';

const Pad = ({ name, subOf }) => {
  const [changed, toggleChanged] = useToggle(false);
  const [content, setContent] = useState({});

  const onChangePad = (text) => {
    toggleChanged(true);
    setContent({
      ...content,
      text,
    });
  };

  const requestPad = async () => {
    const padName = subOf ? `{${subOf}}-${name}` : name;
    const data = await padService.get(padName);

    setContent(data);
  };

  const savePad = async () => {
    const padName = subOf ? `{${subOf}}-${name}` : name;

    const data = {
      ...content,
      title: name,
      text: content.text,
      updatedAt: new Date().toISOString()
    };

    await padService.put(padName, data);
  };

  const updateParentPad = async () => {
    const parent = await padService.get(subOf);

    const data = {
      ...parent,
      subpads: [...new Set([...(parent.subpads || []), name])]
    };

    await padService.put(subOf, data);
  };

  useEffect(() => {
    requestPad();
  }, [name]);

  useEffect(() => {
    if (subOf) {
      updateParentPad();
    }
  }, [subOf]);

  useInterval(() => {
    if (!changed) requestPad();
    else savePad();
    toggleChanged(false);
  }, 5000);

  return (
    <>
     {(content.subpads && content.subpads.length > 0) && (
       <Subpads>
          {content.subpads.map(subpad => (
            <Link href={`/${name}/${subpad}`}>
              <Subpad>{subpad}</Subpad>
            </Link>
          ))}
        </Subpads>
     )}

    <Content max="100%" height="90vh">
      <Title>
        <h2>
          {subOf && (
            <>
              <Link href={`/${subOf}`}>{subOf}</Link> {` / `} 
            </>
          )}
          {name}</h2>
        <a href={`${name}/view`} target="_blank" rel="noreferrer">
          <Launch32 with={20} height={20} className="icon" />
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
          <Time32 width={20} height={20} />
          <span>
            Last updated at {formatDate(content.updatedAt) || "never"}
          </span>
        </Info>
      </TextareaWrapper>
    </Content>
    </>
  );
}

export { Pad };
