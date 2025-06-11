import React from 'react';
import styles from './UserName.module.css';
import { Typography } from '~/v4/core/components';
import { useAmityElement } from '~/v4/core/hooks/uikit';

interface UserNameProps {
  name: string;
  pageId?: string;
  componentId?: string;
}

export const UserName: React.FC<UserNameProps> = ({ name, pageId = '*', componentId = '*' }) => {
  const elementId = 'user_name';
  const { isExcluded, accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  if (isExcluded) return null;

  return (
    <div className={styles.userName__displayName} data-testid={accessibilityId}>
      <Typography.Headline>
        <div
          className={styles.userName__displayName__text}
          style={{
            WebkitLineClamp: 4,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {name}
        </div>
      </Typography.Headline>
    </div>
  );
};
