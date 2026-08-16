import {
  StoryCharacter,
  CampaignChapter,
  SeasonModifier,
  GameSettings,
  AIDifficulty,
  RelativeDirection
} from './gametypes';

/**
 * Roster nhân vật trong cốt truyện "Làng Đôi Bờ".
 * Mỗi nhân vật có tên, thân phận, tính cách, lời thoại riêng
 * và ánh xạ sẵn vào một mức độ AI đã có.
 */
export const STORY_CHARACTERS: StoryCharacter[] = [
  {
    id: 'ly-truong-loc',
    name: 'Lý Trưởng Lộc',
    title: 'Quan lại làng',
    avatarId: 'quan',
    aiDifficulty: AIDifficulty.EASY,
    color: '#dc2626',
    epithet: 'Tham lam, tự phụ',
    introLine: 'Dân đen mà dám đòi tranh vụ mùa với quan à? Thử lấy nổi một thửa ruộng của ta xem!',
    tauntLine: 'Ha! Ruộng tốt về tay quan là lẽ đương nhiên!',
    victoryLine: 'Thấy chưa? Cờ này chỉ dành cho kẻ có quyền!',
    defeatLine: 'Không thể nào… ta lại thua một gã nhà quê ư?!'
  },
  {
    id: 'co-dong-sen',
    name: 'Cô Đồng Sen',
    title: 'Nông dân khéo tay',
    avatarId: 'nongdan',
    aiDifficulty: AIDifficulty.MEDIUM,
    color: '#16a34a',
    epithet: 'Lanh lợi, tinh quái',
    introLine: 'Ăn liên hoàn là nghề của chị đấy! Coi chừng kho thóc nhé cưng.',
    tauntLine: 'Chị bốc liền một mạch, chú nhìn mà học!',
    victoryLine: 'Vụ mùa năm nay, đồng của Sen lại trĩu hạt!',
    defeatLine: 'Hì, thua chú rồi. Mùa sau chị đòi lại đấy!'
  },
  {
    id: 'tu-tai-van',
    name: 'Tú Tài Văn',
    title: 'Quan văn mưu lược',
    avatarId: 'tutai',
    aiDifficulty: AIDifficulty.HARD,
    color: '#2563eb',
    epithet: 'Tính toán lạnh lùng',
    introLine: 'Cờ này là phép tính, không phải trò trẻ con. Ta đã đếm sẵn từng viên sỏi.',
    tauntLine: 'Đúng như ta dự liệu. Nước của ngươi nằm trong bàn tính rồi.',
    victoryLine: 'Kẻ không biết tính trước, ắt phải trả giá.',
    defeatLine: 'Thú vị… ngươi tính xa hơn ta một nước.'
  },
  {
    id: 'ba-ba-cho',
    name: 'Bà Ba Chợ',
    title: 'Tiểu thương sắc sảo',
    avatarId: 'baba',
    aiDifficulty: AIDifficulty.MASTER,
    color: '#d97706',
    epithet: 'Mua rẻ bán đắt',
    introLine: 'Trên đời này mỗi viên sỏi đều có cái giá của nó. Ngươi trả giá được bao nhiêu?',
    tauntLine: 'Lời to quá! Cả kho lẫn ruộng, bà gom hết về một mối.',
    victoryLine: 'Buôn may bán đắt — trận này bà lãi đậm.',
    defeatLine: 'Ối giời, lỗ vốn rồi! Bà nhớ mặt ngươi đấy.'
  },
  {
    id: 'trang-co-lang',
    name: 'Trạng Cờ Làng',
    title: 'Kỳ thủ bất bại',
    avatarId: 'trang',
    aiDifficulty: AIDifficulty.GRANDMASTER,
    color: '#a855f7',
    epithet: 'Điềm tĩnh, ẩn dật',
    introLine: 'Ta đã chờ người thắng trọn bốn mùa để gặp. Ngồi xuống đi, kỳ thủ trẻ.',
    tauntLine: 'Nước cờ đẹp. Nhưng ván này đã an bài từ mười nước trước.',
    victoryLine: 'Giỏ Thóc Vàng vẫn chưa đổi chủ. Người hãy về luyện thêm.',
    defeatLine: 'Mùa gặt năm nay… ngươi xứng đáng với Giỏ Thóc Vàng.'
  }
];

