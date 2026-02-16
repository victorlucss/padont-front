import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled, { keyframes } from 'styled-components';
import { colors } from 'styles';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { 
    opacity: 0;
    transform: translateY(40px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

const typewriter = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const blink = keyframes`
  0%, 50% { border-color: ${colors.accent}; }
  51%, 100% { border-color: transparent; }
`;

// Styled Components
const Page = styled.div`
  min-height: 100vh;
  background: ${colors.black};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(90deg, ${colors.gray_900} 1px, transparent 1px) 0 0 / 80px 80px,
      linear-gradient(${colors.gray_900} 1px, transparent 1px) 0 0 / 80px 80px;
    opacity: 0.3;
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 clamp(24px, 5vw, 80px);
  position: relative;
  z-index: 1;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 0;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Logo = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  
  span {
    color: ${colors.accent};
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 32px;
  
  a {
    font-size: 0.8125rem;
    color: ${colors.gray_400};
    transition: color 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    
    &:hover {
      color: ${colors.white};
    }
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const Hero = styled.section`
  min-height: calc(100vh - 120px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  padding: 80px 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 60px;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  animation: ${slideUp} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const HeroTag = styled.div`
  display: inline-block;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: ${colors.accent};
  margin-bottom: 24px;
  padding: 8px 16px;
  border: 1px solid ${colors.accent};
`;

const HeroTitle = styled.h1`
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(3.5rem, 8vw, 7rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.03em;
  margin-bottom: 32px;

  em {
    font-style: italic;
    color: ${colors.accent};
  }
`;

const HeroText = styled.p`
  font-size: 1rem;
  color: ${colors.gray_400};
  max-width: 480px;
  margin-bottom: 48px;
  line-height: 1.7;

  @media (max-width: 1024px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 0;
  max-width: 480px;
  animation: ${slideUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;

  @media (max-width: 1024px) {
    margin: 0 auto;
    max-width: 400px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 18px 24px;
  background: ${colors.gray_900};
  border: 1px solid ${colors.gray_700};
  border-right: none;
  color: ${colors.white};
  font-family: inherit;
  font-size: 0.9375rem;
  transition: all 0.2s;

  &::placeholder {
    color: ${colors.gray_500};
  }

  &:focus {
    outline: none;
    border-color: ${colors.accent};
    background: ${colors.black};
  }

  @media (max-width: 480px) {
    border-right: 1px solid ${colors.gray_700};
  }
`;

const Button = styled.button`
  padding: 18px 32px;
  background: ${colors.accent};
  color: ${colors.black};
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${colors.white};
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(2px);
  }
`;

const HeroVisual = styled.div`
  position: relative;
  animation: ${slideUp} 0.8s ease-out;
  animation-delay: 0.3s;
  animation-fill-mode: both;

  @media (max-width: 1024px) {
    order: -1;
  }
`;

const Terminal = styled.div`
  background: ${colors.gray_900};
  border: 1px solid ${colors.gray_700};
  padding: 24px;
  font-size: 0.8125rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    height: 40px;
    background: ${colors.gray_800};
    border-bottom: 1px solid ${colors.gray_700};
  }
`;

const TerminalDots = styled.div`
  position: absolute;
  top: 12px;
  left: 16px;
  display: flex;
  gap: 8px;
  z-index: 1;

  span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    
    &:nth-child(1) { background: #ff5f57; }
    &:nth-child(2) { background: #febc2e; }
    &:nth-child(3) { background: #28c840; }
  }
`;

const TerminalContent = styled.div`
  margin-top: 32px;
  
  .line {
    margin-bottom: 8px;
    display: flex;
    gap: 12px;
    
    .prompt {
      color: ${colors.accent};
      flex-shrink: 0;
    }
    
    .text {
      color: ${colors.gray_300};
    }
    
    .cursor {
      display: inline-block;
      width: 8px;
      height: 18px;
      background: ${colors.accent};
      animation: ${blink} 1s step-end infinite;
    }
  }
`;

const Features = styled.section`
  padding: 120px 0;
  border-top: 1px solid ${colors.gray_800};
`;

const FeaturesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 80px;
  gap: 40px;
  flex-wrap: wrap;
`;

const FeaturesTitle = styled.h2`
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  letter-spacing: -0.02em;
`;

const FeaturesCount = styled.span`
  font-size: 0.75rem;
  color: ${colors.gray_500};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: ${colors.gray_800};

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${colors.black};
  padding: 48px 40px;
  transition: all 0.3s;
  position: relative;

  &::before {
    content: '${props => props.$number}';
    position: absolute;
    top: 24px;
    right: 24px;
    font-size: 0.6875rem;
    color: ${colors.gray_600};
    font-weight: 500;
  }

  &:hover {
    background: ${colors.gray_900};
    
    h3 {
      color: ${colors.accent};
    }
  }

  h3 {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 16px;
    transition: color 0.3s;
  }

  p {
    font-size: 0.875rem;
    color: ${colors.gray_400};
    line-height: 1.7;
  }
`;

const Footer = styled.footer`
  padding: 48px 0;
  border-top: 1px solid ${colors.gray_800};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
`;

const FooterText = styled.p`
  font-size: 0.75rem;
  color: ${colors.gray_500};

  a {
    color: ${colors.gray_300};
    transition: color 0.2s;

    &:hover {
      color: ${colors.accent};
    }
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 24px;
  
  a {
    font-size: 0.75rem;
    color: ${colors.gray_500};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: color 0.2s;

    &:hover {
      color: ${colors.white};
    }
  }
`;

// Component
export default function Home() {
  const router = useRouter();
  const [padName, setPadName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (padName.trim()) {
      router.push(`/${padName.trim()}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const features = [
    {
      title: 'Instant Sync',
      description: 'Changes propagate in real-time. No refresh needed. Just write and watch it sync across all connected clients.',
    },
    {
      title: 'Zero Friction',
      description: 'No accounts. No passwords. Just a URL. Type a name and start writing. Share the link with anyone.',
    },
    {
      title: 'Rich Editor',
      description: 'Full Markdown support. Tables, code blocks with syntax highlighting, headers, lists. Everything you need.',
    },
    {
      title: 'Clean View',
      description: 'Dedicated view mode for sharing. Beautiful rendering of your content without the editing interface.',
    },
    {
      title: 'Auto-Save',
      description: 'Every keystroke is saved. Close the tab, come back later. Your content is always there, waiting.',
    },
    {
      title: 'Nested Pads',
      description: 'Organize with subpads. Create hierarchies. Link related notes together. Build your knowledge base.',
    },
  ];

  return (
    <Page>
      <Container>
        <Header>
          <Logo>
            padont<span>_</span>
          </Logo>
          <Nav>
            <a href="#features">Features</a>
            <a href="https://github.com/victorlucss/padont-front" target="_blank" rel="noreferrer">
              Source
            </a>
          </Nav>
        </Header>

        <Hero>
          <HeroContent>
            <HeroTag>Collaborative Notes</HeroTag>
            <HeroTitle>
              Write.<br />
              Share.<br />
              <em>Instantly.</em>
            </HeroTitle>
            <HeroText>
              Real-time collaborative notes with zero friction. 
              No accounts, no setup. Just create a pad and start writing. 
              Share the URL with anyone.
            </HeroText>
            <form onSubmit={handleSubmit}>
              <InputGroup>
                <Input
                  type="text"
                  placeholder="Enter pad name..."
                  value={padName}
                  onChange={(e) => setPadName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
                <Button type="submit">Go →</Button>
              </InputGroup>
            </form>
          </HeroContent>

          <HeroVisual>
            <Terminal>
              <TerminalDots>
                <span />
                <span />
                <span />
              </TerminalDots>
              <TerminalContent>
                <div className="line">
                  <span className="prompt">→</span>
                  <span className="text">pad.tianxu.cloud/my-notes</span>
                </div>
                <div className="line">
                  <span className="prompt">#</span>
                  <span className="text">Meeting Notes - Q1 2026</span>
                </div>
                <div className="line">
                  <span className="prompt"></span>
                  <span className="text" style={{ color: colors.gray_500 }}>
                    Last updated 2 minutes ago
                  </span>
                </div>
                <div className="line" style={{ marginTop: '24px' }}>
                  <span className="prompt">|</span>
                  <span className="text">Writing collaboratively...</span>
                  <span className="cursor" />
                </div>
              </TerminalContent>
            </Terminal>
          </HeroVisual>
        </Hero>

        <Features id="features">
          <FeaturesHeader>
            <FeaturesTitle>What you get</FeaturesTitle>
            <FeaturesCount>06 Features</FeaturesCount>
          </FeaturesHeader>
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard key={index} $number={String(index + 1).padStart(2, '0')}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </Features>

        <Footer>
          <FooterText>
            Built by{' '}
            <a href="https://github.com/victorlucss" target="_blank" rel="noreferrer">
              Victor Lucas
            </a>
          </FooterText>
          <FooterLinks>
            <a href="https://github.com/victorlucss/padont-front" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </FooterLinks>
        </Footer>
      </Container>
    </Page>
  );
}
