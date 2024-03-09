import styled from 'styled-components';

export const MessageClaimWrapper = styled.div`
  border-top: 1px solid #666666;
  margin-top: 15px;
  padding-top: 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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

export const MessageClaimButton = styled.div`
  background-color: #0C6D3A;
  width: 97px;
  height: 31px;
  border-radius: 5px;
  border: 1px solid #888888;
  font-size: 14px;
  font-weight: 400;
  line-height: 29px;
  cursor: pointer;
  color: #FFFFFF;
  display: flex;
  flex-direction;
  justify-content: center;
  margin-top: 10px;
`;

export const MessageClaimButtonImg = styled.img`
  width: 14px;
  height: 14px;
  margin-left: 3px;
  margin-top: 7px;
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
