import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import React, { useMemo, useState } from 'react';
import { SerializedLexicalNode, SerializedParagraphNode } from 'lexical';
import { Mentioned, Mentionees } from '~/v4/helpers/utils';
import { useNavigation } from '~/v4/core/providers/NavigationProvider';
import {
  MentionData,
  textToEditorState,
  $isSerializedTextNode,
  $isSerializedLinkNode,
  $isSerializedMentionNode,
  $isSerializedAutoLinkNode,
} from '~/v4/social/internal-components/Lexical/utils';
import { Typography } from '~/v4/core/components';
import { Button } from '~/v4/core/natives/Button/Button';
import styles from './TextWithMention.module.css';

type TextWithMentionProps = {
  pageId?: string;
  isBold?: boolean;
  maxLines?: number;
  componentId?: string;
  data: { text: string };
  mentionees: Mentionees;
  metadata?: { mentioned?: Mentioned[] };
};

export const TextWithMention = ({
  pageId = '*',
  componentId = '*',
  isBold = false,
  maxLines = 2,
  data,
  mentionees,
  metadata,
}: TextWithMentionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { goToUserProfilePage } = useNavigation();
  const editorState = useMemo(
    () => textToEditorState({ data, mentionees, metadata }),
    [data, mentionees, metadata],
  );

  const Component = isBold ? Typography.Headline : Typography.Body;

  const convertSerializedToText = (node: SerializedLexicalNode, key: number) => {
    if ($isSerializedTextNode(node)) {
      return <span key={key}>{node.text}</span>;
    }

    if ($isSerializedLinkNode(node)) {
      return (
        <a
          key={key}
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.textWithMention__link}
        >
          {node.children.map((child, index) => convertSerializedToText(child, index))}
        </a>
      );
    }

    if ($isSerializedMentionNode<MentionData>(node)) {
      const userMention = mentionees.find(
        (m) => m.type === 'user' && m.userIds?.includes(node.data.userId),
      );
      if (userMention) {
        return (
          <span
            key={key}
            className={styles.textWithMention__mention}
            onClick={() => goToUserProfilePage(node.data.userId)}
          >
            @{node.data.displayName || node.data.userId}
          </span>
        );
      }
      return null;
    }

    if ($isSerializedAutoLinkNode(node)) {
      return (
        <a
          key={key}
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.textWithMention__link}
        >
          {node.children.map((child, index) => convertSerializedToText(child, index))}
        </a>
      );
    }

    return null;
  };

  const renderText = (paragraph: SerializedParagraphNode[]) => {
    return paragraph.map((p, index) => (
      <span key={index}>
        {p.children.map((child, childIndex) => convertSerializedToText(child, childIndex))}
        <br />
      </span>
    ));
  };

  return (
    <Component className={styles.textWithMention__container}>
      {isExpanded ? (
        renderText(editorState.root.children)
      ) : (
        <div className={styles.truncateContainer}>
          <div
            className={styles.text}
            style={{
              WebkitLineClamp: maxLines,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {renderText(editorState.root.children)}
          </div>
          <Button className={styles.textWithMention__seeMore} onPress={() => setIsExpanded(true)}>
            See more
          </Button>
        </div>
      )}
    </Component>
  );
};
