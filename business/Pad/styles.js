import styled, { keyframes } from 'styled-components';
import { colors } from 'styles';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { 
    opacity: 0;
    transform: translateX(-12px);
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
`;

export const PadContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${colors.black};
  animation: ${fadeIn} 0.4s ease-out;
`;

export const PadHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid ${colors.gray_800};
  background: ${colors.black};
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const PadNav = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const BackLink = styled.a`
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

export const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${slideIn} 0.5s ease-out;

  h2 {
    font-size: 0.9375rem;
    font-weight: 500;
    color: ${colors.white};
    display: flex;
    align-items: center;
    gap: 8px;

    a {
      color: ${colors.gray_500};
      transition: color 0.2s;

      &:hover {
        color: ${colors.accent};
      }
    }

    span.separator {
      color: ${colors.gray_600};
    }
  }
`;

export const PadActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const ActionButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${colors.gray_700};
  color: ${colors.gray_400};
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.accent};
    color: ${colors.accent};
    background: ${colors.accent_glow};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const PadBody = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

export const Sidebar = styled.aside`
  width: 240px;
  border-right: 1px solid ${colors.gray_800};
  background: ${colors.gray_900};
  padding: 24px 0;
  overflow-y: auto;
  flex-shrink: 0;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const SidebarSection = styled.div`
  padding: 0 20px;
  margin-bottom: 24px;
`;

export const SidebarTitle = styled.h3`
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${colors.gray_500};
  margin-bottom: 12px;
`;

export const SubpadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Subpad = styled.a`
  display: block;
  padding: 10px 16px;
  font-size: 0.8125rem;
  color: ${colors.gray_300};
  background: transparent;
  border-left: 2px solid transparent;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: ${colors.gray_800};
    color: ${colors.white};
    border-left-color: ${colors.accent};
  }
`;

export const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const TextareaWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
`;

export const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${colors.gray_900};
  border-top: 1px solid ${colors.gray_800};
  font-size: 0.75rem;
  color: ${colors.gray_500};

  svg {
    width: 14px;
    height: 14px;
    color: ${colors.gray_600};
  }

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

export const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.$saved ? colors.success : colors.accent};
  animation: ${props => props.$saving ? 'pulse 1s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

export const Subpads = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 24px;
  background: ${colors.gray_900};
  border-bottom: 1px solid ${colors.gray_800};
`;

export const SubpadTag = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.75rem;
  color: ${colors.gray_300};
  background: ${colors.gray_800};
  border: 1px solid ${colors.gray_700};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: ${colors.accent};
    color: ${colors.accent};
  }

  &::before {
    content: '#';
    color: ${colors.gray_500};
  }
`;
