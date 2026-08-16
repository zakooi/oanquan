import React, { useEffect, useState } from 'react';
import { CampaignChapter } from '../game-logic/gametypes';
import { CAMPAIGN_CHAPTERS, getCharacterById } from '../game-logic/storydata';
import { campaignManager } from '../utils/campaignManager';
import { StoryAvatar } from './StoryAvatar';
import { XIcon, TrophyIcon } from './Icons';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (chapter: CampaignChapter) => void;
}

export const CampaignModal: React.FC<CampaignModalProps> = ({ isOpen, onClose, onSelectChapter }) => {
  const [playerName, setPlayerName] = useState<string>(campaignManager.getPlayerName());

  useEffect(() => {
    if (isOpen) {
      setPlayerName(campaignManager.getPlayerName());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRename = () => {
    campaignManager.setPlayerName(playerName);
  };

  const totalStars = campaignManager.getTotalStars();
  const completed = campaignManager.isCampaignComplete();

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-container campaign-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">🏡</span>
            <div>
              <h2 className="modal-title">Hành Trình Làng Đôi Bờ</h2>
              <p className="campaign-subtitle">
                Mỗi ván cờ là một mùa thu hoạch. Đánh bại các kỳ thủ để giành Giỏ Thóc Vàng!
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            <XIcon size={20} />
          </button>
        </div>

        <div className="modal-body campaign-body">
          {/* Thanh tên người chơi + tổng sao */}
          <div className="campaign-profile-bar">
            <div className="campaign-name-field">
              <label className="form-label">Tên của bạn (Nông Dân bờ Nam)</label>
              <div className="campaign-name-input-row">
                <input
                  className="text-input"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Ví dụ: Chú Tư"
                  maxLength={24}
                />
                <button type="button" className="btn btn-secondary" onClick={handleRename}>
                  Lưu tên
                </button>
              </div>
            </div>
            <div className="campaign-star-total">
              <TrophyIcon size={18} className="trophy-icon" />
              <span className="campaign-star-count">{totalStars}</span>
              <span className="campaign-star-max">/ {CAMPAIGN_CHAPTERS.length * 3} ⭐</span>
              {completed && <span className="campaign-complete-badge">🏆 Hoàn thành!</span>}
            </div>
          </div>

          {/* Lưới chương */}
          <div className="campaign-chapters">
            {CAMPAIGN_CHAPTERS.map(chapter => {
              const opponent = getCharacterById(chapter.opponentId);
              const unlocked = campaignManager.isChapterUnlocked(chapter.id);
              const stars = campaignManager.getStars(chapter.id);
              const modifier = chapter.modifier;

              return (
                <button
                  key={chapter.id}
                  type="button"
                  className={`chapter-card ${unlocked ? 'chapter-unlocked' : 'chapter-locked'}`}
                  onClick={() => unlocked && onSelectChapter(chapter)}
                  disabled={!unlocked}
                  style={unlocked ? { borderColor: `${opponent.color}88` } : undefined}
                >
                  <div className="chapter-card-top">
                    <span className="chapter-emoji">{chapter.seasonEmoji}</span>
                    <div className="chapter-stars">
                      {[1, 2, 3].map(s => (
                        <span key={s} className={`chapter-star ${s <= stars ? 'filled' : ''}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="chapter-number">Mùa {chapter.id}</div>
                  <div className="chapter-name">{chapter.seasonName}</div>

                  {unlocked ? (
                    <>
                      <div className="chapter-opponent">
                        <StoryAvatar avatarId={opponent.avatarId} size={40} />
                        <div className="chapter-opponent-meta">
                          <span className="chapter-opponent-name" style={{ color: opponent.color }}>
                            {opponent.name}
                          </span>
                          <span className="chapter-opponent-title">{opponent.title}</span>
                        </div>
                      </div>
                      {modifier && (
                        <div className="chapter-modifier" title={modifier.description}>
                          {modifier.seasonEmoji} {modifier.seasonName}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="chapter-lock">
                      <span>🔒</span>
                      <span>Thắng Mùa {chapter.id - 1} để mở khóa</span>
                    </div>
                  )}

                  {unlocked && <div className="chapter-reward">🎁 {chapter.reward}</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal-footer campaign-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
