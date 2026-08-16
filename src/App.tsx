import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import {
  PlayerSide,
  RelativeDirection,
  GameSettings,
  GameSnapshot,
  MoveStep,
  FloatingDelta,
  MatchRecord,
  StoryAvatarId,
  CampaignChapter
} from './game-logic/gametypes';
import { OAnQuanGame, DEFAULT_SETTINGS } from './game-logic/oanquangame';
import { OAnQuanAI } from './game-logic/oanquanai';
import { soundManager } from './utils/soundmanager';
import { leaderboardManager } from './utils/leaderboardManager';
import { campaignManager, computeStars } from './utils/campaignManager';
import { getCharacterById, getChapterById, buildChapterSettings } from './game-logic/storydata';
import { OAnQuanBoard } from './components/OAnQuanBoard';
import { OAnQuan3DBoard } from './components/OAnQuan3DBoard';
import { PlayerPanel } from './components/PlayerPanel';
import { GameSettingsModal } from './components/GameSettingsModal';
import { TutorialModal } from './components/TutorialModal';
import { GameOverModal } from './components/GameOverModal';
import { MoveHistoryDrawer } from './components/MoveHistoryDrawer';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ShareModal } from './components/ShareModal';
import { CampaignModal } from './components/CampaignModal';
import { DialogueOverlay } from './components/DialogueOverlay';
import {
  Volume2Icon,
  VolumeXIcon,
  RotateCcwIcon,
  SettingsIcon,
  BookOpenIcon,
  HistoryIcon,
  SparklesIcon,
  TrophyIcon,
  Share2Icon
} from './components/Icons';

interface DialogueLine {
  line: string;
  speakerName: string;
  speakerTitle?: string;
  avatarId: StoryAvatarId;
  color: string;
  side: 'left' | 'right';
}

/** Sinh đoạn tường thuật ngắn tóm tắt một ván campaign. */
function buildMatchNarration(
  chapterLabel: string,
  playerName: string,
  opponentName: string,
  snapshot: GameSnapshot
): string {
  const p1 = snapshot.player1;
  const p2 = snapshot.player2;
  const parts: string[] = [];
  parts.push(`${chapterLabel} khép lại với tỉ số ${p1.score} - ${p2.score}.`);
  if (p1.quanCaptured > 0) {
    parts.push(`${playerName} thu về ${p1.quanCaptured} kho thóc lớn.`);
  }
  if (snapshot.winner === PlayerSide.PLAYER1) {
    parts.push(`Vụ mùa về tay ${playerName} — ${opponentName} đành ngả mũ thán phục.`);
  } else if (snapshot.winner === 'DRAW') {
    parts.push('Hai bờ sông hòa nhau — mùa này cả làng cùng chia sẻ.');
  } else {
    parts.push(`${opponentName} bảo toàn vụ mùa. Hãy gieo lại, mùa sau sẽ khác!`);
  }
  return parts.join(' ');
}

