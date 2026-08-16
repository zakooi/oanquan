import React from 'react';
import { PlayerSide, PlayerStats } from '../game-logic/gametypes';
import { TrophyIcon, SparklesIcon, RotateCcwIcon } from './Icons';

interface GameOverModalProps {
  isOpen: boolean;
  winner?: PlayerSide | 'DRAW';
  player1: PlayerStats;
  player2: PlayerStats;
  onNewGame: () => void;
  onReviewBoard: () => void;
  onOpenHistory: () => void;
  onOpenLeaderboard: () => void;
  onOpenShare: () => void;
  // Cốt truyện / Campaign
  narration?: string | null;
  stars?: number;
  isCampaign?: boolean;
  onNextChapter?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  player1,
  player2,
  onNewGame,
  onReviewBoard,
  onOpenHistory,
  onOpenLeaderboard,
  onOpenShare,
  narration,
  stars = 0,
  isCampaign = false,
  onNextChapter
}) => {
  if (!isOpen) return null;

  let title = 'Ván Đấu Hòa!';
  let subtitle = 'Cả hai người chơi đều có điểm số ngang tài ngang sức!';
  let winnerColor = 'text-amber-500';

  if (winner === PlayerSide.PLAYER1) {
    title = `🎉 ${player1.name} Chiến Thắng!`;
    subtitle = `Xuất sắc giành được ${player1.score} điểm!`;
    winnerColor = 'text-blue-500';
  } else if (winner === PlayerSide.PLAYER2) {
    title = `🎉 ${player2.name} Chiến Thắng!`;
    subtitle = `Giành chiến thắng với ${player2.score} điểm!`;
    winnerColor = 'text-red-500';
  }

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-container game-over-modal" onClick={e => e.stopPropagation()}>
        <div className="game-over-header">
          <div className="trophy-wrapper">
            <TrophyIcon size={54} className={`trophy-big ${winnerColor}`} />
            <SparklesIcon size={24} className="sparkle-top-right animate-spin-slow" />
          </div>
          <h2 className={`game-over-title ${winnerColor}`}>{title}</h2>
          <p className="game-over-subtitle">{subtitle}</p>
        </div>

        <div className="game-over-body">
          <div className="score-comparison-card">
            {/* Player 1 summary */}
            <div className={`player-summary ${winner === PlayerSide.PLAYER1 ? 'is-winner' : ''}`}>
              <div className="summary-name">{player1.name}</div>
              <div className="summary-total-score">{player1.score}</div>
              <div className="summary-label">Tổng Điểm</div>
              <div className="summary-stats-list">
                <div className="stat-item">
                  <span>Sỏi Dân:</span>
                  <strong>{player1.danCaptured}</strong>
                </div>
                <div className="stat-item">
                  <span>Quân Quan:</span>
                  <strong>{player1.quanCaptured}</strong>
                </div>
                {player1.debt > 0 && (
                  <div className="stat-item text-red-500">
                    <span>Nợ vay:</span>
                    <strong>-{player1.debt}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="vs-divider">VS</div>

            {/* Player 2 summary */}
            <div className={`player-summary ${winner === PlayerSide.PLAYER2 ? 'is-winner' : ''}`}>
              <div className="summary-name">{player2.name}</div>
              <div className="summary-total-score">{player2.score}</div>
              <div className="summary-label">Tổng Điểm</div>
              <div className="summary-stats-list">
                <div className="stat-item">
                  <span>Sỏi Dân:</span>
                  <strong>{player2.danCaptured}</strong>
                </div>
                <div className="stat-item">
                  <span>Quân Quan:</span>
                  <strong>{player2.quanCaptured}</strong>
                </div>
                {player2.debt > 0 && (
                  <div className="stat-item text-red-500">
                    <span>Nợ vay:</span>
                    <strong>-{player2.debt}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isCampaign && (
          <div className="campaign-result">
            <div className="campaign-result-stars">
              {[1, 2, 3].map(s => (
                <span key={s} className={`result-star ${s <= stars ? 'filled' : ''}`}>
                  ★
                </span>
              ))}
              <span className="campaign-result-stars-label">
                {stars > 0 ? `${stars}/3 sao` : 'Chưa giành sao'}
              </span>
            </div>
            {narration && <p className="campaign-result-narration">{narration}</p>}
          </div>
        )}

        <div className="modal-footer game-over-footer">
          {onNextChapter && (
            <button type="button" className="btn btn-primary btn-next-chapter" onClick={onNextChapter}>
              Mùa tiếp theo ➜
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onReviewBoard}>
            Xem Bàn Cờ
          </button>
          <button type="button" className="btn btn-secondary" onClick={onOpenLeaderboard}>
            🏆 Bảng Xếp Hạng
          </button>
          <button type="button" className="btn btn-secondary btn-share-highlight" onClick={onOpenShare}>
            <SparklesIcon size={16} />
            <span>Chia Sẻ</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={onOpenHistory}>
            Lịch Sử Lượt
          </button>
          <button type="button" className="btn btn-primary" onClick={onNewGame}>
            <RotateCcwIcon size={18} />
            <span>Chơi Ván Mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};
