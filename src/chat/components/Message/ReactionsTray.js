import React, { forwardRef } from 'react';
import styled, { keyframes } from 'styled-components';

const growAndJiggle = keyframes`
  0% { transform: scale(0.4); }
  40% { transform: scale(1.2); }
  75% { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

const TrayWrapper = styled.div`
  position: fixed;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  transform: translate(-50%, -100%); // Center horizontally and move up by its full height
  display: flex;
  justify-content: center;
`;

const TrayContainer = styled.div`
  position: absolute;
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  padding: 2px 10px;
  z-index: 2; // Ensure it appears above the reactions and message
  animation: ${growAndJiggle} 0.45s ease-out;
`;

const ReactionButton = styled.button`
  background: none;
  border: none;
  font-size: 26px;
  padding: 4px;
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.3);
  }
`;

const reactions = ['❤️', '💪', '🎉', '😂', '☹️'];

const ReactionsTray = forwardRef(({ onReact, style }, ref) => {
  return (
    <TrayWrapper left={style.left} top={style.top}>
      <TrayContainer ref={ref}>
        {reactions.map((reaction) => (
          <ReactionButton key={reaction} onClick={() => onReact(reaction)}>
            {reaction}
          </ReactionButton>
        ))}
      </TrayContainer>
    </TrayWrapper>
  );
});

ReactionsTray.displayName = 'ReactionsTray';

export default ReactionsTray;
