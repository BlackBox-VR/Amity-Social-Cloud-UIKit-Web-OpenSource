import styled from 'styled-components';

import UITabs from '~/core/components/Tabs';

export const Wrapper = styled.div`
  height: 100%;
  max-width: 550px;
  margin: 0 auto;
  padding: 0 0 80px 0px;
  overflow-y: auto;
`;

export const StyledTabs = styled(UITabs)`
  background: transparent;
  border: 0;
  margin-bottom: 10px;

  ul {
    display: flex;
    padding: 0;

    li {
      flex: 1;
      text-align: center;

      button {
        background: transparent;
        width: 100%;
        height: 100%;
        border-bottom: 1px solid #b1b1b1;
        font-weight: 400;
        margin: 0;

        &.active {
          border-bottom: 4px solid #ff00ff;
          color: white;
          font-weight: 700;
        }
      }
    }
  }
`;
