import React, { useState, useEffect } from 'react';
import { MatchRecord, AIDifficulty, LeaderboardStats } from '../game-logic/gametypes';
import { leaderboardManager } from '../utils/leaderboardManager';
import { XIcon, TrophyIcon, Trash2Icon } from './Icons';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pve' | 'pvp' | 'all'>('pve');
  const [pveDiffFilter, setPveDiffFilter] = useState<AIDifficulty | 'ALL'>('ALL');
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  const loadData = () => {
    setMatches(leaderboardManager.getMatches());
    setStats(leaderboardManager.getStats());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setShowConfirmClear(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    leaderboardManager.clearAllRecords();
    loadData();
    setShowConfirmClear(false);
  };

  // Filter and sort records
  let displayedMatches: MatchRecord[] = [];
  if (activeTab === 'pve') {
    displayedMatches = leaderboardManager.getTopPvEScores(pveDiffFilter);
  } else if (activeTab === 'pvp') {
    displayedMatches = leaderboardManager.getTopPvPMatches();
  } else {
    displayedMatches = [...matches].sort((a, b) => b.timestamp - a.timestamp);
  }

  const getDifficultyLabel = (diff?: AIDifficulty) => {
    switch (diff) {
      case AIDifficulty.EASY:
        return '🟢 Dễ';
      case AIDifficulty.MEDIUM:
        return '🟡 Trung Bình';
      case AIDifficulty.HARD:
        return '🔴 Khó';
      case AIDifficulty.MASTER:
        return '👑 Cao Thủ';
      case AIDifficulty.GRANDMASTER:
        return '⚡ Kiện Tướng';
      default:
        return '';
    }
  };

  const getMedalBadge = (index: number) => {
    if (index === 0) return <span className="medal-badge gold">🥇 #1</span>;
    if (index === 1) return <span className="medal-badge silver">🥈 #2</span>;
    if (index === 2) return <span className="medal-badge bronze">🥉 #3</span>;
    return <span className="medal-badge normal">#{index + 1}</span>;
  };

  const winRate =
    stats && stats.pveMatches > 0
      ? Math.round((stats.pveWins / stats.pveMatches) * 100)
      : 0;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-container leaderboard-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <TrophyIcon size={24} className="trophy-gold-icon" />
            <h2 className="modal-title">Bảng Xếp Hạng & Lịch Sử Ván Đấu</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            <XIcon size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Stats Grid */}
          {stats && (
            <div className="leaderboard-stats-grid">
              <div className="stat-card">
                <span className="stat-value">{stats.totalMatches}</span>
                <span className="stat-label">Tổng Ván Đã Chơi</span>
              </div>
              <div className="stat-card">
                <span className="stat-value text-gold">{stats.highestScore}đ</span>
                <span className="stat-label">Kỷ Lục Điểm Cao</span>
              </div>
              <div className="stat-card">
                <span className="stat-value text-emerald">{winRate}%</span>
                <span className="stat-label">Tỷ Lệ Thắng PvE</span>
              </div>
              <div className="stat-card">
                <span className="stat-value text-ruby">{stats.totalQuansCaptured}</span>
                <span className="stat-label">Tổng Quan Đã Bắt</span>
              </div>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="leaderboard-tabs">
            <button
              className={`tab-btn ${activeTab === 'pve' ? 'active' : ''}`}
              onClick={() => setActiveTab('pve')}
            >
              🤖 Đấu Với Máy (PvE)
            </button>
            <button
              className={`tab-btn ${activeTab === 'pvp' ? 'active' : ''}`}
              onClick={() => setActiveTab('pvp')}
            >
              👥 2 Người Chơi (PvP)
            </button>
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              📜 Tất Cả Ván Đấu
            </button>
          </div>

          {/* PvE Difficulty Filter Sub-bar */}
          {activeTab === 'pve' && (
            <div className="pve-filter-bar">
              <span className="filter-label">Cấp độ:</span>
              <button
                className={`filter-pill ${pveDiffFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setPveDiffFilter('ALL')}
              >
                Tất Cả
              </button>
              <button
                className={`filter-pill ${pveDiffFilter === AIDifficulty.EASY ? 'active' : ''}`}
                onClick={() => setPveDiffFilter(AIDifficulty.EASY)}
              >
                Dễ
              </button>
              <button
                className={`filter-pill ${pveDiffFilter === AIDifficulty.MEDIUM ? 'active' : ''}`}
                onClick={() => setPveDiffFilter(AIDifficulty.MEDIUM)}
              >
                Trung Bình
              </button>
              <button
                className={`filter-pill ${pveDiffFilter === AIDifficulty.HARD ? 'active' : ''}`}
                onClick={() => setPveDiffFilter(AIDifficulty.HARD)}
              >
                Khó
              </button>
              <button
                className={`filter-pill ${pveDiffFilter === AIDifficulty.MASTER ? 'active' : ''}`}
                onClick={() => setPveDiffFilter(AIDifficulty.MASTER)}
              >
                Cao Thủ
              </button>
              <button
                className={`filter-pill ${pveDiffFilter === AIDifficulty.GRANDMASTER ? 'active' : ''}`}
                onClick={() => setPveDiffFilter(AIDifficulty.GRANDMASTER)}
              >
                Kiện Tướng
              </button>
            </div>
          )}

          {/* Match List */}
          <div className="leaderboard-list-wrap">
            {displayedMatches.length === 0 ? (
              <div className="empty-leaderboard">
                <span className="empty-icon">🏮</span>
                <p>Chưa có ván đấu nào ở mục này. Hãy bắt đầu chơi ván mới!</p>
              </div>
            ) : (
              <div className="leaderboard-table">
                {displayedMatches.map((m, idx) => {
                  const isP1Win = m.winner === 'PLAYER1';
                  const isP2Win = m.winner === 'PLAYER2';
                  const isDraw = m.winner === 'DRAW';

                  return (
                    <div
                      key={m.id}
                      className={`leaderboard-row ${idx < 3 ? `top-rank-${idx + 1}` : ''}`}
                    >
                      {/* Medal or Rank */}
                      <div className="rank-col">{getMedalBadge(idx)}</div>

                      {/* Main Match Info */}
                      <div className="match-info-col">
                        <div className="match-players-line">
                          <span
                            className={`player-summary ${isP1Win ? 'winner' : ''}`}
                          >
                            {m.player1.name}: <strong>{m.player1.score}đ</strong>
                            {m.player1.quanCaptured > 0 && (
                              <span className="quan-tag"> ({m.player1.quanCaptured}👑)</span>
                            )}
                          </span>

                          <span className="vs-tag">vs</span>

                          <span
                            className={`player-summary ${isP2Win ? 'winner' : ''}`}
                          >
                            {m.player2.name}: <strong>{m.player2.score}đ</strong>
                            {m.player2.quanCaptured > 0 && (
                              <span className="quan-tag"> ({m.player2.quanCaptured}👑)</span>
                            )}
                          </span>
                        </div>

                        <div className="match-meta-line">
                          <span className="meta-badge mode-badge">
                            {m.gameMode === 'pve' ? '🤖 PvE' : '👥 PvP'}
                          </span>
                          {m.aiDifficulty && (
                            <span className="meta-badge diff-badge">
                              {getDifficultyLabel(m.aiDifficulty)}
                            </span>
                          )}
                          <span className="meta-badge board-badge">
                            {m.boardMode === '3d' ? '✨ 3D' : '📜 2D'}
                          </span>
                          <span className="meta-text">{m.totalTurns} lượt</span>
                          <span className="meta-text date-text">{m.dateFormatted}</span>
                        </div>
                      </div>

                      {/* Result Tag */}
                      <div className="result-col">
                        {isDraw ? (
                          <span className="res-badge draw">HÒA</span>
                        ) : isP1Win ? (
                          <span className="res-badge win">THẮNG</span>
                        ) : (
                          <span className="res-badge loss">THUA</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm Clear Bar */}
          {showConfirmClear && (
            <div className="confirm-clear-bar animate-fade-in">
              <span>Bạn có chắc chắn muốn xóa toàn bộ lịch sử xếp hạng không?</span>
              <div className="confirm-buttons">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowConfirmClear(false)}
                >
                  Hủy
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleClear}>
                  Xác Nhận Xóa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer leaderboard-footer">
          <button
            className="btn btn-outline-danger"
            onClick={() => setShowConfirmClear(true)}
            title="Xóa toàn bộ dữ liệu lịch sử"
          >
            <Trash2Icon size={16} />
            <span>Xóa Lịch Sử</span>
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
