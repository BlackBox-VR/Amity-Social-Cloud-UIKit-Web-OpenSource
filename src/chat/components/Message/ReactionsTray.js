import React, { forwardRef } from 'react';
import styled from 'styled-components';

const TrayContainer = styled.div`
  position: absolute;
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  padding: 3px 10px;
  z-index: 2; // Ensure it appears above the reactions and message
`;

const ReactionButton = styled.button`
  background: none;
  border: none;
  font-size: 22px;
  padding: 5px;
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.3);
  }
`;

const reactions = ['❤️', '💪', '🎉', '😂', '☹️'];

const ReactionsTray = forwardRef(({ onReact, style }, ref) => {
  return (
    <TrayContainer ref={ref} style={style}>
      {reactions.map((reaction) => (
        <ReactionButton key={reaction} onClick={() => onReact(reaction)}>
          {reaction}
        </ReactionButton>
      ))}
    </TrayContainer>
  );
});

ReactionsTray.displayName = 'ReactionsTray';

export default ReactionsTray;
