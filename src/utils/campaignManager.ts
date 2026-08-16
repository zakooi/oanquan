import { PlayerSide } from '../game-logic/gametypes';
import { CAMPAIGN_CHAPTERS } from '../game-logic/storydata';

const STORAGE_KEY = 'o_an_quan_campaign_v1';

export interface CampaignProgress {
  playerName: string;
  stars: Record<string, number>; // chapterId -> số sao (0-3)
}

class CampaignManager {
  private static instance: CampaignManager;

  public static getInstance(): CampaignManager {
    if (!CampaignManager.instance) {
      CampaignManager.instance = new CampaignManager();
    }
    return CampaignManager.instance;
  }

  public getProgress(): CampaignProgress {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { playerName: '', stars: {} };
      const parsed = JSON.parse(raw);
      return {
        playerName: typeof parsed.playerName === 'string' ? parsed.playerName : '',
        stars: parsed.stars && typeof parsed.stars === 'object' ? parsed.stars : {}
      };
    } catch (e) {
      return { playerName: '', stars: {} };
    }
  }

  public saveProgress(progress: CampaignProgress): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving campaign progress:', e);
    }
  }

  public getPlayerName(): string {
    return this.getProgress().playerName;
  }

  public setPlayerName(name: string): void {
    const p = this.getProgress();
    p.playerName = name.trim().slice(0, 24);
    this.saveProgress(p);
  }

  public getStars(chapterId: number): number {
    const s = this.getProgress().stars[chapterId];
    return typeof s === 'number' ? s : 0;
  }

  public recordResult(chapterId: number, stars: number): void {
    const p = this.getProgress();
    const current = this.getStars(chapterId);
    p.stars[chapterId] = Math.max(current, stars);
    this.saveProgress(p);
  }

  public isChapterUnlocked(chapterId: number): boolean {
    if (chapterId <= 1) return true;
    return this.getStars(chapterId - 1) >= 1;
  }

  public getTotalStars(): number {
    const stars = this.getProgress().stars;
    return Object.values(stars).reduce<number>((sum, s) => sum + (typeof s === 'number' ? s : 0), 0);
  }

  public isCampaignComplete(): boolean {
    return CAMPAIGN_CHAPTERS.every(ch => this.getStars(ch.id) >= 1);
  }
}

/**
 * Chấm sao cho một chương campaign dựa trên hiệu số điểm của người chơi.
 * Thắng = 1 sao; thắng cách biệt >= 10 = 2 sao; >= 20 = 3 sao.
 */
export function computeStars(
  winner: PlayerSide | 'DRAW',
  playerScore: number,
  opponentScore: number
): number {
  if (winner !== PlayerSide.PLAYER1) return 0;
  const diff = playerScore - opponentScore;
  if (diff >= 20) return 3;
  if (diff >= 10) return 2;
  return 1;
}

export const campaignManager = CampaignManager.getInstance();
