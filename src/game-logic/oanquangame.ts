import {
  PlayerSide,
  MoveDirection,
  RelativeDirection,
  CellState,
  PlayerStats,
  MoveStep,
  MoveLog,
  GameSettings,
  GameSnapshot
} from './gametypes';

export const DEFAULT_SETTINGS: GameSettings = {
  gameMode: 'pve',
  aiDifficulty: (typeof window !== 'undefined' ? (window as any).AIDifficulty?.MEDIUM : undefined) || ('MEDIUM' as any),
  timeLimitPerTurn: 60,
  startingDanPerCell: 5,
  quanValue: 10,
  soundEnabled: true,
  animationSpeed: 'normal'
};

export class OAnQuanGame {
  private board: CellState[];
  private currentPlayer: PlayerSide;
  private player1: PlayerStats;
  private player2: PlayerStats;
  private settings: GameSettings;
  private gameStatus: 'ready' | 'playing' | 'animating' | 'ended';
  private winner?: PlayerSide | 'DRAW';
  private turnCount: number;
  private moveHistory: MoveLog[];

  constructor(settings: Partial<GameSettings> = {}) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
    this.board = [];
    this.currentPlayer = PlayerSide.PLAYER1;
    this.player1 = {
      id: PlayerSide.PLAYER1,
      name: this.settings.player1Name || 'Người chơi 1',
      score: 0,
      danCaptured: 0,
      quanCaptured: 0,
      debt: 0
    };
    this.player2 = {
      id: PlayerSide.PLAYER2,
      name: this.settings.gameMode === 'pve'
        ? (this.settings.player2Name || 'Máy (AI)')
        : (this.settings.player2Name || 'Người chơi 2'),
      score: 0,
      danCaptured: 0,
      quanCaptured: 0,
      debt: 0
    };
    this.gameStatus = 'ready';
    this.turnCount = 1;
    this.moveHistory = [];
    this.initializeBoard();
  }

  public initializeBoard(): void {
    const danPerSquare = this.settings.startingDanPerCell || 5;
    this.board = [
      // 0: Quan Left (Tây)
      { index: 0, isQuan: true, danCount: 0, quanCount: 1 },
      // 1..5: Dan Player 2 (Top row, Left to Right: 1, 2, 3, 4, 5)
      { index: 1, isQuan: false, danCount: danPerSquare, quanCount: 0, owner: PlayerSide.PLAYER2 },
      { index: 2, isQuan: false, danCount: danPerSquare, quanCount: 0, owner: PlayerSide.PLAYER2 },
      { index: 3, isQuan: false, danCount: danPerSquare, quanCount: 0, owner: PlayerSide.PLAYER2 },
      { index: 4, isQuan: false, danCount: danPerSquare, quanCount: 0, owner: PlayerSide.PLAYER2 },
      { index: 5, isQuan: false, danCount: danPerSquare, quanCount: 0, owner: PlayerSide.PLAYER2 },
      // 6: Quan Right (Đông)
      { index: 6, isQuan: true, danCount: 0, quanCount: 1 },
      // 7..11: Dan Player 1 (Bottom row, Right to Left: 7, 8, 9, 10, 11)
      { index: 7, isQuan: false, danCount: danPerSquare, quanCount: 0, owner: PlayerSide.PLAYER1 },
      { index: 8, isQuan: false, danCount: danPerSquare, quanCount: 0, owner: PlayerSide.PLAYER1 },
      { index: 9, isQuan: false, danCount: danPerSquare, quanCount: 0, owner: PlayerSide.PLAYER1 },
      { index: 10, isQuan: false, danCount: danPerSquare, quanCount: 0, owner: PlayerSide.PLAYER1 },
      { index: 11, isQuan: false, danCount: danPerSquare, quanCount: 0, owner: PlayerSide.PLAYER1 }
    ];
    this.gameStatus = 'playing';
  }

  // Clone game instance for AI simulation / immutability
  public clone(): OAnQuanGame {
    const cloned = new OAnQuanGame(this.settings);
    cloned.board = this.board.map(c => ({ ...c }));
    cloned.currentPlayer = this.currentPlayer;
    cloned.player1 = { ...this.player1 };
    cloned.player2 = { ...this.player2 };
    cloned.gameStatus = this.gameStatus;
    cloned.winner = this.winner;
    cloned.turnCount = this.turnCount;
    cloned.moveHistory = [...this.moveHistory];
    return cloned;
  }

  public getPlayerSquares(player: PlayerSide): number[] {
    return player === PlayerSide.PLAYER1 ? [7, 8, 9, 10, 11] : [1, 2, 3, 4, 5];
  }

  public setCurrentPlayer(player: PlayerSide): void {
    this.currentPlayer = player;
  }

  public isValidMove(cellIndex: number, player: PlayerSide = this.currentPlayer): boolean {
    if (this.gameStatus !== 'playing') return false;
    const playerSquares = this.getPlayerSquares(player);
    if (!playerSquares.includes(cellIndex)) return false;
    const cell = this.board[cellIndex];
    return (cell.danCount + cell.quanCount) > 0;
  }

  public getValidMoves(player: PlayerSide = this.currentPlayer): number[] {
    const playerSquares = this.getPlayerSquares(player);
    return playerSquares.filter(idx => this.isValidMove(idx, player));
  }

  public static getNextIndex(current: number, direction: MoveDirection): number {
    return direction === MoveDirection.CLOCKWISE
      ? (current + 1) % 12
      : (current - 1 + 12) % 12;
  }

  public static toMoveDirection(
    player: PlayerSide,
    relativeDir: RelativeDirection
  ): MoveDirection {
    if (player === PlayerSide.PLAYER1) {
      // Bottom player: Left goes towards index 0 (Clockwise: +1), Right goes towards index 6 (Counter-Clockwise: -1)
      return relativeDir === RelativeDirection.LEFT
        ? MoveDirection.CLOCKWISE
        : MoveDirection.COUNTER_CLOCKWISE;
    } else {
      // Top player: Left goes towards index 0 (Counter-Clockwise: -1), Right goes towards index 6 (Clockwise: +1)
      return relativeDir === RelativeDirection.LEFT
        ? MoveDirection.COUNTER_CLOCKWISE
        : MoveDirection.CLOCKWISE;
    }
  }

  public static toRelativeDirection(
    player: PlayerSide,
    direction: MoveDirection
  ): RelativeDirection {
    if (player === PlayerSide.PLAYER1) {
      return direction === MoveDirection.CLOCKWISE
        ? RelativeDirection.LEFT
        : RelativeDirection.RIGHT;
    } else {
      return direction === MoveDirection.COUNTER_CLOCKWISE
        ? RelativeDirection.LEFT
        : RelativeDirection.RIGHT;
    }
  }

  /**
   * Executes a move and returns detailed step-by-step animation sequence
   */
  public executeMove(
    startCell: number,
    direction: MoveDirection
  ): { success: boolean; log?: MoveLog } {
    if (!this.isValidMove(startCell, this.currentPlayer)) {
      return { success: false };
    }

    const steps: MoveStep[] = [];
    const player = this.currentPlayer;
    let earnedDan = 0;
    let earnedQuan = 0;

    let currentCell = startCell;
    let handDan = this.board[currentCell].danCount;
    let handQuan = this.board[currentCell].quanCount;
    this.board[currentCell].danCount = 0;
    this.board[currentCell].quanCount = 0;

    steps.push({
      type: 'PICK_UP',
      cellIndex: currentCell,
      handCount: handDan + handQuan,
      player,
      description: `Bốc ${handDan + handQuan} quân từ ô ${currentCell}`
    });

    while (true) {
      // Distribute pieces in hand
      while (handDan + handQuan > 0) {
        currentCell = OAnQuanGame.getNextIndex(currentCell, direction);
        if (handQuan > 0) {
          this.board[currentCell].quanCount++;
          handQuan--;
        } else {
          this.board[currentCell].danCount++;
          handDan--;
        }
        steps.push({
          type: 'DROP_PIECE',
          cellIndex: currentCell,
          handCount: handDan + handQuan,
          player,
          description: `Rải 1 quân vào ô ${currentCell}`
        });
      }

      // Hand is now empty. Look ahead to next cell
      const nextCell = OAnQuanGame.getNextIndex(currentCell, direction);

      // Case 1: Next cell is Dan square with pieces -> pick up and continue
      if (!this.board[nextCell].isQuan && (this.board[nextCell].danCount + this.board[nextCell].quanCount) > 0) {
        handDan = this.board[nextCell].danCount;
        handQuan = this.board[nextCell].quanCount;
        this.board[nextCell].danCount = 0;
        this.board[nextCell].quanCount = 0;
        currentCell = nextCell;

        steps.push({
          type: 'CONTINUE_PICK',
          cellIndex: currentCell,
          handCount: handDan + handQuan,
          player,
          description: `Bốc tiếp ${handDan + handQuan} quân từ ô ${currentCell}`
        });
        continue;
      }

      // Case 2: Next cell is Quan square with pieces -> Stop
      if (this.board[nextCell].isQuan && (this.board[nextCell].danCount + this.board[nextCell].quanCount) > 0) {
        steps.push({
          type: 'PASS',
          cellIndex: nextCell,
          handCount: 0,
          player,
          description: `Gặp ô Quan có quân (ô ${nextCell}), dừng lượt`
        });
        break;
      }

      // Case 3: Next cell is EMPTY -> check capture!
      if (this.board[nextCell].danCount === 0 && this.board[nextCell].quanCount === 0) {
        let cursorEmptyCell = nextCell;
        let hasCaptured = false;

        while (true) {
          const targetToCapture = OAnQuanGame.getNextIndex(cursorEmptyCell, direction);
          const targetTotal = this.board[targetToCapture].danCount + this.board[targetToCapture].quanCount;

          if (targetTotal > 0) {
            // Capture target!
            const capDan = this.board[targetToCapture].danCount;
            const capQuan = this.board[targetToCapture].quanCount;
            earnedDan += capDan;
            earnedQuan += capQuan;

            this.board[targetToCapture].danCount = 0;
            this.board[targetToCapture].quanCount = 0;
            hasCaptured = true;

            steps.push({
              type: 'CAPTURE',
              cellIndex: targetToCapture,
              handCount: 0,
              capturedDan: capDan,
              capturedQuan: capQuan,
              player,
              description: `Ăn ô ${targetToCapture} (${capDan} Dân, ${capQuan} Quan)!`
            });

            // Check if can continue capturing (Ăn liên hoàn)
            const cellAfterTarget = OAnQuanGame.getNextIndex(targetToCapture, direction);
            if (this.board[cellAfterTarget].danCount === 0 && this.board[cellAfterTarget].quanCount === 0) {
              cursorEmptyCell = cellAfterTarget;
              continue; // Check next
            } else {
              break; // Not an empty cell after target
            }
          } else {
            // 2 consecutive empty cells
            if (!hasCaptured) {
              steps.push({
                type: 'PASS',
                cellIndex: cursorEmptyCell,
                handCount: 0,
                player,
                description: `Cách 2 ô trống, không ăn được quân nào`
              });
            }
            break;
          }
        }
        break; // Finished capture phase, end turn
      }

      // Default break
      break;
    }

    // Update player stats
    const playerStats = player === PlayerSide.PLAYER1 ? this.player1 : this.player2;
    playerStats.danCaptured += earnedDan;
    playerStats.quanCaptured += earnedQuan;
    playerStats.score += earnedDan * 1 + earnedQuan * this.settings.quanValue;

    const log: MoveLog = {
      turnNumber: this.turnCount,
      player,
      startCell,
      direction,
      relativeDirection: OAnQuanGame.toRelativeDirection(player, direction),
      pointsEarned: earnedDan * 1 + earnedQuan * this.settings.quanValue,
      capturedDan: earnedDan,
      capturedQuan: earnedQuan,
      steps
    };
    this.moveHistory.push(log);
    this.turnCount++;

    // Post-turn maintenance: Check game end and check next player's available moves
    this.handleTurnTransition(steps);

    return { success: true, log };
  }

  private handleTurnTransition(steps: MoveStep[]): void {
    // Check if both Quan are empty -> Game over ("Hết quan tàn dân")
    if (this.isBothQuanEmpty()) {
      this.endGame();
      return;
    }

    // Switch player
    this.currentPlayer = this.currentPlayer === PlayerSide.PLAYER1
      ? PlayerSide.PLAYER2
      : PlayerSide.PLAYER1;

    // Check if new player has valid moves
    const validMoves = this.getValidMoves(this.currentPlayer);
    if (validMoves.length === 0) {
      // Need to "Chầu quân" (place 1 piece into each of the 5 squares)
      this.performChauQuan(this.currentPlayer, steps);

      // Re-check after Chau quan
      const postValidMoves = this.getValidMoves(this.currentPlayer);
      if (postValidMoves.length === 0) {
        // Still no moves (both players bankrupt or no stones) -> End game
        this.endGame();
      }
    }
  }

  public performChauQuan(player: PlayerSide, steps?: MoveStep[]): void {
    const squares = this.getPlayerSquares(player);
    const stats = player === PlayerSide.PLAYER1 ? this.player1 : this.player2;
    const opponentStats = player === PlayerSide.PLAYER1 ? this.player2 : this.player1;

    // Cost is 5 stones (5 points)
    const cost = 5;
    if (stats.score >= cost) {
      stats.score -= cost;
      stats.danCaptured = Math.max(0, stats.danCaptured - cost);
    } else {
      // Borrow from opponent
      const deficit = cost - stats.score;
      stats.debt += deficit;
      opponentStats.score += deficit; // Opponent gains debt credit
      stats.score = 0;
      stats.danCaptured = 0;
    }

    // Place 1 stone into each of player's 5 squares
    for (const sq of squares) {
      this.board[sq].danCount = 1;
    }

    if (steps) {
      steps.push({
        type: 'CHAU_QUAN',
        cellIndex: squares[0],
        handCount: 5,
        player,
        description: `${stats.name} chầu 5 quân vào các ô nhà`
      });
    }
  }

  public isBothQuanEmpty(): boolean {
    const quanLeft = this.board[0];
    const quanRight = this.board[6];
    return (quanLeft.danCount + quanLeft.quanCount === 0) &&
           (quanRight.danCount + quanRight.quanCount === 0);
  }

  public endGame(): void {
    if (this.gameStatus === 'ended') return;

    // Collect remaining stones on board for each player ("Tàn dân")
    const p1Squares = this.getPlayerSquares(PlayerSide.PLAYER1);
    for (const sq of p1Squares) {
      const dan = this.board[sq].danCount;
      const quan = this.board[sq].quanCount;
      this.player1.danCaptured += dan;
      this.player1.quanCaptured += quan;
      this.player1.score += dan * 1 + quan * this.settings.quanValue;
      this.board[sq].danCount = 0;
      this.board[sq].quanCount = 0;
    }

    const p2Squares = this.getPlayerSquares(PlayerSide.PLAYER2);
    for (const sq of p2Squares) {
      const dan = this.board[sq].danCount;
      const quan = this.board[sq].quanCount;
      this.player2.danCaptured += dan;
      this.player2.quanCaptured += quan;
      this.player2.score += dan * 1 + quan * this.settings.quanValue;
      this.board[sq].danCount = 0;
      this.board[sq].quanCount = 0;
    }

    // Determine winner based on total score
    if (this.player1.score > this.player2.score) {
      this.winner = PlayerSide.PLAYER1;
    } else if (this.player2.score > this.player1.score) {
      this.winner = PlayerSide.PLAYER2;
    } else {
      this.winner = 'DRAW';
    }

    this.gameStatus = 'ended';
  }

  // Getters
  public getBoard(): CellState[] {
    return this.board.map(c => ({ ...c }));
  }

  public getCurrentPlayer(): PlayerSide {
    return this.currentPlayer;
  }

  public getPlayerStats(player: PlayerSide): PlayerStats {
    return player === PlayerSide.PLAYER1 ? { ...this.player1 } : { ...this.player2 };
  }

  public getGameStatus(): 'ready' | 'playing' | 'animating' | 'ended' {
    return this.gameStatus;
  }

  public getWinner(): PlayerSide | 'DRAW' | undefined {
    return this.winner;
  }

  public getMoveHistory(): MoveLog[] {
    return [...this.moveHistory];
  }

  public getSettings(): GameSettings {
    return { ...this.settings };
  }

  public getSnapshot(): GameSnapshot {
    return {
      board: this.getBoard(),
      currentPlayer: this.currentPlayer,
      player1: { ...this.player1 },
      player2: { ...this.player2 },
      gameStatus: this.gameStatus,
      winner: this.winner,
      turnCount: this.turnCount
    };
  }
}
