import { OAnQuanGame } from './oanquangame';
import { PlayerSide, MoveDirection, AIDifficulty, RelativeDirection } from './gametypes';

export interface AIMoveChoice {
  cellIndex: number;
  direction: MoveDirection;
  relativeDirection: RelativeDirection;
  expectedScore?: number;
  depthReached?: number;
}

interface CandidateMove {
  cellIndex: number;
  direction: MoveDirection;
  immediatePoints: number;
  capturedQuan: number;
}

export class OAnQuanAI {
  private difficulty: AIDifficulty;
  private transpositionTable: Map<string, { depth: number; score: number }> = new Map();

  constructor(difficulty: AIDifficulty = AIDifficulty.HARD) {
    this.difficulty = difficulty;
  }

  public setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty;
  }

  public getDifficulty(): AIDifficulty {
    return this.difficulty;
  }

  public chooseMove(game: OAnQuanGame): AIMoveChoice | null {
    const validCells = game.getValidMoves(PlayerSide.PLAYER2);
    if (validCells.length === 0) return null;

    this.transpositionTable.clear();

    switch (this.difficulty) {
      case AIDifficulty.EASY:
        return this.chooseEasyMove(game, validCells);
      case AIDifficulty.MEDIUM:
        return this.chooseMediumMove(game, validCells);
      case AIDifficulty.HARD:
        return this.chooseHardMove(game, validCells, 3);
      case AIDifficulty.MASTER:
        return this.chooseHardMove(game, validCells, 4);
      case AIDifficulty.GRANDMASTER:
        return this.chooseGrandmasterMove(game, validCells);
      default:
        return this.chooseHardMove(game, validCells, 3);
    }
  }

  // Directions allowed for a player, honoring campaign "locked direction" seasons
  private getDirections(game: OAnQuanGame, player: PlayerSide): MoveDirection[] {
    const locked = game.getSettings().lockedDirection;
    if (locked) {
      return [OAnQuanGame.toMoveDirection(player, locked)];
    }
    return [MoveDirection.CLOCKWISE, MoveDirection.COUNTER_CLOCKWISE];
  }

  private getAllCandidateMoves(game: OAnQuanGame, validCells: number[], player: PlayerSide = PlayerSide.PLAYER2): CandidateMove[] {
    const moves: CandidateMove[] = [];

    for (const cell of validCells) {
      for (const dir of this.getDirections(game, player)) {
        // Quick 1-ply simulation to evaluate immediate points for move ordering
        const sim = game.clone();
        sim.setCurrentPlayer(player);
        const res = sim.executeMove(cell, dir);
        if (res.success && res.log) {
          moves.push({
            cellIndex: cell,
            direction: dir,
            immediatePoints: res.log.pointsEarned,
            capturedQuan: res.log.capturedQuan
          });
        }
      }
    }

    // Move Ordering: Sort descending by immediate gain to trigger maximum Alpha-Beta pruning cutoffs
    moves.sort((a, b) => {
      const scoreA = a.immediatePoints + a.capturedQuan * 15;
      const scoreB = b.immediatePoints + b.capturedQuan * 15;
      return scoreB - scoreA;
    });

    return moves;
  }

  // Easy: Random with mild preference for moves that gain points
  private chooseEasyMove(game: OAnQuanGame, validCells: number[]): AIMoveChoice {
    const candidates = this.getAllCandidateMoves(game, validCells, PlayerSide.PLAYER2);
    if (candidates.length === 0) {
      return {
        cellIndex: validCells[0],
        direction: MoveDirection.CLOCKWISE,
        relativeDirection: RelativeDirection.LEFT
      };
    }

    // 60% totally random, 40% greedy
    if (Math.random() < 0.6) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      return {
        cellIndex: chosen.cellIndex,
        direction: chosen.direction,
        relativeDirection: OAnQuanGame.toRelativeDirection(PlayerSide.PLAYER2, chosen.direction)
      };
    }
    return this.chooseMediumMove(game, validCells);
  }

  // Medium: 1-ply Greedy heuristic with tie-breakers and basic defensive awareness
  private chooseMediumMove(game: OAnQuanGame, validCells: number[]): AIMoveChoice {
    const candidates = this.getAllCandidateMoves(game, validCells, PlayerSide.PLAYER2);
    if (candidates.length === 0) {
      return {
        cellIndex: validCells[0],
        direction: MoveDirection.CLOCKWISE,
        relativeDirection: RelativeDirection.LEFT
      };
    }

    let bestMove = candidates[0];
    let bestScore = -Infinity;

    for (const cand of candidates) {
      const sim = game.clone();
      sim.setCurrentPlayer(PlayerSide.PLAYER2);
      const res = sim.executeMove(cand.cellIndex, cand.direction);
      if (!res.success) continue;

      const p2Score = sim.getPlayerStats(PlayerSide.PLAYER2).score;
      const p1Score = sim.getPlayerStats(PlayerSide.PLAYER1).score;
      const pointsDiff = p2Score - p1Score;

      // Bonus if captured Quan and extra safety
      const capturedQuan = res.log?.capturedQuan || 0;
      const score = pointsDiff * 2 + capturedQuan * 25 + Math.random() * 0.4;

      if (score > bestScore) {
        bestScore = score;
        bestMove = cand;
      }
    }

    return {
      cellIndex: bestMove.cellIndex,
      direction: bestMove.direction,
      relativeDirection: OAnQuanGame.toRelativeDirection(PlayerSide.PLAYER2, bestMove.direction),
      expectedScore: bestScore
    };
  }

  // Hard & Master: Minimax with Alpha-Beta, Move Ordering and Deep Heuristics
  private chooseHardMove(game: OAnQuanGame, validCells: number[], depth: number): AIMoveChoice {
    const candidates = this.getAllCandidateMoves(game, validCells, PlayerSide.PLAYER2);
    if (candidates.length === 0) {
      return {
        cellIndex: validCells[0],
        direction: MoveDirection.CLOCKWISE,
        relativeDirection: RelativeDirection.LEFT
      };
    }

    let bestMove = candidates[0];
    let bestScore = -Infinity;

    for (const cand of candidates) {
      const sim = game.clone();
      sim.setCurrentPlayer(PlayerSide.PLAYER2);
      const res = sim.executeMove(cand.cellIndex, cand.direction);
      if (!res.success) continue;

      // Evaluate position after move using minimax
      const evalScore = this.minimax(sim, depth - 1, -Infinity, Infinity, false);

      if (evalScore > bestScore) {
        bestScore = evalScore;
        bestMove = cand;
      }
    }

    return {
      cellIndex: bestMove.cellIndex,
      direction: bestMove.direction,
      relativeDirection: OAnQuanGame.toRelativeDirection(PlayerSide.PLAYER2, bestMove.direction),
      expectedScore: bestScore,
      depthReached: depth
    };
  }

  // Grandmaster: Adaptive Depth (4-6), Threat Prevention, Opponent Starvation & Endgame Solver
  private chooseGrandmasterMove(game: OAnQuanGame, validCells: number[]): AIMoveChoice {
    const board = game.getBoard();
    const remainingDanOnBoard = board.reduce((acc, c) => acc + c.danCount, 0);

    // If remaining pieces <= 18, use deep endgame solver (depth 6)
    const targetDepth = remainingDanOnBoard <= 18 ? 6 : 4;

    const candidates = this.getAllCandidateMoves(game, validCells, PlayerSide.PLAYER2);
    if (candidates.length === 0) {
      return {
        cellIndex: validCells[0],
        direction: MoveDirection.CLOCKWISE,
        relativeDirection: RelativeDirection.LEFT
      };
    }

    let bestMove = candidates[0];
    let bestScore = -Infinity;

    for (const cand of candidates) {
      const sim = game.clone();
      sim.setCurrentPlayer(PlayerSide.PLAYER2);
      const res = sim.executeMove(cand.cellIndex, cand.direction);
      if (!res.success) continue;

      // 1. Minimax strategic evaluation
      let evalScore = this.minimax(sim, targetDepth - 1, -Infinity, Infinity, false);

      // 2. Tactical Opponent Threat Neutralization Bonus
      const opponentThreats = this.evaluateMaxOpponentGainNextTurn(sim);
      evalScore -= opponentThreats * 1.5;

      // 3. Quan Protection / Hunting Priority
      if (cand.capturedQuan > 0) {
        evalScore += cand.capturedQuan * 35;
      }

      if (evalScore > bestScore) {
        bestScore = evalScore;
        bestMove = cand;
      }
    }

    return {
      cellIndex: bestMove.cellIndex,
      direction: bestMove.direction,
      relativeDirection: OAnQuanGame.toRelativeDirection(PlayerSide.PLAYER2, bestMove.direction),
      expectedScore: bestScore,
      depthReached: targetDepth
    };
  }

  // Calculate highest possible points opponent can gain in their immediate next turn
  private evaluateMaxOpponentGainNextTurn(game: OAnQuanGame): number {
    const opponentMoves = game.getValidMoves(PlayerSide.PLAYER1);
    if (opponentMoves.length === 0) return 0;

    let maxGain = 0;
    for (const cell of opponentMoves) {
      for (const dir of this.getDirections(game, PlayerSide.PLAYER1)) {
        const sim = game.clone();
        sim.setCurrentPlayer(PlayerSide.PLAYER1);
        const res = sim.executeMove(cell, dir);
        if (res.success && res.log) {
          const gain = res.log.pointsEarned + res.log.capturedQuan * 10;
          if (gain > maxGain) {
            maxGain = gain;
          }
        }
      }
    }
    return maxGain;
  }

  private minimax(
    game: OAnQuanGame,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    if (depth === 0 || game.getGameStatus() === 'ended') {
      return this.evaluateBoard(game);
    }

    const stateKey = this.getBoardKey(game, isMaximizing);
    const cached = this.transpositionTable.get(stateKey);
    if (cached && cached.depth >= depth) {
      return cached.score;
    }

    const player = isMaximizing ? PlayerSide.PLAYER2 : PlayerSide.PLAYER1;
    const validMoves = game.getValidMoves(player);

    if (validMoves.length === 0) {
      return this.evaluateBoard(game);
    }

    const candidates = this.getAllCandidateMoves(game, validMoves, player);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const cand of candidates) {
        const sim = game.clone();
        sim.setCurrentPlayer(PlayerSide.PLAYER2);
        const res = sim.executeMove(cand.cellIndex, cand.direction);
        if (!res.success) continue;

        const evaluation = this.minimax(sim, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Alpha-Beta Cutoff
      }
      const score = maxEval === -Infinity ? this.evaluateBoard(game) : maxEval;
      this.transpositionTable.set(stateKey, { depth, score });
      return score;
    } else {
      let minEval = Infinity;
      for (const cand of candidates) {
        const sim = game.clone();
        sim.setCurrentPlayer(PlayerSide.PLAYER1);
        const res = sim.executeMove(cand.cellIndex, cand.direction);
        if (!res.success) continue;

        const evaluation = this.minimax(sim, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha-Beta Cutoff
      }
      const score = minEval === Infinity ? this.evaluateBoard(game) : minEval;
      this.transpositionTable.set(stateKey, { depth, score });
      return score;
    }
  }

  private getBoardKey(game: OAnQuanGame, isMaximizing: boolean): string {
    const board = game.getBoard();
    const boardStr = board.map(c => `${c.danCount},${c.quanCount}`).join('|');
    const p1 = game.getPlayerStats(PlayerSide.PLAYER1);
    const p2 = game.getPlayerStats(PlayerSide.PLAYER2);
    return `${boardStr}#${p1.score},${p2.score}#${isMaximizing ? '1' : '0'}`;
  }

  // Advanced Positional Heuristic Evaluation Function
  private evaluateBoard(game: OAnQuanGame): number {
    const p1 = game.getPlayerStats(PlayerSide.PLAYER1);
    const p2 = game.getPlayerStats(PlayerSide.PLAYER2);
    const board = game.getBoard();

    // 1. Core Material Score Difference (12x multiplier)
    let score = (p2.score - p1.score) * 12;

    // 2. High Value on Captured Quan
    score += (p2.quanCaptured - p1.quanCaptured) * 35;

    // 3. Heavy Debt Penalty
    score -= p2.debt * 20;
    score += p1.debt * 20;

    // 4. Board Territorial Safety (Pieces located on own side are safer)
    const p2Squares = [1, 2, 3, 4, 5];
    const p1Squares = [7, 8, 9, 10, 11];

    let p2PiecesOnBoard = 0;
    let p2NonEmptyCells = 0;
    for (const sq of p2Squares) {
      p2PiecesOnBoard += board[sq].danCount;
      if (board[sq].danCount > 0) p2NonEmptyCells++;
    }

    let p1PiecesOnBoard = 0;
    let p1NonEmptyCells = 0;
    for (const sq of p1Squares) {
      p1PiecesOnBoard += board[sq].danCount;
      if (board[sq].danCount > 0) p1NonEmptyCells++;
    }

    score += (p2PiecesOnBoard - p1PiecesOnBoard) * 2.5;

    // 5. Starvation / Chầu quân Threat Strategy
    // If opponent has 0 pieces on their side, they will be forced to spend 5 points to chầu quân
    if (p1PiecesOnBoard === 0 && game.getGameStatus() !== 'ended') {
      score += 25; // Massive reward for starving opponent
    }
    if (p2PiecesOnBoard === 0 && game.getGameStatus() !== 'ended') {
      score -= 25; // Danger of having to chầu quân
    }

    // Flexibility / Mobility (Reward having multiple playable cells)
    score += (p2NonEmptyCells - p1NonEmptyCells) * 3;

    // 6. Terminal States (Win / Loss)
    if (game.getGameStatus() === 'ended') {
      if (game.getWinner() === PlayerSide.PLAYER2) return 15000 + score;
      if (game.getWinner() === PlayerSide.PLAYER1) return -15000 + score;
      return 0;
    }

    return score;
  }
}
