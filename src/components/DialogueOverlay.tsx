import React from 'react';
import { StoryAvatarId } from '../game-logic/gametypes';
import { StoryAvatar } from './StoryAvatar';

interface DialogueOverlayProps {
  line: string;
  speakerName: string;
  speakerTitle?: string;
  avatarId: StoryAvatarId;
  color?: string;
  side?: 'left' | 'right';
}

/**
 * Bong bóng thoại kể chuyện (không chặn thao tác bàn cờ).
 * Cha (App) tự quản lý việc hiện/ẩn theo thời gian.
 */
export const DialogueOverlay: React.FC<DialogueOverlayProps> = ({
  line,
  speakerName,
  speakerTitle,
  avatarId,
  color = '#f59e0b',
  side = 'left'
}) => {
  return (
    <div className={`dialogue-overlay ${side === 'right' ? 'dialogue-right' : ''}`}>
      <div className="dialogue-bubble" style={{ borderColor: color }}>
        <div className="dialogue-avatar" style={{ boxShadow: `0 0 12px ${color}66` }}>
          <StoryAvatar avatarId={avatarId} size={56} />
        </div>
        <div className="dialogue-content">
          <div className="dialogue-speaker" style={{ color }}>
            {speakerName}
            {speakerTitle && <span className="dialogue-title">{speakerTitle}</span>}
          </div>
          <p className="dialogue-line">{line}</p>
        </div>
      </div>
    </div>
  );
};
