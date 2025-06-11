import React, { ReactNode, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import clsx from 'clsx';
import { findChunks, Mentioned } from '~/v4/helpers/utils';
import { processChunks } from '~/core/components/ChunkHighlighter';
import Linkify from '~/core/components/Linkify';
import { TruncateText } from '~/v4/core/components/TruncateText/TruncateText';
import styles from './CommentText.module.css';

interface MentionHighlightTagProps {
  children: ReactNode;
  mentionee: Mentioned;
}

const MentionHighlightTag: React.FC<MentionHighlightTagProps> = ({ children, mentionee }) => {
  return (
    <span className={styles.mentionHighlightTag} data-user-id={mentionee.userId}>
      {children}
    </span>
  );
};

interface CommentTextProps {
  text?: string;
  className?: string;
  mentionees?: Mentioned[];
  maxLines?: number;
}

const COMMENT_MAX_LINES = 8;

export const CommentText: React.FC<CommentTextProps> = ({
  text,
  className,
  mentionees,
  maxLines = COMMENT_MAX_LINES,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const chunks = useMemo(
    () => processChunks(text || '', findChunks(mentionees)),
    [mentionees, text],
  );

  const expand = () => setIsExpanded(true);

  const textContent = text ? (
    <div data-testid="comment-content" className={clsx(styles.commentContent, className)}>
      {chunks.map((chunk) => {
        const key = `${text}-${chunk.start}-${chunk.end}`;
        const sub = text.substring(chunk.start, chunk.end);
        if (chunk.highlight) {
          const mentionee = mentionees?.find((m) => m.index === chunk.start);
          if (mentionee) {
            return (
              <MentionHighlightTag key={key} mentionee={mentionee}>
                {sub}
              </MentionHighlightTag>
            );
          }
          return <span key={key}>{sub}</span>;
        }
        return <Linkify key={key}>{sub}</Linkify>;
      })}
    </div>
  ) : null;

  if (isExpanded) {
    return textContent;
  }

  return textContent ? (
    <div className={styles.truncateContainer}>
      <div
        className={clsx(styles.text, className)}
        style={{
          WebkitLineClamp: maxLines,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {textContent}
      </div>
      <button className={styles.readMoreButton} onClick={expand}>
        <FormattedMessage id="comment.readmore" />
      </button>
    </div>
  ) : null;
};
