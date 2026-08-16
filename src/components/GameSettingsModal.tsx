import React from 'react';
import { GameSettings, AIDifficulty } from '../game-logic/gametypes';
import { XIcon, SettingsIcon } from './Icons';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSaveSettings: (newSettings: GameSettings) => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = React.useState<GameSettings>(settings);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleModeChange = (mode: 'pve' | 'pvp') => {
    setFormData(prev => ({ ...prev, gameMode: mode }));
  };

  const handleAIDifficulty = (diff: AIDifficulty) => {
    setFormData(prev => ({ ...prev, aiDifficulty: diff }));
  };

  const handleSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    setFormData(prev => ({ ...prev, animationSpeed: speed }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <SettingsIcon size={22} className="modal-icon" />
            <h2 className="modal-title">Cài Đặt Trò Chơi</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            <XIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Chế độ chơi */}
          <div className="form-group">
            <label className="form-label">Chế độ chơi</label>
            <div className="button-group">
              <button
                type="button"
                className={`group-btn ${formData.gameMode === 'pve' ? 'active' : ''}`}
                onClick={() => handleModeChange('pve')}
              >
                🤖 Chơi với Máy (PvE)
              </button>
              <button
                type="button"
                className={`group-btn ${formData.gameMode === 'pvp' ? 'active' : ''}`}
                onClick={() => handleModeChange('pvp')}
              >
                👥 2 Người chơi (PvP)
              </button>
            </div>
          </div>

          {/* Độ khó AI (chỉ hiện khi PvE) */}
          {formData.gameMode === 'pve' && (
            <div className="form-group animate-fade-in">
              <label className="form-label">
                Độ khó của Trí Tuệ Nhân Tạo (AI)
              </label>
              <div className="difficulty-grid">
                <button
                  type="button"
                  className={`diff-card ${formData.aiDifficulty === AIDifficulty.EASY ? 'active' : ''}`}
                  onClick={() => handleAIDifficulty(AIDifficulty.EASY)}
                >
                  <span className="diff-title">🟢 Dễ</span>
                  <span className="diff-desc">Đi ngẫu nhiên nhẹ nhàng, thích hợp làm quen luật</span>
                </button>

                <button
                  type="button"
                  className={`diff-card ${formData.aiDifficulty === AIDifficulty.MEDIUM ? 'active' : ''}`}
                  onClick={() => handleAIDifficulty(AIDifficulty.MEDIUM)}
                >
                  <span className="diff-title">🟡 Trung Bình</span>
                  <span className="diff-desc">Chiến thuật tham lam, ưu tiên ăn điểm ngay trước mắt</span>
                </button>

                <button
                  type="button"
                  className={`diff-card ${formData.aiDifficulty === AIDifficulty.HARD ? 'active' : ''}`}
                  onClick={() => handleAIDifficulty(AIDifficulty.HARD)}
                >
                  <span className="diff-title">🔴 Khó</span>
                  <span className="diff-desc">Minimax tính toán trước 3 nước đi và bảo vệ ô cờ</span>
                </button>

                <button
                  type="button"
                  className={`diff-card ${formData.aiDifficulty === AIDifficulty.MASTER ? 'active' : ''}`}
                  onClick={() => handleAIDifficulty(AIDifficulty.MASTER)}
                >
                  <span className="diff-title">👑 Cao Thủ</span>
                  <span className="diff-desc">Độ sâu 4 nước, hóa giải bẫy của đối thủ & chiếm ưu thế</span>
                </button>

                <button
                  type="button"
                  className={`diff-card grandmaster-card ${formData.aiDifficulty === AIDifficulty.GRANDMASTER ? 'active' : ''}`}
                  onClick={() => handleAIDifficulty(AIDifficulty.GRANDMASTER)}
                >
                  <span className="diff-title">⚡ Kiện Tướng Bất Bại</span>
                  <span className="diff-desc">Độ sâu 5-6 nước, gài bẫy liên hoàn, ép chầu quân & vét sỏi tàn cuộc</span>
                </button>
              </div>
            </div>
          )}

          {/* Tốc độ rải quân */}
          <div className="form-group">
            <label className="form-label">Tốc độ hoạt ảnh rải sỏi</label>
            <div className="button-group">
              <button
                type="button"
                className={`group-btn ${formData.animationSpeed === 'slow' ? 'active' : ''}`}
                onClick={() => handleSpeedChange('slow')}
              >
                Thư thái (Chậm)
              </button>
              <button
                type="button"
                className={`group-btn ${formData.animationSpeed === 'normal' ? 'active' : ''}`}
                onClick={() => handleSpeedChange('normal')}
              >
                Tiêu chuẩn
              </button>
              <button
                type="button"
                className={`group-btn ${formData.animationSpeed === 'fast' ? 'active' : ''}`}
                onClick={() => handleSpeedChange('fast')}
              >
                Nhanh
              </button>
            </div>
          </div>

          {/* Số quân ban đầu mỗi ô Dân */}
          <div className="form-group">
            <label className="form-label">
              Số sỏi mỗi ô Dân ban đầu: <strong>{formData.startingDanPerCell} viên</strong>
            </label>
            <input
              type="range"
              min="3"
              max="7"
              step="1"
              value={formData.startingDanPerCell}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  startingDanPerCell: Number(e.target.value)
                }))
              }
              className="range-input"
            />
            <div className="range-labels">
              <span>3 viên (Nhanh)</span>
              <span>5 viên (Chuẩn)</span>
              <span>7 viên (Dài)</span>
            </div>
          </div>

          {/* Âm thanh */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={e =>
                  setFormData(prev => ({ ...prev, soundEnabled: e.target.checked }))
                }
              />
              <span>Bật hiệu ứng âm thanh tiếng sỏi gỗ</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Áp Dụng & Bắt Đầu Ván Mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
