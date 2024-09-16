import React from 'react';
import styled from 'styled-components';

const TrayContainer = styled.div`
  position: absolute;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  display: flex;
  padding: 5px;
`;

const ReactionButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  padding: 5px;
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.2);
  }
`;

const reactions = ['❤️', '💪', '🎉', '😂', '☹️'];

const ReactionsTray = ({ onReact, style }) => {
  return (
    <TrayContainer style={style}>
      {reactions.map((reaction) => (
        <ReactionButton key={reaction} onClick={() => onReact(reaction)}>
          {reaction}
        </ReactionButton>
      ))}
    </TrayContainer>
  );
};

export default ReactionsTray;