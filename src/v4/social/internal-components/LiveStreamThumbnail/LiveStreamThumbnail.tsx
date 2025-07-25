import React from 'react';
import { useImage } from '~/v4/core/hooks/useImage';
import styles from './LiveStreamThumbnail.module.css';

type LiveStreamThumbnailProps = { fileId?: string; alt: string };

export function LiveStreamThumbnail({ fileId, alt }: LiveStreamThumbnailProps) {
  const videoThumbnailUrl = useImage({ fileId });

  return (
    <img
      alt={alt}
      loading="lazy"
      src={videoThumbnailUrl ?? '/livestream-default-thumbnail.png'}
      className={styles.liveStreamThumbnail}
    />
  );
}
