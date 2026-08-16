import React from 'react';
import { PlayerSide, PlayerStats, StoryAvatarId } from '../game-logic/gametypes';
import { UserIcon, BotIcon, TrophyIcon } from './Icons';
import { StoryAvatar } from './StoryAvatar';

interface PlayerPanelProps {
  stats: PlayerStats;
  isCurrentTurn: boolean;
  timeLeft?: number;
  isAI?: boolean;
  avatarId?: StoryAvatarId;
  position: 'top' | 'bottom';
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  stats,
  isCurrentTurn,
  timeLeft,
  isAI,
  avatarId,
  position
}) => {
  const isP1 = stats.id === PlayerSide.PLAYER1;

  return (
    <div
      className={`player-panel ${position} ${isCurrentTurn ? 'active-turn' : ''} ${
        isP1 ? 'player1-theme' : 'player2-theme'
      }`}
    >
      <div className="player-header">
        <div className="avatar-wrapper">
          <div className={`avatar-icon ${avatarId ? 'story-avatar-icon' : ''}`}>
            {avatarId ? (
              <StoryAvatar avatarId={avatarId} size={isAI ? 40 : 36} />
            ) : isAI ? (
              <BotIcon size={24} />
            ) : (
              <UserIcon size={24} />
            )}
          </div>
          {isCurrentTurn && <div className="turn-pulse" />}
        </div>
        <div className="player-meta">
          <div className="player-name-row">
            <span className="player-name">{stats.name}</span>
            {isCurrentTurn && (
              <span className="turn-badge">Đang đi lượt</span>
            )}
          </div>
          {isCurrentTurn && timeLeft !== undefined && timeLeft > 0 && (
            <div className="timer-bar-container">
              <div
                className="timer-bar"
                style={{ width: `${Math.min(100, (timeLeft / 60) * 100)}%` }}
              />
              <span className="timer-text">{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      <div className="score-basket">
        <div className="score-main">
          <TrophyIcon size={18} className="trophy-icon" />
          <span className="score-number">{stats.score}</span>
          <span className="score-label">điểm</span>
        </div>

        <div className="captured-details">
          <div className="captured-tag dan-tag" title="Số quân Dân đã ăn">
            <span className="stone-dot dan-dot" />
            <span className="tag-count">{stats.danCaptured}</span>
            <span className="tag-label">Dân</span>
          </div>

          <div className="captured-tag quan-tag" title="Số quân Quan đã ăn">
            <span className="stone-dot quan-dot" />
            <span className="tag-count">{stats.quanCaptured}</span>
            <span className="tag-label">Quan</span>
          </div>

          {stats.debt > 0 && (
            <div className="captured-tag debt-tag" title="Điểm nợ vay khi chầu quân">
              <span className="tag-count">-{stats.debt}</span>
              <span className="tag-label">Nợ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
