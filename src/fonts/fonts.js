import { createGlobalStyle } from 'styled-components';

import FuturaPTCondBold from './futura/futura-pt-cond-bold.otf';
import FuturaPTCondExtraBold from './futura/futura-pt-cond-extra-bold.otf';
import FuturaPTCondMedium from './futura/futura-pt-cond-medium.otf';

import Roboto100 from './roboto/roboto-100.woff2';
import Roboto100Italic from './roboto/roboto-100italic.woff2';
import Roboto300 from './roboto/roboto-300.woff2';
import Roboto300Italic from './roboto/roboto-300italic.woff2';
import RobotoRegular from './roboto/roboto-regular.woff2';
import RobotoItalic from './roboto/roboto-italic.woff2';
import Roboto500 from './roboto/roboto-500.woff2';
import Roboto500Italic from './roboto/roboto-500italic.woff2';
import Roboto700 from './roboto/roboto-700.woff2';
import Roboto900 from './roboto/roboto-900.woff2';
import Roboto700Italic from './roboto/roboto-700italic.woff2';
import Roboto900Italic from './roboto/roboto-900italic.woff2';

export default createGlobalStyle`
  /* Futura  */
  @font-face {
    font-display: swap;
    font-family: 'Futura';
    font-style: normal;
    font-weight: 500;
    src:
      local('Futura PT Cond Medium'),
      url(${FuturaPTCondMedium}) format('opentype');
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

  /* Roboto */
  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 100;
    src:
      local('Roboto Thin'),
      local('Roboto-Thin'),
      url(${Roboto100}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: italic;
    font-weight: 100;
    src:
      local('Roboto Thin Italic'),
      local('Roboto-ThinItalic'),
      url(${Roboto100Italic}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 300;
    src:
      local('Roboto Light'),
      local('Roboto-Light'),
      url(${Roboto300}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: italic;
    font-weight: 300;
    src:
      local('Roboto Light Italic'),
      local('Roboto-LightItalic'),
      url(${Roboto300Italic}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    src:
      local('Roboto'),
      local('Roboto-Regular'),
      url(${RobotoRegular}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: italic;
    font-weight: 400;
    src:
      local('Roboto Italic'),
      local('Roboto-Italic'),
      url(${RobotoItalic}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    src:
      local('Roboto Medium'),
      local('Roboto-Medium'),
      url(${Roboto500}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: italic;
    font-weight: 500;
    src:
      local('Roboto Medium Italic'),
      local('Roboto-MediumItalic'),
      url(${Roboto500Italic}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    src:
      local('Roboto Bold'),
      local('Roboto-Bold'),
      url(${Roboto700}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 900;
    src:
      local('Roboto Black'),
      local('Roboto-Black'),
      url(${Roboto900}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: italic;
    font-weight: 700;
    src:
      local('Roboto Bold Italic'),
      local('Roboto-BoldItalic'),
      url(${Roboto700Italic}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: italic;
    font-weight: 900;
    src:
      local('Roboto Black Italic'),
      local('Roboto-BlackItalic'),
      url(${Roboto900Italic}) format('woff2');
  }
`;
