import styled, { keyframes } from 'styled-components';

export const MessageClaimWrapper = styled.div`
  border-top: 1px solid #666666;
  margin-top: 15px;
  padding-top: 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
`;

export const MessageClaimTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  text-transform: uppercase;
`;

export const MessageClaimContent = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
`;

const progress = keyframes`
  to {
    width: 100%;
  }
`

export const MessageClaimButton = styled.div`
  background-color: #0C6D3A;
  width: 97px;
  height: 31px;
  border-radius: 5px;
  border: 1px solid #888888;
  font-size: 14px;
  font-weight: 400;
  line-height: 29px;
  cursor: ${props => props.loading ? "not-allowed" : "pointer"};
  color: #FFFFFF;
  display: flex;
  flex-direction;
  justify-content: center;
  margin-top: 10px;
  position: relative;

  & > div {
    z-index: 1;
  }
  &:before {
    background: #16a085;
    position: absolute;
    content: "";
    top: 0;
    left: 0;
    height: 100%;
    width: 0;
    animation-name: ${props => props.loading ? progress : ""};
    animation-duration: 3s;
    animation-iteration-count: infinite;
  }
`;

export const MessageClaimButtonImg = styled.img`
  width: 14px;
  height: 14px;
  margin-left: 3px;
  margin-top: 7px;
  z-index: 1;
`;

export const MessageClaimButtonDisabled = styled.div`
  background-color: #3E4E53;
  width: 97px;
  height: 31px;
  border-radius: 5px;
  border: 1px solid #888888;
  font-size: 14px;
  font-weight: 400;
  line-height: 29px;
  cursor: not-allowed;
  color: #B8B8B8;
  margin-top: 10px;
`;
