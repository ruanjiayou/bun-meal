import { styled } from '@linaria/react';

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
`
export const AppHeader = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 10px;
  }
`
export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  padding-top: env(safe-area-inset-top);
`
export const AppMain = styled.main`
  flex: 1;
  position: relative;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  min-height: 0;
`
/* 每个 Tab 的容器：常驻挂载，仅切换可见性，切换时不丢失内部状态 */
export const TabPanel = styled.div`
  position: absolute;
  inset: 0;
  padding: 0 10px;
  overflow: hidden;
  /* 不透明的页面底色：切换瞬间不会透出另一个 Tab 的内容 */
  background: #f5f5f5;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  z-index: 0;

  &[data-active='true'] {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
    z-index: 1;
  }
`
export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  & h1 {
    font-size: 24px;
    font-weight: 600;

    @media (max-width: 768px) {
      font-size: 18px;
    }
  }
`
/* 精简 / 详细 切换 */
export const ModeSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  margin-right: 15px;
`
export const SwitchTrack = styled.button`
  width: 42px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.22);
  position: relative;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  & .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    transition: transform 0.2s ease;
  }

  &.on {
    background: #ffd54f;
    border-color: #ffd54f;
  }
  &.on .knob {
    transform: translateX(18px);
  }
`
export const SwitchLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  min-width: 24px;

  @media (max-width: 768px) {
    font-size: 11px;
    min-width: 22px;
  }
`

/* 底部导航 */
export const BottomNav = styled.nav`
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  gap: 4px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 -2px 14px rgba(0, 0, 0, 0.06);
  padding: 4px max(10px, env(safe-area-inset-left)) calc(4px + env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-right));
  z-index: 200;
`
export const NavItem = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: none;
  background: transparent;
  color: #9aa0b4;
  padding: 6px 4px 4px;
  cursor: pointer;
  border-radius: 12px;
  transition: color 0.2s ease, background-color 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  & svg {
    width: 22px;
    height: 22px;
    transition: transform 0.2s ease;
  }

  & .label {
    font-size: 12px;
    line-height: 1.2;
    font-weight: 500;
    white-space: nowrap;
  }

  &.active {
    color: #667eea;
  }
  &.active svg {
    transform: translateY(-1px) scale(1.05);
  }

  &:active {
    background: rgba(102, 126, 234, 0.12);
  }

  @media (max-width: 768px) {
    & svg {
      width: 20px;
      height: 20px;
    }
    & .label {
      font-size: 11px;
    }
  }
`
