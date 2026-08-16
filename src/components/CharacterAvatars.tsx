import React from 'react';

interface CharacterProps {
  size?: number;
  className?: string;
}

/**
 * Hình tượng QUAN LẠI Việt Nam xưa:
 * Đội Mũ Cánh Chuồn đặc trưng triều đình, áo thụng đỏ gấm hoàng gia, thẻ bài / ngọc bội uy nghiêm.
 */
export const QuanLaiAvatar: React.FC<CharacterProps> = ({ size = 48, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={`character-avatar quan-lai-avatar ${className}`}
    style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
  >
    <defs>
      <radialGradient id="mandarinGold" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="60%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </radialGradient>
      <linearGradient id="robeRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="60%" stopColor="#991b1b" />
        <stop offset="100%" stopColor="#450a0a" />
      </linearGradient>
      <linearGradient id="wingGold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="50%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>

    {/* Cánh chuồn bên trái */}
    <ellipse cx="16" cy="30" rx="14" ry="4.5" transform="rotate(-12 16 30)" fill="url(#wingGold)" stroke="#78350f" strokeWidth="1.5" />
    <circle cx="5" cy="27" r="3" fill="#fde68a" stroke="#78350f" strokeWidth="1" />

    {/* Cánh chuồn bên phải */}
    <ellipse cx="84" cy="30" rx="14" ry="4.5" transform="rotate(12 84 30)" fill="url(#wingGold)" stroke="#78350f" strokeWidth="1.5" />
    <circle cx="95" cy="27" r="3" fill="#fde68a" stroke="#78350f" strokeWidth="1" />

    {/* Thân áo quan lại thụng gấm đỏ */}
    <path d="M22 68 Q50 60 78 68 L84 94 Q50 99 16 94 Z" fill="url(#robeRed)" stroke="#7f1d1d" strokeWidth="2" />

    {/* Đai ngọc / Cổ áo hoàng tộc */}
    <path d="M38 64 L50 78 L62 64" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="80" r="5" fill="#22c55e" stroke="#f59e0b" strokeWidth="1.5" /> {/* Ngọc bội */}

    {/* Khuôn mặt quan triều đình */}
    <ellipse cx="50" cy="48" rx="19" ry="18" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />

    {/* Râu quan uy nghiêm */}
    <path d="M42 56 Q50 63 58 56 Q55 68 50 72 Q45 68 42 56 Z" fill="#1c1917" />
    <path d="M44 54 Q50 58 56 54" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />

    {/* Mắt & Lông mày */}
    <path d="M38 42 Q43 39 46 42" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M54 42 Q57 39 62 42" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="43" cy="46" r="2" fill="#1c1917" />
    <circle cx="57" cy="46" r="2" fill="#1c1917" />

    {/* Mũ Cánh Chuồn đỉnh tròn */}
    <path d="M32 38 C32 20 68 20 68 38 Z" fill="#1c1917" stroke="#451a03" strokeWidth="2" />
    <rect x="30" y="34" width="40" height="7" rx="3" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
    <circle cx="50" cy="24" r="5" fill="url(#mandarinGold)" stroke="#78350f" strokeWidth="1.5" />
  </svg>
);

/**
 * Hình tượng NÔNG DÂN Việt Nam xưa:
 * Đội Nón Lá truyền thống, áo bà ba nâu sồng đôn hậu, nụ cười rạng rỡ.
 */
export const NongDanAvatar: React.FC<CharacterProps> = ({ size = 36, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={`character-avatar nong-dan-avatar ${className}`}
    style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}
  >
    <defs>
      <linearGradient id="nonLaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="aoNauGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#854d0e" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
    </defs>

    {/* Thân áo nâu sồng */}
    <path d="M26 66 Q50 58 74 66 L80 94 Q50 98 20 94 Z" fill="url(#aoNauGradient)" stroke="#3b1d06" strokeWidth="2" />
    <path d="M48 64 L48 94" fill="none" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="3 3" />

    {/* Khuôn mặt đôn hậu */}
    <ellipse cx="50" cy="50" rx="17" ry="16" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />

    {/* Nụ cười hiền lành & Lúm đồng tiền */}
    <path d="M42 56 Q50 63 58 56" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="39" cy="54" r="3.5" fill="#f87171" opacity="0.6" />
    <circle cx="61" cy="54" r="3.5" fill="#f87171" opacity="0.6" />

    {/* Đôi mắt cười tít */}
    <path d="M38 45 Q43 40 46 45" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M54 45 Q57 40 62 45" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />

    {/* NÓN LÁ ĐẶC TRƯNG VIỆT NAM */}
    <polygon points="50,10 94,44 6,44" fill="url(#nonLaGradient)" stroke="#854d0e" strokeWidth="2" />
    {/* Vành nón & Gân lá */}
    <path d="M50 10 L30 44 M50 10 L70 44 M50 10 L50 44" stroke="#a16207" strokeWidth="1" opacity="0.6" />
    <ellipse cx="50" cy="44" rx="44" ry="4" fill="#a16207" opacity="0.4" />
    {/* Quai nón hồng/đỏ */}
    <path d="M28 44 Q50 66 72 44" fill="none" stroke="#ec4899" strokeWidth="2" />
  </svg>
);
