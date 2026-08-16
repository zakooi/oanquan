import React from 'react';
import { StoryAvatarId } from '../game-logic/gametypes';
import { QuanLaiAvatar, NongDanAvatar } from './CharacterAvatars';

interface StoryAvatarProps {
  avatarId: StoryAvatarId;
  size?: number;
  className?: string;
}

/**
 * Avatar theo từng nhân vật trong cốt truyện.
 * 'quan' và 'nongdan' tái sử dụng 2 avatar gốc; 3 nhân vật còn lại có SVG riêng.
 */
export const StoryAvatar: React.FC<StoryAvatarProps> = ({ avatarId, size = 48, className = '' }) => {
  switch (avatarId) {
    case 'quan':
      return <QuanLaiAvatar size={size} className={className} />;
    case 'tutai':
      return <TuTaiAvatar size={size} className={className} />;
    case 'baba':
      return <BaBaChoAvatar size={size} className={className} />;
    case 'trang':
      return <TrangCoAvatar size={size} className={className} />;
    case 'nongdan':
    default:
      return <NongDanAvatar size={size} className={className} />;
  }
};

/* Tú Tài Văn — quan văn khăn đóng, áo the, râu dài */
export const TuTaiAvatar: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={`character-avatar tutai-avatar ${className}`}
    style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
  >
    <defs>
      <linearGradient id="tutaiAo" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="tutaiKhan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#111827" />
        <stop offset="50%" stopColor="#374151" />
        <stop offset="100%" stopColor="#111827" />
      </linearGradient>
    </defs>
    {/* Thân áo the xanh */}
    <path d="M26 66 Q50 58 74 66 L80 94 Q50 98 20 94 Z" fill="url(#tutaiAo)" stroke="#0f172a" strokeWidth="2" />
    {/* Vạt áo chéo */}
    <path d="M26 66 L50 82 L74 66" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
    {/* Khuôn mặt */}
    <ellipse cx="50" cy="50" rx="16" ry="15" fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
    {/* Mắt nghiêm nghị */}
    <circle cx="43" cy="47" r="2" fill="#1c1917" />
    <circle cx="57" cy="47" r="2" fill="#1c1917" />
    <path d="M38 43 Q43 40 46 43" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
    <path d="M54 43 Q57 40 62 43" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
    {/* Râu dài */}
    <path d="M40 56 Q50 64 60 56 L62 74 Q50 82 38 74 Z" fill="#1c1917" />
    <path d="M44 54 Q50 59 56 54" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
    {/* Khăn đóng */}
    <path d="M30 40 C30 20 70 20 70 40 L62 38 L50 42 L38 38 Z" fill="url(#tutaiKhan)" stroke="#0b1120" strokeWidth="2" />
    <circle cx="50" cy="24" r="4" fill="#38bdf8" stroke="#0b1120" strokeWidth="1" />
  </svg>
);

/* Bà Ba Chợ — tiểu thương khăn mỏ quạ, nụ cười sắc sảo */
export const BaBaChoAvatar: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={`character-avatar baba-avatar ${className}`}
    style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
  >
    <defs>
      <linearGradient id="babaAo" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#7c2d12" />
      </linearGradient>
      <linearGradient id="babaKhan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
    </defs>
    {/* Thân áo bà ba nâu cam */}
    <path d="M26 68 Q50 60 74 68 L80 94 Q50 98 20 94 Z" fill="url(#babaAo)" stroke="#451a03" strokeWidth="2" />
    {/* Cúc áo */}
    <circle cx="50" cy="74" r="2" fill="#fde68a" />
    <circle cx="50" cy="82" r="2" fill="#fde68a" />
    {/* Khuôn mặt */}
    <ellipse cx="50" cy="50" rx="17" ry="16" fill="#fed7aa" stroke="#b45309" strokeWidth="1.5" />
    {/* Nụ cười tinh quái + nốt ruồi */}
    <path d="M41 57 Q50 65 59 57" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="63" cy="53" r="2" fill="#1c1917" />
    {/* Mắt */}
    <circle cx="43" cy="46" r="2.2" fill="#1c1917" />
    <circle cx="57" cy="46" r="2.2" fill="#1c1917" />
    <path d="M38 43 Q43 40 46 43" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
    <path d="M52 43 Q57 40 60 43" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
    {/* Khăn mỏ quạ */}
    <path d="M22 34 Q22 14 50 14 Q78 14 78 34 Q64 44 50 44 Q36 44 22 34 Z" fill="url(#babaKhan)" stroke="#78350f" strokeWidth="2" />
    <path d="M50 14 Q50 26 40 44 M50 14 Q50 26 60 44" fill="none" stroke="#fde68a" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

/* Trạng Cờ Làng — kỳ thủ bất bại, mũ trạng, râu trắng */
export const TrangCoAvatar: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={`character-avatar trang-avatar ${className}`}
    style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.55))' }}
  >
    <defs>
      <linearGradient id="trangAo" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#3b0764" />
      </linearGradient>
      <linearGradient id="trangMu" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
    {/* Thân áo trạng nguyên tím vàng */}
    <path d="M26 66 Q50 58 74 66 L80 94 Q50 98 20 94 Z" fill="url(#trangAo)" stroke="#2e1065" strokeWidth="2" />
    <path d="M38 64 L50 80 L62 64" fill="none" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="82" r="4" fill="#22c55e" stroke="#facc15" strokeWidth="1.5" />
    {/* Khuôn mặt điềm tĩnh */}
    <ellipse cx="50" cy="49" rx="16" ry="15" fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
    <path d="M38 44 Q43 41 46 44" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
    <path d="M54 44 Q57 41 62 44" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
    <circle cx="43" cy="48" r="1.8" fill="#1c1917" />
    <circle cx="57" cy="48" r="1.8" fill="#1c1917" />
    {/* Râu trắng dài */}
    <path d="M42 56 Q50 62 58 56 Q60 72 50 80 Q40 72 42 56 Z" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="1" />
    <path d="M44 55 Q50 59 56 55" fill="none" stroke="#e7e5e4" strokeWidth="2" strokeLinecap="round" />
    {/* Mũ trạng (phốc đầu) */}
    <path d="M30 38 C30 16 70 16 70 38 L66 42 L50 46 L34 42 Z" fill="url(#trangMu)" stroke="#854d0e" strokeWidth="2" />
    <circle cx="50" cy="20" r="4" fill="#7c3aed" stroke="#facc15" strokeWidth="1.5" />
  </svg>
);
