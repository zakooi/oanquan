import React, { useState, useRef } from 'react';
import { MatchRecord } from '../game-logic/gametypes';
import { QuanLaiAvatar, NongDanAvatar } from './CharacterAvatars';
import { XIcon, Share2Icon, DownloadIcon, CopyIcon, CheckIcon, SparklesIcon } from './Icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchRecord?: MatchRecord | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, matchRecord }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3005';
  const playerName = matchRecord?.player1.name || 'Người Chơi';
  const playerScore = matchRecord?.player1.score || 35;
  const quanCount = matchRecord?.player1.quanCaptured || 2;
  const gameModeText = matchRecord?.gameMode === 'pve' ? 'Đấu Với Máy (AI)' : '2 Người Chơi (PvP)';

  const shareText = `🏮 Tôi vừa đạt ${playerScore} điểm (ăn ${quanCount} Quan 👑) trong trò chơi Ô Ăn Quan 3D Cổ Truyền Việt Nam! Bạn có dám thách đấu cùng tôi không? 👉 ${currentUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ô Ăn Quan 3D - Trò Chơi Dân Gian Việt Nam',
          text: shareText,
          url: currentUrl
        });
      } catch (err) {
        console.log('Share dismissed or cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadImage = () => {
    // Generate Canvas certificate download
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient (Gấm đỏ hoàng cung & Gỗ gụ)
    const bgGrad = ctx.createLinearGradient(0, 0, 600, 420);
    bgGrad.addColorStop(0, '#2d140b');
    bgGrad.addColorStop(0.5, '#451a03');
    bgGrad.addColorStop(1, '#1c0d07');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 420);

    // Border Royal Gold
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 568, 388);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, 552, 372);

    // Title
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 28px "Segoe UI", Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏮 CHIẾU CHỈ VINH DANH TRẠNG NGUYÊN 🏮', 300, 75);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px "Segoe UI", Tahoma, sans-serif';
    ctx.fillText('Ô ĂN QUAN 3D - DÂN GIAN VIỆT NAM', 300, 110);

    // Separator Line
    ctx.beginPath();
    ctx.moveTo(80, 125);
    ctx.lineTo(520, 125);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Player stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px "Segoe UI", Tahoma, sans-serif';
    ctx.fillText(`Người chơi: ${playerName}`, 300, 175);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 42px "Segoe UI", Tahoma, sans-serif';
    ctx.fillText(`TỔNG ĐIỂM: ${playerScore} ĐIỂM`, 300, 235);

    ctx.fillStyle = '#fde68a';
    ctx.font = '18px "Segoe UI", Tahoma, sans-serif';
    ctx.fillText(`👑 Thu phục: ${quanCount} Quan  •  Chế độ: ${gameModeText}`, 300, 280);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'italic 16px "Segoe UI", Tahoma, sans-serif';
    ctx.fillText('🏆 "Kỳ Thủ Đệ Nhất - Trí Tuệ Dân Gian"', 300, 320);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px "Segoe UI", Tahoma, sans-serif';
    ctx.fillText(`Chơi ngay tại: ${currentUrl}`, 300, 365);

    // Trigger Download
    const link = document.createElement('a');
    link.download = `OAnQuan3D_ThanhTich_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentUrl
    )}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      currentUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-container share-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Share2Icon size={24} className="trophy-gold-icon" />
            <h2 className="modal-title">Chia Sẻ & Quảng Bá Trò Chơi</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            <XIcon size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Certificate Card Preview */}
          <div className="certificate-card" ref={cardRef}>
            <div className="cert-corner top-left">🏮</div>
            <div className="cert-corner top-right">🏮</div>
            <div className="cert-corner bottom-left">👑</div>
            <div className="cert-corner bottom-right">👑</div>

            <div className="cert-header">
              <span className="cert-badge">CHIẾU CHỈ HOÀNG TỘC</span>
              <h3 className="cert-title">VINH DANH KỲ THỦ Ô ĂN QUAN</h3>
            </div>

            <div className="cert-avatars-row">
              <QuanLaiAvatar size={44} />
              <div className="cert-score-wrap">
                <span className="cert-score-num">{playerScore}</span>
                <span className="cert-score-lbl">ĐIỂM CHIẾN THẮNG</span>
              </div>
              <NongDanAvatar size={44} />
            </div>

            <div className="cert-details">
              <div className="cert-detail-item">
                <span>Kỳ thủ:</span>
                <strong>{playerName}</strong>
              </div>
              <div className="cert-detail-item">
                <span>Quan thu phục:</span>
                <strong className="text-gold">{quanCount} 👑</strong>
              </div>
              <div className="cert-detail-item">
                <span>Thể thức:</span>
                <strong>{gameModeText}</strong>
              </div>
            </div>

            <div className="cert-footer-quote">
              <SparklesIcon size={14} />
              <span>Kỳ Tài Xuất Chúng - Đệ Nhất Bàn Cờ Dân Gian</span>
              <SparklesIcon size={14} />
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="share-section">
            <label className="share-label">Chia sẻ nhanh lên mạng xã hội:</label>
            <div className="social-buttons-grid">
              <button className="social-btn fb-btn" onClick={shareFacebook}>
                <span className="social-icon">📘</span>
                <span>Facebook</span>
              </button>
              <button className="social-btn tele-btn" onClick={shareTelegram}>
                <span className="social-icon">✈️</span>
                <span>Telegram</span>
              </button>
              <button className="social-btn x-btn" onClick={shareTwitter}>
                <span className="social-icon">✖️</span>
                <span>X (Twitter)</span>
              </button>
              <button className="social-btn zalo-btn" onClick={handleCopyLink}>
                <span className="social-icon">💬</span>
                <span>Zalo / Khác</span>
              </button>
            </div>
          </div>

          {/* Direct Copy & Download */}
          <div className="action-cards-row">
            <button className="cert-action-card" onClick={handleDownloadImage}>
              <DownloadIcon size={20} />
              <div className="action-card-text">
                <strong>Tải Thiệp Ảnh (.png)</strong>
                <span>Lưu ảnh đẹp về máy để đăng Story / Tin nhắn</span>
              </div>
            </button>

            <button className="cert-action-card" onClick={handleNativeShare}>
              <Share2Icon size={20} />
              <div className="action-card-text">
                <strong>Gửi Lời Thách Đấu</strong>
                <span>Mời bạn bè so tài tài trí ngay lập tức</span>
              </div>
            </button>
          </div>

          {/* Link Box */}
          <div className="link-copy-box">
            <input type="text" readOnly value={shareText} className="share-text-input" />
            <button
              className={`btn btn-copy ${copied ? 'btn-copied' : 'btn-primary'}`}
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <CheckIcon size={16} />
                  <span>Đã Sao Chép!</span>
                </>
              ) : (
                <>
                  <CopyIcon size={16} />
                  <span>Sao Chép</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
