import { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { Input } from 'components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo {
    font-size: 28px;
    font-weight: bold;
    color: #4a9eff;
    font-family: 'Courier New', monospace;
  }

  nav {
    display: flex;
    gap: 30px;

    a {
      color: #d4d4d4;
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: #4a9eff;
      }
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    text-align: center;

    nav {
      gap: 15px;
    }
  }
`;

const HeroSection = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 40px;
  text-align: center;

  h1 {
    font-size: 64px;
    font-weight: bold;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #4a9eff, #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 20px;
    color: #b4bcd0;
    margin-bottom: 40px;
    max-width: 600px;
  }

  @media (max-width: 768px) {
    padding: 40px 20px;

    h1 {
      font-size: 40px;
    }

    p {
      font-size: 16px;
    }
  }
`;

const InputWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 60px;

  input {
    width: 100%;
    max-width: 500px;
  }

  @media (max-width: 768px) {
    max-width: 90%;
    margin: 0 auto 40px;

    input {
      max-width: 100%;
    }
  }
`;

const FeaturesSection = styled.section`
  padding: 100px 40px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    font-size: 42px;
    text-align: center;
    margin-bottom: 60px;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    padding: 50px 20px;

    h2 {
      font-size: 28px;
      margin-bottom: 40px;
    }
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const FeatureCard = styled.div`
  padding: 30px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(74, 158, 255, 0.6);
    transform: translateY(-5px);
  }

  h3 {
    font-size: 24px;
    margin-bottom: 15px;
    color: #4a9eff;
    font-weight: 600;
  }

  p {
    color: #b4bcd0;
    line-height: 1.6;
  }

  .icon {
    font-size: 48px;
    margin-bottom: 15px;
  }
`;

const Footer = styled.footer`
  padding: 30px 40px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #777;

  a {
    color: #4a9eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export default function Home() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');

  const handleNavigate = (padName) => {
    if (padName.trim()) {
      router.push(`/${padName}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNavigate(inputValue);
    }
  };

  return (
    <PageContainer>
      <Header>
        <div className="logo">{`{ Padont }`}</div>
        <nav>
          <a href="#features">Features</a>
          <a href="https://github.com/victorlucss/padont-front" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </Header>

      <HeroSection>
        <h1>Padont</h1>
        <p>
          Real-time collaborative notes. Write, share, and collaborate instantly with anyone, anywhere.
        </p>

        <InputWrapper>
          <input
            type="text"
            placeholder="Enter pad name to create or access..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: '14px 20px',
              borderRadius: '6px',
              border: '1px solid rgba(74, 158, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              outline: 'none',
              '&:focus': {
                borderColor: '#4a9eff',
                background: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          />
        </InputWrapper>
      </HeroSection>

      <FeaturesSection id="features">
        <h2>Features</h2>
        <FeaturesGrid>
          <FeatureCard>
            <div className="icon">📝</div>
            <h3>Real-Time Editing</h3>
            <p>
              Collaborate with others in real-time. See changes instantly as teammates type.
            </p>
          </FeatureCard>

          <FeatureCard>
            <div className="icon">🎨</div>
            <h3>Rich Text Editor</h3>
            <p>
              Powerful Tiptap editor with tables, code blocks, formatting, and more.
            </p>
          </FeatureCard>

          <FeatureCard>
            <div className="icon">📄</div>
            <h3>Markdown & HTML</h3>
            <p>
              Full support for Markdown, tables, code syntax highlighting, and GFM.
            </p>
          </FeatureCard>

          <FeatureCard>
            <div className="icon">🔗</div>
            <h3>Easy Sharing</h3>
            <p>
              Share your pads with a simple URL. No authentication needed.
            </p>
          </FeatureCard>

          <FeatureCard>
            <div className="icon">🌙</div>
            <h3>Dark Mode</h3>
            <p>
              Sleek dark interface designed for comfortable writing and reading.
            </p>
          </FeatureCard>

          <FeatureCard>
            <div className="icon">⚡</div>
            <h3>Auto-Save</h3>
            <p>
              Changes are automatically saved every few seconds. Never lose your work.
            </p>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <Footer>
        <p>
          Made with ❤️ by{' '}
          <a href="https://github.com/victorlucss" target="_blank" rel="noreferrer">
            Victor Lucas
          </a>
          . Code on{' '}
          <a href="https://github.com/victorlucss/padont-front" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </Footer>
    </PageContainer>
  );
}
