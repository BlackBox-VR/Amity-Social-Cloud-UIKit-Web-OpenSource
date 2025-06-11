import React from 'react';
import { Typography } from '~/v4/core/components';
import { TruncateText } from '~/v4/core/components/TruncateText/TruncateText';
import styles from './UserDescription.module.css';

interface UserDescriptionProps {
  description?: string;
  className?: string;
}

export const UserDescription: React.FC<UserDescriptionProps> = ({ description, className }) => {
  if (!description) return null;

  return (
    <div className={styles.container}>
      <TruncateText text={description} lines={2} className={styles.description} showSeeMore />
    </div>
  );
};
