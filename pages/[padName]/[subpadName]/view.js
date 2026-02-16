import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styled, { keyframes } from "styled-components";
import { colors } from 'styles';
import { padService } from "api";
import formatDate from 'utils/formatDate';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const Page = styled.div`
  min-height: 100vh;
  background: ${colors.black};
  animation: ${fadeIn} 0.4s ease-out;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px clamp(24px, 5vw, 80px);
  background: ${colors.black};
  border-bottom: 1px solid ${colors.gray_800};
  backdrop-filter: blur(8px);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: ${colors.gray_500};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.2s;

  &:hover {
    color: ${colors.accent};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Title = styled.h1`
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${colors.white};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Meta = styled.span`
  font-size: 0.75rem;
  color: ${colors.gray_500};

  @media (max-width: 640px) {
    display: none;
  }
`;

const EditButton = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${colors.black};
  background: ${colors.accent};
  transition: all 0.2s;

  &:hover {
    background: ${colors.white};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Content = styled.article`
  max-width: 800px;
  margin: 0 auto;
  padding: 64px clamp(24px, 5vw, 80px);
  animation: ${slideUp} 0.6s ease-out;
  animation-delay: 0.1s;
  animation-fill-mode: both;

  /* Typography */
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9375rem;
  line-height: 1.8;
  color: ${colors.gray_200};

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Instrument Serif', Georgia, serif;
    font-weight: 400;
    color: ${colors.white};
    margin-top: 2em;
    margin-bottom: 0.75em;
    line-height: 1.3;

    &:first-child {
      margin-top: 0;
    }
  }

  h1 {
    font-size: 2.75rem;
    letter-spacing: -0.02em;
  }

  h2 {
    font-size: 2rem;
    padding-bottom: 0.5em;
    border-bottom: 1px solid ${colors.gray_800};
  }

  h3 {
    font-size: 1.5rem;
  }

  h4 {
    font-size: 1.25rem;
  }

  /* Paragraphs */
  p {
    margin-bottom: 1.5em;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Strong & Em */
  strong {
    font-weight: 600;
    color: ${colors.white};
  }

  em {
    font-style: italic;
  }

  /* Links */
  a {
    color: ${colors.accent};
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.2s;

    &:hover {
      color: ${colors.white};
    }
  }

  /* Lists */
  ul, ol {
    margin-bottom: 1.5em;
    padding-left: 1.5em;
  }

  ul {
    list-style: none;

    li::before {
      content: '—';
      color: ${colors.accent};
      display: inline-block;
      width: 1.5em;
      margin-left: -1.5em;
    }
  }

  ol {
    list-style: decimal;

    li::marker {
      color: ${colors.accent};
    }
  }

  li {
    margin-bottom: 0.5em;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Blockquote */
  blockquote {
    margin: 2em 0;
    padding: 1.5em 2em;
    border-left: 3px solid ${colors.accent};
    background: ${colors.gray_900};
    font-style: italic;
    color: ${colors.gray_300};

    p:last-child {
      margin-bottom: 0;
    }
  }

  /* Code inline */
  code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875em;
    background: ${colors.gray_800};
    color: ${colors.accent};
    padding: 0.2em 0.4em;
  }

  /* Code block */
  pre {
    margin: 2em 0;
    padding: 1.5em;
    background: ${colors.gray_900};
    border: 1px solid ${colors.gray_800};
    overflow-x: auto;
    font-size: 0.875rem;
    line-height: 1.6;

    code {
      background: none;
      padding: 0;
      color: ${colors.gray_200};
    }

    /* Syntax highlighting */
    .hljs-keyword,
    .hljs-selector-tag,
    .hljs-built_in {
      color: ${colors.accent};
    }

    .hljs-string,
    .hljs-attr {
      color: #a8e6cf;
    }

    .hljs-number,
    .hljs-literal {
      color: #ffb4a2;
    }

    .hljs-comment {
      color: ${colors.gray_500};
      font-style: italic;
    }

    .hljs-function,
    .hljs-title {
      color: #ffd3b6;
    }
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2em 0;
    font-size: 0.875rem;
  }

  th, td {
    padding: 1em;
    text-align: left;
    border: 1px solid ${colors.gray_700};
  }

  th {
    background: ${colors.gray_900};
    font-weight: 600;
    color: ${colors.accent};
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }

  tr:hover td {
    background: ${colors.gray_900};
  }

  /* Horizontal rule */
  hr {
    border: none;
    border-top: 1px solid ${colors.gray_700};
    margin: 3em 0;
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    margin: 2em 0;
    border: 1px solid ${colors.gray_800};
  }

  /* Task lists */
  input[type="checkbox"] {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid ${colors.gray_600};
    background: ${colors.black};
    margin-right: 8px;
    position: relative;
    top: 2px;

    &:checked {
      background: ${colors.accent};
      border-color: ${colors.accent};

      &::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 10px;
        color: ${colors.black};
      }
    }
  }

  /* Strikethrough */
  del, s {
    text-decoration: line-through;
    color: ${colors.gray_500};
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: ${colors.gray_500};

  p {
    margin-bottom: 24px;
  }
`;

export default function View() {
  const router = useRouter();
  const { padName } = router.query;
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!padName) return;

    const fetchPad = async () => {
      try {
        const data = await padService.get(padName);
        setContent(data);
      } catch (error) {
        console.error('Failed to fetch pad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPad();

    // Poll for updates
    const interval = setInterval(fetchPad, 5000);
    return () => clearInterval(interval);
  }, [padName]);

  if (loading) {
    return (
      <Page>
        <Header>
          <HeaderLeft>
            <Title>Loading...</Title>
          </HeaderLeft>
        </Header>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <HeaderLeft>
          <Link href="/" passHref legacyBehavior>
            <BackLink>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Home
            </BackLink>
          </Link>
          <Title>{padName}</Title>
        </HeaderLeft>
        
        <HeaderRight>
          {content?.updatedAt && (
            <Meta>Updated {formatDate(content.updatedAt)}</Meta>
          )}
          <Link href={`/${padName}`} passHref legacyBehavior>
            <EditButton>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </EditButton>
          </Link>
        </HeaderRight>
      </Header>

      <Content>
        {content?.text ? (
          <div dangerouslySetInnerHTML={{ __html: content.text }} />
        ) : (
          <Empty>
            <p>This pad is empty.</p>
            <Link href={`/${padName}`} passHref legacyBehavior>
              <EditButton as="a">Start writing</EditButton>
            </Link>
          </Empty>
        )}
      </Content>
    </Page>
  );
}
