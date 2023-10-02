import React from 'react';
import styled from 'styled-components';

const Svg = ({ color = 'blue' | 'gray' }) => (
  <svg width="84" height="30" viewBox="0 0 84 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Glass Panel Circle" filter="url(#filter0_b_1273_1045)">
      <g id="Rectangle">
        <rect width="84" height="30" rx="15" fill={color === 'blue' ? '#6366F1' : '#B1B1B1'} />
        <rect x="0.5" y="0.5" width="83" height="29" rx="14.5" stroke="white" strokeOpacity="0.2" />
      </g>
      <g id="Rectangle_2">
        <g filter="url(#filter1_i_1273_1045)">
          <rect
            width="84"
            height="25.9744"
            rx="12.9872"
            fill="url(#paint0_radial_1273_1045)"
            fillOpacity="0.49"
          />
        </g>
        <rect
          x="0.5"
          y="0.5"
          width="83"
          height="24.9744"
          rx="12.4872"
          stroke="url(#paint1_linear_1273_1045)"
          strokeOpacity="0.5"
        />
      </g>
    </g>
    <defs>
      <filter
        id="filter0_b_1273_1045"
        x="-40"
        y="-40"
        width="164"
        height="110"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feGaussianBlur in="BackgroundImageFix" stdDeviation="20" />
        <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_1273_1045" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_backgroundBlur_1273_1045"
          result="shape"
        />
      </filter>
      <filter
        id="filter1_i_1273_1045"
        x="0"
        y="0"
        width="84"
        height="29.9744"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1273_1045" />
      </filter>
      <radialGradient
        id="paint0_radial_1273_1045"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(42 12.9872) rotate(90) scale(12.9872 42)"
      >
        <stop stopColor="#838383" stopOpacity="0.22" />
        <stop offset="1" stopOpacity="0.28" />
      </radialGradient>
      <linearGradient
        id="paint1_linear_1273_1045"
        x1="42"
        y1="0"
        x2="42"
        y2="25.9744"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" stopOpacity="0.35" />
        <stop offset="1" stopColor="white" stopOpacity="0.35" />
      </linearGradient>
    </defs>
  </svg>
);

export default styled(Svg)``;

export const blueBackgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='30' viewBox='0 0 84 30' fill='none'%3E%3Cg filter='url(%23filter0_b_1273_1045)'%3E%3Crect width='84' height='30' rx='15' fill='%236366F1'/%3E%3Crect x='0.5' y='0.5' width='83' height='29' rx='14.5' stroke='white' stroke-opacity='0.2'/%3E%3Cg filter='url(%23filter1_i_1273_1045)'%3E%3Crect width='84' height='25.9744' rx='12.9872' fill='url(%23paint0_radial_1273_1045)' fill-opacity='0.49'/%3E%3C/g%3E%3Crect x='0.5' y='0.5' width='83' height='24.9744' rx='12.4872' stroke='url(%23paint1_linear_1273_1045)' stroke-opacity='0.5'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_b_1273_1045' x='-40' y='-40' width='164' height='110' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeGaussianBlur in='BackgroundImageFix' stdDeviation='20'/%3E%3CfeComposite in2='SourceAlpha' operator='in' result='effect1_backgroundBlur_1273_1045'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_backgroundBlur_1273_1045' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_i_1273_1045' x='0' y='0' width='84' height='29.9744' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='4'/%3E%3CfeGaussianBlur stdDeviation='2'/%3E%3CfeComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0'/%3E%3CfeBlend mode='normal' in2='shape' result='effect1_innerShadow_1273_1045'/%3E%3C/filter%3E%3CradialGradient id='paint0_radial_1273_1045' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(42 12.9872) rotate(90) scale(12.9872 42)'%3E%3Cstop stop-color='%23838383' stop-opacity='0.22'/%3E%3Cstop offset='1' stop-opacity='0.28'/%3E%3C/radialGradient%3E%3ClinearGradient id='paint1_linear_1273_1045' x1='42' y1='0' x2='42' y2='25.9744' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='white' stop-opacity='0.35'/%3E%3Cstop offset='1' stop-color='white' stop-opacity='0.35'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")`;

export const greyBackgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='30' viewBox='0 0 84 30' fill='none'%3E%3Cg filter='url(%23filter0_b_1273_1045)'%3E%3Crect width='84' height='30' rx='15' fill='%23B1B1B1'/%3E%3Crect x='0.5' y='0.5' width='83' height='29' rx='14.5' stroke='white' stroke-opacity='0.2'/%3E%3Cg filter='url(%23filter1_i_1273_1045)'%3E%3Crect width='84' height='25.9744' rx='12.9872' fill='url(%23paint0_radial_1273_1045)' fill-opacity='0.49'/%3E%3C/g%3E%3Crect x='0.5' y='0.5' width='83' height='24.9744' rx='12.4872' stroke='url(%23paint1_linear_1273_1045)' stroke-opacity='0.5'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_b_1273_1045' x='-40' y='-40' width='164' height='110' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeGaussianBlur in='BackgroundImageFix' stdDeviation='20'/%3E%3CfeComposite in2='SourceAlpha' operator='in' result='effect1_backgroundBlur_1273_1045'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_backgroundBlur_1273_1045' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_i_1273_1045' x='0' y='0' width='84' height='29.9744' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='4'/%3E%3CfeGaussianBlur stdDeviation='2'/%3E%3CfeComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0'/%3E%3CfeBlend mode='normal' in2='shape' result='effect1_innerShadow_1273_1045'/%3E%3C/filter%3E%3CradialGradient id='paint0_radial_1273_1045' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(42 12.9872) rotate(90) scale(12.9872 42)'%3E%3Cstop stop-color='%23838383' stop-opacity='0.22'/%3E%3Cstop offset='1' stop-opacity='0.28'/%3E%3C/radialGradient%3E%3ClinearGradient id='paint1_linear_1273_1045' x1='42' y1='0' x2='42' y2='25.9744' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='white' stop-opacity='0.35'/%3E%3Cstop offset='1' stop-color='white' stop-opacity='0.35'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")`;
