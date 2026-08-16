import React from 'react';
import { MoveLog, PlayerSide } from '../game-logic/gametypes';
import { XIcon, HistoryIcon, ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface MoveHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: MoveLog[];
}

export const MoveHistoryDrawer: React.FC<MoveHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history
}) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop animate-fade-in" onClick={onClose}>
      <div className="drawer-container animate-slide-in-right" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <HistoryIcon size={22} className="text-amber-500" />
            <h2 className="drawer-title">Lịch Sử Nước Đi ({history.length})</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Đóng">
            <XIcon size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {history.length === 0 ? (
            <div className="empty-history">
              <HistoryIcon size={40} className="empty-icon" />
              <p>Chưa có nước đi nào trong ván này</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((move, idx) => {
                const isP1 = move.player === PlayerSide.PLAYER1;
                return (
                  <div
                    key={idx}
                    className={`history-card ${isP1 ? 'p1-history' : 'p2-history'}`}
                  >
                    <div className="history-card-header">
                      <span className="history-turn-badge">Lượt #{move.turnNumber}</span>
                      <span className="history-player-name">
                        {isP1 ? 'Người chơi 1' : 'Người chơi 2'}
                      </span>
                    </div>

                    <div className="history-action-row">
                      <div className="action-tag">
                        Bắt đầu từ <strong>Ô {move.startCell}</strong>
                      </div>
                      <div className="action-tag dir-tag">
                        {move.relativeDirection === 'LEFT' ? (
                          <>
                            <ArrowLeftIcon size={14} /> <span>Trái</span>
                          </>
                        ) : (
                          <>
                            <span>Phải</span> <ArrowRightIcon size={14} />
                          </>
                        )}
                      </div>
                    </div>

                    {move.pointsEarned > 0 ? (
                      <div className="history-points-earned">
                        🎉 Thu hoạch: <strong>+{move.pointsEarned} điểm</strong> ({move.capturedDan} Dân, {move.capturedQuan} Quan)
                      </div>
                    ) : (
                      <div className="history-points-zero">Không ăn được quân nào</div>
                    )}

                    <details className="history-steps-accordion">
                      <summary>Chi tiết các bước ({move.steps.length} bước)</summary>
                      <ul className="steps-list">
                        {move.steps.map((step, sIdx) => (
                          <li key={sIdx} className={`step-item step-${step.type.toLowerCase()}`}>
                            <span className="step-num">{sIdx + 1}.</span>
                            <span className="step-desc">{step.description}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
