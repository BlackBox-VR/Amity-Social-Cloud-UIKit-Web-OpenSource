import React, { useState } from 'react';
import { Typography } from '~/v4/core/components';
import { Button } from '~/v4/core/natives/Button';
import styles from './TruncateText.module.css';
import clsx from 'clsx';

interface TruncateTextProps {
  text: string;
  lines?: number;
  className?: string;
  showSeeMore?: boolean;
  onSeeMore?: () => void;
}

export const TruncateText: React.FC<TruncateTextProps> = ({
  text,
  lines = 1,
  className,
  showSeeMore = false,
  onSeeMore,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSeeMore = () => {
    setIsExpanded(true);
    onSeeMore?.();
  };

  if (isExpanded) {
    return <div className={className}>{text}</div>;
  }

  return (
    <div className={styles.container}>
      <div
        className={clsx(styles.text, className)}
        style={{
          WebkitLineClamp: lines,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {text}
      </div>
      {showSeeMore && (
        <Button className={styles.seeMoreButton} onPress={handleSeeMore}>
          See more
        </Button>
      )}
    </div>
  );
};
