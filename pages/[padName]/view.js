import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useInterval } from "react-use";
import styled from 'styled-components';
import { colors } from 'styles';

import { padService } from "api";

const ContentViewWrapper = styled.div`
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;

  h1 {
    font-size: 2rem;
    font-weight: bold;
    margin: 0.5em 0;
    margin-top: 0;
  }
`;

const ContentView = styled.div`
  h1, h2, h3 {
    font-weight: bold;
    margin: 0.5em 0;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.2rem;
  }

  strong, b {
    font-weight: bold;
  }

  em, i {
    font-style: italic;
  }

  del {
    text-decoration: line-through;
    opacity: 0.6;
  }

  p {
    margin: 0.5em 0;
    line-height: 1.6;
  }

  blockquote {
    background: ${colors.dark_blue};
    border-left: 10px solid ${colors.blue};
    margin: 1.5em 0;
    padding: 0.5em 10px;
  }

  ul, ol {
    margin-left: 20px;
    margin: 0.5em 0;
  }

  ol li {
    list-style-type: decimal;
  }

  ul li {
    list-style-type: circle;
  }

  code {
    font-family: 'Courier Prime', monospace;
    background: ${colors.dark_green};
    color: ${colors.green};
    padding: 0 0.5em;
  }

  pre {
    background: #1e1e1e;
    border: 1px solid #444;
    border-radius: 4px;
    overflow-x: auto;
    padding: 12px;
    margin: 1em 0;

    code {
      background: transparent;
      color: #d4d4d4;
      padding: 0;
    }
  }

  a, a:hover, a:visited {
    color: #4a9eff;
    text-decoration: none;
    border-bottom: 1px dashed #4a9eff;
  }

  a:hover {
    color: #6bb3ff;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1em 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }

  th, td {
    border: 1px solid #444;
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background: #2a2a2a;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background: #1e1e1e;
  }

  input[type="checkbox"] {
    margin-right: 8px;
  }
`;

export default function Pad() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const { query } = router;

  const requestPad = async () => {
    const data = await padService.get(query.padName);
    setContent(data.text || '');
  };

  useEffect(() => {
    if (query.padName) {
      requestPad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.padName]);

  useInterval(() => {
    requestPad();
  }, 5000);

  return (
    <ContentViewWrapper>
      <h1>{query.padName}</h1>
      <ContentView dangerouslySetInnerHTML={{ __html: content }} />
    </ContentViewWrapper>
  );
}
