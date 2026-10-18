import { styled } from '@linaria/react';

export const EditorWrap = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
  }
`

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 6px;
  background: #f8f9ff;
  border-bottom: 1px solid #ececf5;
  position: sticky;
  top: 0;
  z-index: 2;
`

export const ToolButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #5b6178;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  & svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba(102, 126, 234, 0.12);
    color: #667eea;
  }
  &.active {
    background: rgba(102, 126, 234, 0.18);
    color: #4f5bd5;
  }
  &:active {
    transform: scale(0.94);
  }
`

export const ToolDivider = styled.span`
  width: 1px;
  height: 18px;
  margin: 0 4px;
  background: #e0e0ec;
  flex-shrink: 0;
`

export const Editable = styled.div`
  min-height: 140px;
  max-height: 42vh;
  overflow-y: auto;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  outline: none;
  word-break: break-word;
  -webkit-overflow-scrolling: touch;

  &:empty::before {
    content: attr(data-placeholder);
    color: #aaa;
    pointer-events: none;
  }

  & h1,
  & h2,
  & h3 {
    font-size: 1.1em;
    font-weight: 700;
    margin: 0.4em 0;
    color: #222;
  }
  & p {
    margin: 0.35em 0;
  }
  & ul,
  & ol {
    padding-left: 1.4em;
    margin: 0.4em 0;
  }
  & li {
    margin: 0.15em 0;
  }
  & blockquote {
    margin: 0.5em 0;
    padding: 4px 10px;
    border-left: 3px solid #c7cdf5;
    color: #666;
    background: #f7f8ff;
    border-radius: 0 4px 4px 0;
  }
  & a {
    color: #667eea;
    text-decoration: underline;
  }
  & img {
    max-width: 100%;
    border-radius: 6px;
  }
`
