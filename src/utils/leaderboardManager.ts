import { MatchRecord, LeaderboardStats, AIDifficulty, PlayerSide, GameSnapshot, GameSettings } from '../game-logic/gametypes';

const STORAGE_KEY = 'o_an_quan_match_history_v1';

export class LeaderboardManager {
  private static instance: LeaderboardManager;

  public static getInstance(): LeaderboardManager {
    if (!LeaderboardManager.instance) {
      LeaderboardManager.instance = new LeaderboardManager();
    }
    return LeaderboardManager.instance;
  }

  public getMatches(): MatchRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getDefaultInitialMatches();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (e) {
      console.error('Error loading matches from storage:', e);
      return [];
    }
  }

  public saveMatch(record: MatchRecord): void {
    try {
      const current = this.getMatches();
      const updated = [record, ...current].slice(0, 100); // Lưu tối đa 100 ván gần nhất
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving match record:', e);
    }
  }

  public createRecordFromGame(
    snapshot: GameSnapshot,
    settings: GameSettings,
    boardMode: '2d' | '3d'
  ): MatchRecord {
    const date = new Date();
    const dateFormatted = `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    let winnerName = 'Hòa';
    if (snapshot.winner === PlayerSide.PLAYER1) {
      winnerName = snapshot.player1.name;
    } else if (snapshot.winner === PlayerSide.PLAYER2) {
      winnerName = snapshot.player2.name;
    }

    return {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      dateFormatted,
      gameMode: settings.gameMode,
      aiDifficulty: settings.gameMode === 'pve' ? settings.aiDifficulty : undefined,
      winner: snapshot.winner || 'DRAW',
      winnerName,
      player1: {
        name: snapshot.player1.name,
        score: snapshot.player1.score,
        quanCaptured: snapshot.player1.quanCaptured,
        danCaptured: snapshot.player1.danCaptured
      },
      player2: {
        name: snapshot.player2.name,
        score: snapshot.player2.score,
        quanCaptured: snapshot.player2.quanCaptured,
        danCaptured: snapshot.player2.danCaptured
      },
      totalTurns: snapshot.turnCount,
      boardMode
    };
  }

  public getStats(): LeaderboardStats {
    const matches = this.getMatches();
    const pveMatches = matches.filter(m => m.gameMode === 'pve');
    const pvpMatches = matches.filter(m => m.gameMode === 'pvp');

    const pveWins = pveMatches.filter(m => m.winner === PlayerSide.PLAYER1).length;
    const pveLosses = pveMatches.filter(m => m.winner === PlayerSide.PLAYER2).length;
    const pveDraws = pveMatches.filter(m => m.winner === 'DRAW').length;

    let highestScore = 0;
    let totalQuansCaptured = 0;

    matches.forEach(m => {
      if (m.player1.score > highestScore) highestScore = m.player1.score;
      if (m.player2.score > highestScore) highestScore = m.player2.score;
      totalQuansCaptured += (m.player1.quanCaptured || 0) + (m.player2.quanCaptured || 0);
    });

    return {
      totalMatches: matches.length,
      pveMatches: pveMatches.length,
      pvpMatches: pvpMatches.length,
      pveWins,
      pveLosses,
      pveDraws,
      highestScore,
      totalQuansCaptured
    };
  }

  public getTopPvEScores(difficultyFilter?: AIDifficulty | 'ALL'): MatchRecord[] {
    const matches = this.getMatches().filter(m => m.gameMode === 'pve');
    const filtered =
      !difficultyFilter || difficultyFilter === 'ALL'
        ? matches
        : matches.filter(m => m.aiDifficulty === difficultyFilter);

    // Sắp xếp theo điểm số Người chơi 1 cao nhất
    return [...filtered].sort((a, b) => b.player1.score - a.player1.score);
  }

  public getTopPvPMatches(): MatchRecord[] {
    const matches = this.getMatches().filter(m => m.gameMode === 'pvp');
    // Sắp xếp theo tổng điểm của ván đấu cao nhất
    return [...matches].sort(
      (a, b) =>
        Math.max(b.player1.score, b.player2.score) -
        Math.max(a.player1.score, a.player2.score)
    );
  }

  public clearAllRecords(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing records:', e);
    }
  }

  // Pre-fill a couple of demo honorary records if totally empty
  private getDefaultInitialMatches(): MatchRecord[] {
    return [
      {
        id: 'init_match_1',
        timestamp: Date.now() - 3600000 * 2,
        dateFormatted: '15:30 - Hôm nay',
        gameMode: 'pve',
        aiDifficulty: AIDifficulty.GRANDMASTER,
        winner: PlayerSide.PLAYER1,
        winnerName: 'Người chơi 1',
        player1: { name: 'Người chơi 1', score: 38, quanCaptured: 2, danCaptured: 18 },
        player2: { name: 'Kiện Tướng AI', score: 24, quanCaptured: 0, danCaptured: 24 },
        totalTurns: 18,
        boardMode: '3d'
      },
      {
        id: 'init_match_2',
        timestamp: Date.now() - 3600000 * 5,
        dateFormatted: '12:15 - Hôm nay',
        gameMode: 'pvp',
        winner: PlayerSide.PLAYER1,
        winnerName: 'Trạng Nguyên P1',
        player1: { name: 'Trạng Nguyên P1', score: 35, quanCaptured: 1, danCaptured: 25 },
        player2: { name: 'Bảng Nhãn P2', score: 27, quanCaptured: 1, danCaptured: 17 },
        totalTurns: 22,
        boardMode: '3d'
      }
    ];
  }
}

export const leaderboardManager = LeaderboardManager.getInstance();
