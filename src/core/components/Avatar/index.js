import React, { useState, useCallback } from 'react';
import cx from 'classnames';

import customizableComponent from '~/core/hocs/customization';
import withSize from '~/core/hocs/withSize';
import { backgroundImage as UserImage } from '~/icons/User';
import { formatCompactNumber } from '~/helpers/utils';
import GoldCup from '~/icons/GoldCup';

import { AvatarContainer, AvatarImage, Img, AvatarOverlay, Trophies } from './styles';

const Avatar = ({
  className,
  avatar = null,
  showOverlay,
  size,
  onClick,
  loading,
  trophies,
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  const onLoad = useCallback(() => setVisible(true), []);
  const onError = useCallback(() => setVisible(false), []);

  return (
    <AvatarContainer>
      <AvatarImage
        className={cx(className, { visible, clickable: !!onClick })}
        loading={loading}
        size={size}
        onClick={onClick}
        {...props}
      >
        {avatar && showOverlay ? (
          <AvatarOverlay {...props}>
            <Img src={avatar} onError={onError} onLoad={onLoad} />
          </AvatarOverlay>
        ) : (
          <Img src={avatar} onError={onError} onLoad={onLoad} />
        )}
      </AvatarImage>
      {!loading && !!trophies && (
        <Trophies>
          {formatCompactNumber(trophies)} <GoldCup />
        </Trophies>
      )}
    </AvatarContainer>
  );
};

Avatar.defaultProps = {
  backgroundImage: UserImage,
  loading: false,
};

export default customizableComponent('Avatar', withSize(Avatar));