/**
 * 6 chương Campaign = 6 mùa trong năm của làng Đôi Bờ.
 * Mỗi chương gắn một đối thủ + một biến thể luật (điều kiện mùa).
 */
export const CAMPAIGN_CHAPTERS: CampaignChapter[] = [
  {
    id: 1,
    seasonName: 'Mùa Gieo',
    seasonEmoji: '🌱',
    opponentId: 'ly-truong-loc',
    reward: 'Mở khóa Mùa Lụt'
  },
  {
    id: 2,
    seasonName: 'Mùa Lụt',
    seasonEmoji: '🌊',
    opponentId: 'co-dong-sen',
    modifier: {
      seasonName: 'Nước chặn hướng',
      seasonEmoji: '🌊',
      description: 'Nước lụt dâng cao: mỗi nước đi chỉ được rải về một hướng duy nhất.',
      lockedDirection: RelativeDirection.LEFT
    },
    reward: 'Mở khóa Mùa Hạn'
  },
  {
    id: 3,
    seasonName: 'Mùa Hạn',
    seasonEmoji: '☀️',
    opponentId: 'tu-tai-van',
    modifier: {
      seasonName: 'Đồng khô hạn',
      seasonEmoji: '☀️',
      description: 'Hạn hán làm mùa màng cằn cỗi: mỗi ô Dân chỉ còn 3 viên khi gieo.',
      startingDanPerCell: 3
    },
    reward: 'Mở khóa Mùa Hội Làng'
  },
  {
    id: 4,
    seasonName: 'Mùa Hội Làng',
    seasonEmoji: '🏮',
    opponentId: 'ba-ba-cho',
    modifier: {
      seasonName: 'Hội làng mở thưởng',
      seasonEmoji: '🏮',
      description: 'Ngày hội làng: quân Quan được định giá gấp đôi (20 điểm).',
      quanValue: 20
    },
    reward: 'Mở khóa Mùa Đông'
  },
  {
    id: 5,
    seasonName: 'Mùa Đông',
    seasonEmoji: '❄️',
    opponentId: 'trang-co-lang',
    modifier: {
      seasonName: 'Giá rét',
      seasonEmoji: '❄️',
      description: 'Trời đông giá rét: mỗi nước đi chỉ có 30 giây suy nghĩ.',
      timeLimitPerTurn: 30
    },
    reward: 'Mở khóa trận chung kết'
  },
  {
    id: 6,
    seasonName: 'Mùa Gặt',
    seasonEmoji: '🌾',
    opponentId: 'trang-co-lang',
    reward: 'Giỏ Thóc Vàng — danh hiệu Trạng Cờ Làng'
  }
];

export function getCharacterById(id: string): StoryCharacter {
  return STORY_CHARACTERS.find(c => c.id === id) || STORY_CHARACTERS[0];
}

export function getChapterById(id: number): CampaignChapter | undefined {
  return CAMPAIGN_CHAPTERS.find(c => c.id === id);
}

/**
 * Dựng GameSettings cho một chương campaign:
 * áp tên người chơi, tên/avatar đối thủ và biến thể luật của mùa.
 */
export function buildChapterSettings(
  chapter: CampaignChapter,
  playerName: string,
  base: GameSettings
): GameSettings {
  const opponent = getCharacterById(chapter.opponentId);
  const modifier: SeasonModifier | undefined = chapter.modifier;

  return {
    ...base,
    gameMode: 'pve',
    aiDifficulty: opponent.aiDifficulty,
    player1Name: playerName || 'Nông Dân bờ Nam',
    player2Name: `${opponent.name} — ${opponent.title}`,
    opponentAvatar: opponent.avatarId,
    seasonId: chapter.seasonName,
    lockedDirection: modifier?.lockedDirection,
    startingDanPerCell: modifier?.startingDanPerCell ?? base.startingDanPerCell,
    quanValue: modifier?.quanValue ?? base.quanValue,
    timeLimitPerTurn: modifier?.timeLimitPerTurn ?? base.timeLimitPerTurn
  };
}
