import styled from 'styled-components';

export const UIStyles = styled.div`
  ${({ theme }) => theme.typography.body};
  font-family: Roboto, sans-serif;
  color: ${({ theme }) => theme.palette.base.main};
  width: 100%;
  height: 100%;
  font-size: ${({ theme }) => theme.typography.body.fontSize};
  line-height: 1.5;
  overflow: hidden;

  input,
  div {
    box-sizing: border-box;
  }

  & pre {
    ${({ theme }) => theme.typography.body}
  }
`;
