export enum PlayerSide {
  PLAYER1 = 'PLAYER1', // Bottom player (Human)
  PLAYER2 = 'PLAYER2'  // Top player (AI or Human 2)
}

export enum MoveDirection {
  CLOCKWISE = 'CLOCKWISE',         // Thuận chiều kim đồng hồ (+1)
  COUNTER_CLOCKWISE = 'COUNTER_CLOCKWISE' // Ngược chiều kim đồng hồ (-1)
}

export enum RelativeDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum AIDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  MASTER = 'MASTER',           // Cao Thủ (Độ sâu 4 + Phân tích đe dọa)
  GRANDMASTER = 'GRANDMASTER'   // Kiện Tướng Bất Bại (Độ sâu 5-6 + Bẫy liên hoàn)
}

export interface CellState {
  index: number;
  isQuan: boolean;
  danCount: number;
  quanCount: number;
  owner?: PlayerSide; // Chỉ gán cho 10 ô dân
}

export interface PlayerStats {
  id: PlayerSide;
  name: string;
  score: number;
  danCaptured: number;
  quanCaptured: number;
  debt: number; // Điểm nợ khi chầu quân mà không đủ sỏi
}

export interface MoveStep {
  type: 'PICK_UP' | 'DROP_PIECE' | 'CONTINUE_PICK' | 'CAPTURE' | 'PASS' | 'CHAU_QUAN';
  cellIndex: number;
  handCount: number;
  capturedDan?: number;
  capturedQuan?: number;
  player: PlayerSide;
  description: string;
}

export interface MoveLog {
  turnNumber: number;
  player: PlayerSide;
  startCell: number;
  direction: MoveDirection;
  relativeDirection: RelativeDirection;
  pointsEarned: number;
  capturedQuan: number;
  capturedDan: number;
  steps: MoveStep[];
}

export type StoryAvatarId = 'quan' | 'nongdan' | 'tutai' | 'baba' | 'trang';

export interface StoryCharacter {
  id: string;
  name: string;
  title: string;
  avatarId: StoryAvatarId;
  aiDifficulty: AIDifficulty;
  color: string;
  epithet: string;
  introLine: string;
  tauntLine: string;
  victoryLine: string;
  defeatLine: string;
}

export interface SeasonModifier {
  seasonName: string;
  seasonEmoji: string;
  description: string;
  lockedDirection?: RelativeDirection;
  startingDanPerCell?: number;
  quanValue?: number;
  timeLimitPerTurn?: number;
}

export interface CampaignChapter {
  id: number;
  seasonName: string;
  seasonEmoji: string;
  opponentId: string;
  modifier?: SeasonModifier;
  reward: string;
}

export interface GameSettings {
  gameMode: 'pve' | 'pvp';
  aiDifficulty: AIDifficulty;
  timeLimitPerTurn: number; // giây (0 = không giới hạn)
  startingDanPerCell: number; // 5 mặc định
  quanValue: number; // 10 điểm (hoặc 5 điểm tùy luật)
  soundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  // Cốt truyện / Campaign (tùy chọn)
  player1Name?: string; // tên người chơi (Nông Dân bờ Nam)
  player2Name?: string; // tên đối thủ
  opponentAvatar?: StoryAvatarId; // avatar đối thủ
  lockedDirection?: RelativeDirection; // Mùa Lụt: chỉ được đi 1 hướng
  seasonId?: string; // mùa trong campaign (để ngữ cảnh)
}

export interface GameSnapshot {
  board: CellState[];
  currentPlayer: PlayerSide;
  player1: PlayerStats;
  player2: PlayerStats;
  gameStatus: 'ready' | 'playing' | 'animating' | 'ended';
  winner?: PlayerSide | 'DRAW';
  turnCount: number;
}

export interface FloatingDelta {
  id: number;
  cellIndex: number;
  deltaText: string;
  type: 'increase' | 'decrease' | 'capture';
}

export interface MatchPlayerSummary {
  name: string;
  score: number;
  quanCaptured: number;
  danCaptured: number;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  dateFormatted: string;
  gameMode: 'pve' | 'pvp';
  aiDifficulty?: AIDifficulty;
  winner: PlayerSide | 'DRAW';
  winnerName: string;
  player1: MatchPlayerSummary;
  player2: MatchPlayerSummary;
  totalTurns: number;
  boardMode: '2d' | '3d';
}

export interface LeaderboardStats {
  totalMatches: number;
  pveMatches: number;
  pvpMatches: number;
  pveWins: number;
  pveLosses: number;
  pveDraws: number;
  highestScore: number;
  totalQuansCaptured: number;
}