function App() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [boardMode, setBoardMode] = useState<'2d' | '3d'>('3d'); // Mặc định mở bản 3D
  const gameRef = useRef<OAnQuanGame>(new OAnQuanGame(DEFAULT_SETTINGS));
  const aiRef = useRef<OAnQuanAI>(new OAnQuanAI(DEFAULT_SETTINGS.aiDifficulty));

  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => gameRef.current.getSnapshot());
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);
  const [animatingHandCount, setAnimatingHandCount] = useState<number | null>(null);
  const [floatingDeltas, setFloatingDeltas] = useState<FloatingDelta[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Chào mừng bạn đến với Ô Ăn Quan 3D!');
  const [timeLeft, setTimeLeft] = useState<number>(settings.timeLimitPerTurn);
  const [lastMatchRecord, setLastMatchRecord] = useState<MatchRecord | null>(null);

  // Cốt truyện / Campaign state
  const [activeChapter, setActiveChapter] = useState<CampaignChapter | null>(null);
  const [isCampaignOpen, setIsCampaignOpen] = useState<boolean>(false);
  const [dialogue, setDialogue] = useState<DialogueLine | null>(null);
  const dialogueTimeoutRef = useRef<number | null>(null);
  const [matchNarration, setMatchNarration] = useState<string | null>(null);
  const [matchStars, setMatchStars] = useState<number>(0);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  // Synchronize sound settings
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
    aiRef.current.setDifficulty(settings.aiDifficulty);
  }, [settings]);

  // Trigger a floating number effect on a cell
  const triggerDelta = useCallback((cellIndex: number, deltaText: string, type: 'increase' | 'decrease' | 'capture') => {
    const id = Date.now() + Math.random();
    const newDelta: FloatingDelta = { id, cellIndex, deltaText, type };
    setFloatingDeltas(prev => [...prev.slice(-12), newDelta]);
    setTimeout(() => {
      setFloatingDeltas(prev => prev.filter(d => d.id !== id));
    }, 1200);
  }, []);

  // Hiện bong bóng thoại kể chuyện, tự ẩn sau `duration` ms
  const showDialogue = useCallback((d: DialogueLine, duration = 3600) => {
    setDialogue(d);
    if (dialogueTimeoutRef.current) window.clearTimeout(dialogueTimeoutRef.current);
    dialogueTimeoutRef.current = window.setTimeout(() => {
      setDialogue(null);
    }, duration);
  }, []);

  // Restart new game (ván nhanh / cài đặt)
  const handleNewGame = useCallback((customSettings?: GameSettings) => {
    const activeSettings = customSettings || settings;
    const newGame = new OAnQuanGame(activeSettings);
    gameRef.current = newGame;
    setSnapshot(newGame.getSnapshot());
    setIsAnimating(false);
    setActiveCellIndex(null);
    setAnimatingHandCount(null);
    setFloatingDeltas([]);
    setIsGameOverOpen(false);
    setTimeLeft(activeSettings.timeLimitPerTurn);
    setActiveChapter(null);
    setMatchNarration(null);
    setMatchStars(0);
    setDialogue(null);
    setStatusMessage('Ván mới bắt đầu! Lượt của ' + (newGame.getCurrentPlayer() === PlayerSide.PLAYER1 ? 'Người chơi 1' : 'Người chơi 2'));
  }, [settings]);

  // Bắt đầu một chương campaign (mùa)
  const startChapter = useCallback((chapter: CampaignChapter) => {
    const playerName = campaignManager.getPlayerName();
    const chapterSettings = buildChapterSettings(chapter, playerName, settings);
    const newGame = new OAnQuanGame(chapterSettings);
    gameRef.current = newGame;
    aiRef.current.setDifficulty(chapterSettings.aiDifficulty);
    setSettings(chapterSettings);
    setActiveChapter(chapter);
    setSnapshot(newGame.getSnapshot());
    setIsAnimating(false);
    setActiveCellIndex(null);
    setAnimatingHandCount(null);
    setFloatingDeltas([]);
    setIsGameOverOpen(false);
    setTimeLeft(chapterSettings.timeLimitPerTurn);
    setMatchNarration(null);
    setMatchStars(0);
    setDialogue(null);
    setIsCampaignOpen(false);
    setStatusMessage(`Mùa ${chapter.id} — ${chapter.seasonName} bắt đầu!`);

    const opponent = getCharacterById(chapter.opponentId);
    showDialogue(
      {
        line: opponent.introLine,
        speakerName: opponent.name,
        speakerTitle: opponent.title,
        avatarId: opponent.avatarId,
        color: opponent.color,
        side: 'left'
      },
      5200
    );
  }, [settings, showDialogue]);

  // Animation player for move steps
  const playMoveAnimation = useCallback(
    async (steps: MoveStep[], finalSnapshot: GameSnapshot) => {
      setIsAnimating(true);

      const delayMap = {
        slow: 420,
        normal: 260,
        fast: 140
      };
      const stepDelay = delayMap[settings.animationSpeed] || 260;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setActiveCellIndex(step.cellIndex);
        setAnimatingHandCount(step.handCount);
        setStatusMessage(step.description);

        if (step.type === 'DROP_PIECE') {
          soundManager.playDrop();
          triggerDelta(step.cellIndex, '+1', 'increase');
        } else if (step.type === 'PICK_UP' || step.type === 'CONTINUE_PICK') {
          soundManager.playPick();
          triggerDelta(step.cellIndex, `-${step.handCount}`, 'decrease');
        } else if (step.type === 'CAPTURE') {
          const capDan = step.capturedDan || 0;
          const capQuan = step.capturedQuan || 0;
          const totalPoints = capDan * 1 + capQuan * 10;
          soundManager.playCapture(capQuan > 0);
          triggerDelta(step.cellIndex, `+${totalPoints}đ (ĂN)`, 'capture');

          // Phản ứng khi ăn Quan trong campaign
          if (capQuan > 0 && activeChapter) {
            const opponent = getCharacterById(activeChapter.opponentId);
            if (step.player === PlayerSide.PLAYER2) {
              showDialogue({
                line: opponent.tauntLine,
                speakerName: opponent.name,
                speakerTitle: opponent.title,
                avatarId: opponent.avatarId,
                color: opponent.color,
                side: 'left'
              }, 2800);
            } else {
              showDialogue({
                line: 'Ăn trọn một quân Quan! Mùa màng năm nay bội thu!',
                speakerName: finalSnapshot.player1.name,
                speakerTitle: 'Nông Dân bờ Nam',
                avatarId: 'nongdan',
                color: '#16a34a',
                side: 'right'
              }, 2800);
            }
          }
        } else if (step.type === 'CHAU_QUAN') {
          soundManager.playChauQuan();
          const playerSquares = step.player === PlayerSide.PLAYER1 ? [7, 8, 9, 10, 11] : [1, 2, 3, 4, 5];
          playerSquares.forEach(sq => triggerDelta(sq, '+1', 'increase'));
        }

        await new Promise(resolve => setTimeout(resolve, stepDelay));
      }

      // Finish animation
      setActiveCellIndex(null);
      setAnimatingHandCount(null);
      setSnapshot(finalSnapshot);
      setIsAnimating(false);
      setTimeLeft(settings.timeLimitPerTurn);

      if (finalSnapshot.gameStatus === 'ended') {
        soundManager.playVictory();
        setIsGameOverOpen(true);
        setStatusMessage('Ván cờ đã kết thúc! Hãy xem bảng tổng kết.');

        // Lưu kết quả vào Bảng Xếp Hạng & lưu kỷ lục chia sẻ
        const matchRecord = leaderboardManager.createRecordFromGame(
          finalSnapshot,
          settings,
          boardMode
        );
        leaderboardManager.saveMatch(matchRecord);
        setLastMatchRecord(matchRecord);

        // Cốt truyện: chấm sao + tường thuật + lời thoại kết
        if (activeChapter) {
          const opponent = getCharacterById(activeChapter.opponentId);
          const stars = computeStars(
            finalSnapshot.winner || 'DRAW',
            finalSnapshot.player1.score,
            finalSnapshot.player2.score
          );
          setMatchStars(stars);
          if (stars > 0) {
            campaignManager.recordResult(activeChapter.id, stars);
          }
          setMatchNarration(
            buildMatchNarration(
              `Mùa ${activeChapter.id} — ${activeChapter.seasonName}`,
              finalSnapshot.player1.name,
              opponent.name,
              finalSnapshot
            )
          );
          showDialogue(
            {
              line: finalSnapshot.winner === PlayerSide.PLAYER1 ? opponent.defeatLine : opponent.victoryLine,
              speakerName: opponent.name,
              speakerTitle: opponent.title,
              avatarId: opponent.avatarId,
              color: opponent.color,
              side: 'left'
            },
            5200
          );
        } else {
          setMatchNarration(null);
          setMatchStars(0);
        }
      } else {
        const currentName =
          finalSnapshot.currentPlayer === PlayerSide.PLAYER1
            ? finalSnapshot.player1.name
            : finalSnapshot.player2.name;
        setStatusMessage(`Đến lượt của ${currentName}`);
      }
    },
    [settings, boardMode, triggerDelta, activeChapter, showDialogue]
  );

  // Perform move
  const handlePerformMove = useCallback(
    (cellIndex: number, relativeDir: RelativeDirection) => {
      if (isAnimating || snapshot.gameStatus === 'ended') return;

      const game = gameRef.current;
      const player = game.getCurrentPlayer();
      const effectiveDir = settings.lockedDirection || relativeDir;
      const moveDir = OAnQuanGame.toMoveDirection(player, effectiveDir);

      const res = game.executeMove(cellIndex, moveDir);
      if (res.success && res.log) {
        const newSnapshot = game.getSnapshot();
        playMoveAnimation(res.log.steps, newSnapshot);
      }
    },
    [isAnimating, snapshot.gameStatus, playMoveAnimation, settings.lockedDirection]
  );

  // AI Turn triggering
  useEffect(() => {
    if (
      !isAnimating &&
      snapshot.gameStatus === 'playing' &&
      snapshot.currentPlayer === PlayerSide.PLAYER2 &&
      settings.gameMode === 'pve'
    ) {
      setStatusMessage('Máy (AI) đang suy nghĩ nước đi...');

      const aiTimer = setTimeout(() => {
        const aiMove = aiRef.current.chooseMove(gameRef.current);
        if (aiMove) {
          handlePerformMove(aiMove.cellIndex, aiMove.relativeDirection);
        }
      }, 700);

      return () => clearTimeout(aiTimer);
    }
  }, [snapshot.currentPlayer, snapshot.gameStatus, isAnimating, settings.gameMode, handlePerformMove]);

  // Turn Timer countdown
  useEffect(() => {
    if (isAnimating || snapshot.gameStatus !== 'playing' || settings.timeLimitPerTurn <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto move when time runs out
          const game = gameRef.current;
          const validMoves = game.getValidMoves(game.getCurrentPlayer());
          if (validMoves.length > 0) {
            const randomCell = validMoves[Math.floor(Math.random() * validMoves.length)];
            const randomDir = Math.random() < 0.5 ? RelativeDirection.LEFT : RelativeDirection.RIGHT;
            handlePerformMove(randomCell, randomDir);
          }
          return settings.timeLimitPerTurn;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnimating, snapshot.gameStatus, settings.timeLimitPerTurn, handlePerformMove]);

  // Toggle sound
  const handleToggleSound = () => {
    const nextSound = !settings.soundEnabled;
    setSettings(prev => ({ ...prev, soundEnabled: nextSound }));
    soundManager.setEnabled(nextSound);
  };

  // Toggle 3D / 2.5D board
  const handleToggleBoardMode = () => {
    setBoardMode(prev => (prev === '3d' ? '2d' : '3d'));
  };

  // Save settings from modal
  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    handleNewGame(newSettings);
  };

  return (
    <div className="app-layout">
      {/* Header bar */}
      <header className="app-header">
        <div className="header-left">
          <div className="game-logo">
            <span className="logo-icon">🏮</span>
            <div className="logo-text-group">
              <h1 className="logo-title">Ô ĂN QUAN {boardMode === '3d' ? '3D' : ''}</h1>
              <span className="logo-subtitle">Quan Lại & Nông Dân Cổ Truyền</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Nút chuyển đổi chế độ 3D / 2.5D */}
          <button
            className={`action-btn mode-switch-btn ${boardMode === '3d' ? 'active-3d' : ''}`}
            onClick={handleToggleBoardMode}
            title="Chuyển đổi giao diện 3D / 2.5D Cổ truyền"
          >
            <SparklesIcon size={18} />
            <span>{boardMode === '3d' ? 'Bản 3D' : 'Bản 2.5D'}</span>
          </button>

          {/* Nút Hành Trình (Campaign) */}
          <button
            className="action-btn campaign-nav-btn"
            onClick={() => setIsCampaignOpen(true)}
            title="Hành Trình Làng Đôi Bờ"
          >
            <span className="campaign-nav-emoji">🏡</span>
            <span className="btn-label-desktop">Hành Trình</span>
          </button>

          {/* Nút Bảng Xếp Hạng */}
          <button
            className="action-btn leaderboard-nav-btn"
            onClick={() => setIsLeaderboardOpen(true)}
            title="Xem Bảng Xếp Hạng và Lịch Sử Ván Đấu"
          >
            <TrophyIcon size={20} />
            <span className="btn-label-desktop">Xếp Hạng</span>
          </button>

          {/* Nút Chia Sẻ & Mời Chơi */}
          <button
            className="action-btn share-nav-btn"
            onClick={() => setIsShareOpen(true)}
            title="Chia sẻ trò chơi và gửi lời thách đấu"
          >
            <Share2Icon size={20} />
            <span className="btn-label-desktop">Chia Sẻ</span>
          </button>

          <button
            className={`action-btn ${settings.soundEnabled ? 'active' : ''}`}
            onClick={handleToggleSound}
            title={settings.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {settings.soundEnabled ? <Volume2Icon size={20} /> : <VolumeXIcon size={20} />}
          </button>

          <button
            className="action-btn"
            onClick={() => setIsTutorialOpen(true)}
            title="Hướng dẫn luật chơi"
          >
            <BookOpenIcon size={20} />
            <span className="btn-label-desktop">Luật Chơi</span>
          </button>

          <button
            className="action-btn"
            onClick={() => setIsHistoryOpen(true)}
            title="Lịch sử nước đi của ván hiện tại"
          >
            <HistoryIcon size={20} />
            <span className="btn-label-desktop">Lịch Sử</span>
          </button>

          <button
            className="action-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Cài đặt trò chơi"
          >
            <SettingsIcon size={20} />
            <span className="btn-label-desktop">Cài Đặt</span>
          </button>

          <button
            className="action-btn restart-btn"
            onClick={() => {
              if (activeChapter) {
                startChapter(activeChapter);
              } else {
                handleNewGame();
              }
            }}
            title="Ván mới"
          >
            <RotateCcwIcon size={20} />
            <span className="btn-label-desktop">Ván Mới</span>
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="game-arena">
        {/* Top Player (Player 2 / AI) */}
        <PlayerPanel
          stats={snapshot.player2}
          isCurrentTurn={snapshot.currentPlayer === PlayerSide.PLAYER2 && snapshot.gameStatus === 'playing'}
          timeLeft={snapshot.currentPlayer === PlayerSide.PLAYER2 ? timeLeft : undefined}
          isAI={settings.gameMode === 'pve'}
          avatarId={settings.opponentAvatar}
          position="top"
        />

        {/* Center Arena Status Bar */}
        <div className="status-announcer animate-fade-in">
          <span className="announcer-dot" />
          <span className="announcer-text">{statusMessage}</span>
        </div>

        {/* Board View (3D or 2.5D) */}
        {boardMode === '3d' ? (
          <OAnQuan3DBoard
            board={snapshot.board}
            currentPlayer={snapshot.currentPlayer}
            isAnimating={isAnimating}
            activeCellIndex={activeCellIndex}
            animatingHandCount={animatingHandCount}
            floatingDeltas={floatingDeltas}
            onSelectMove={handlePerformMove}
            disabled={
              snapshot.gameStatus === 'ended' ||
              (settings.gameMode === 'pve' && snapshot.currentPlayer === PlayerSide.PLAYER2)
            }
          />
        ) : (
          <OAnQuanBoard
            board={snapshot.board}
            currentPlayer={snapshot.currentPlayer}
            isAnimating={isAnimating}
            activeCellIndex={activeCellIndex}
            animatingHandCount={animatingHandCount}
            floatingDeltas={floatingDeltas}
            onSelectMove={handlePerformMove}
            disabled={
              snapshot.gameStatus === 'ended' ||
              (settings.gameMode === 'pve' && snapshot.currentPlayer === PlayerSide.PLAYER2)
            }
          />
        )}

        {/* Bottom Player (Player 1 / Human) */}
        <PlayerPanel
          stats={snapshot.player1}
          isCurrentTurn={snapshot.currentPlayer === PlayerSide.PLAYER1 && snapshot.gameStatus === 'playing'}
          timeLeft={snapshot.currentPlayer === PlayerSide.PLAYER1 ? timeLeft : undefined}
          isAI={false}
          avatarId={activeChapter ? 'nongdan' : undefined}
          position="bottom"
        />
      </main>

      {/* Bong bóng thoại kể chuyện */}
      {dialogue && (
        <DialogueOverlay
          line={dialogue.line}
          speakerName={dialogue.speakerName}
          speakerTitle={dialogue.speakerTitle}
          avatarId={dialogue.avatarId}
          color={dialogue.color}
          side={dialogue.side}
        />
      )}

      {/* Modals & Drawers */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        matchRecord={lastMatchRecord}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <GameOverModal
        isOpen={isGameOverOpen}
        winner={snapshot.winner}
        player1={snapshot.player1}
        player2={snapshot.player2}
        narration={matchNarration}
        stars={matchStars}
        isCampaign={!!activeChapter}
        onNewGame={() => {
          if (activeChapter) {
            startChapter(activeChapter);
          } else {
            handleNewGame();
          }
        }}
        onNextChapter={
          activeChapter && getChapterById(activeChapter.id + 1)
            ? () => startChapter(getChapterById(activeChapter.id + 1)!)
            : undefined
        }
        onReviewBoard={() => setIsGameOverOpen(false)}
        onOpenShare={() => {
          setIsGameOverOpen(false);
          setIsShareOpen(true);
        }}
        onOpenLeaderboard={() => {
          setIsGameOverOpen(false);
          setIsLeaderboardOpen(true);
        }}
        onOpenHistory={() => {
          setIsGameOverOpen(false);
          setIsHistoryOpen(true);
        }}
      />

      <CampaignModal
        isOpen={isCampaignOpen}
        onClose={() => setIsCampaignOpen(false)}
        onSelectChapter={startChapter}
      />

      <MoveHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={gameRef.current.getMoveHistory()}
      />
    </div>
  );
}

export default App;
