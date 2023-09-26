import { createGlobalStyle } from 'styled-components';

import FuturaPTCondBold from './futura-pt-cond-bold.otf';
import FuturaPTCondExtraBold from './futura-pt-cond-extra-bold.otf';
import FuturaPTCondMedium from './futura-pt-cond-medium.otf';

export default createGlobalStyle`
  @font-face {
    font-display: swap;
    font-family: 'Futura';
    font-style: normal;
    font-weight: 500;
    src:
      local(${FuturaPTCondMedium}),
      url('futura-pt-cond-medium.otf') format('opentype');
  }

  @font-face {
    font-display: swap;
    font-family: 'Futura';
    font-style: normal;
    font-weight: 700;
    src:
      local('Futura PT Cond Bold'),
      url(${FuturaPTCondBold}) format('opentype');
  }

  @font-face {
    font-display: swap;
    font-family: 'Futura';
    font-style: normal;
    font-weight: 800;
    src:
      local('Futura PT Cond Extra Bold'),
      url(${FuturaPTCondExtraBold}) format('opentype');
  }
`;
