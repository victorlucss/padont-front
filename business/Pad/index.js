import Link from 'next/link'
import { useEffect, useState } from "react";
import { useToggle, useInterval } from "react-use";

import { Editor } from 'components';
import {
  PadContainer,
  PadHeader,
  PadNav,
  BackLink,
  Title,
  PadActions,
  ActionButton,
  PadBody,
  EditorWrapper,
  TextareaWrapper,
  Info,
  StatusDot,
  Subpads,
  SubpadTag,
} from "./styles";

import { padService } from "api";
import formatDate from 'utils/formatDate';

const Pad = ({ name, subOf }) => {
  const [changed, toggleChanged] = useToggle(false);
  const [saving, setSaving] = useState(false);
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
    setSaving(true);
    const padName = subOf ? `{${subOf}}-${name}` : name;

    const data = {
      ...content,
      title: name,
      text: content.text,
      updatedAt: new Date().toISOString()
    };

    await padService.put(padName, data);
    setSaving(false);
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
    <PadContainer>
      <PadHeader>
        <PadNav>
          <Link href="/" passHref legacyBehavior>
            <BackLink>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Home
            </BackLink>
          </Link>
          <Title>
            <h2>
              {subOf && (
                <>
                  <Link href={`/${subOf}`}>{subOf}</Link>
                  <span className="separator">/</span>
                </>
              )}
              {name}
            </h2>
          </Title>
        </PadNav>
        
        <PadActions>
          <ActionButton href={`${subOf ? `/${subOf}/${name}` : `/${name}`}/view`} target="_blank" rel="noreferrer" title="View mode">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </ActionButton>
        </PadActions>
      </PadHeader>

      {(content.subpads && content.subpads.length > 0) && (
        <Subpads>
          {content.subpads.map(subpad => (
            <Link key={subpad} href={`/${name}/${subpad}`} passHref legacyBehavior>
              <SubpadTag>{subpad}</SubpadTag>
            </Link>
          ))}
        </Subpads>
      )}

      <PadBody>
        <EditorWrapper>
          <TextareaWrapper>
            <Editor
              value={content.text || ""}
              onChange={onChangePad}
              placeholder="Start writing..."
              roomName={subOf ? `${subOf}-${name}` : name}
            />
          </TextareaWrapper>
          
          <Info>
            <StatusDot $saved={!changed && !saving} $saving={saving} />
            <span>
              {saving ? 'Saving...' : changed ? 'Unsaved changes' : 'Saved'}
              {content.updatedAt && !saving && !changed && (
                <> · Last edit {formatDate(content.updatedAt)}</>
              )}
            </span>
          </Info>
        </EditorWrapper>
      </PadBody>
    </PadContainer>
  );
}

export { Pad };
