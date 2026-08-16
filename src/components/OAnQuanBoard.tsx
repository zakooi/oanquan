import React, { useState } from 'react';
import {
  CellState,
  PlayerSide,
  RelativeDirection,
  FloatingDelta
} from '../game-logic/gametypes';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';
import { QuanLaiAvatar, NongDanAvatar } from './CharacterAvatars';

interface OAnQuanBoardProps {
  board: CellState[];
  currentPlayer: PlayerSide;
  isAnimating: boolean;
  activeCellIndex: number | null;
  animatingHandCount: number | null;
  floatingDeltas?: FloatingDelta[];
  onSelectMove: (cellIndex: number, relativeDir: RelativeDirection) => void;
  disabled?: boolean;
}

export const OAnQuanBoard: React.FC<OAnQuanBoardProps> = ({
  board,
  currentPlayer,
  isAnimating,
  activeCellIndex,
  animatingHandCount,
  floatingDeltas = [],
  onSelectMove,
  disabled = false
}) => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  const isPlayerCell = (index: number): boolean => {
    if (currentPlayer === PlayerSide.PLAYER1) {
      return [7, 8, 9, 10, 11].includes(index);
    } else {
      return [1, 2, 3, 4, 5].includes(index);
    }
  };

  const isCellSelectable = (index: number): boolean => {
    if (disabled || isAnimating) return false;
    if (!isPlayerCell(index)) return false;
    const cell = board[index];
    return cell && (cell.danCount + cell.quanCount) > 0;
  };

  const handleCellClick = (index: number) => {
    if (!isCellSelectable(index)) return;
    if (selectedCell === index) {
      setSelectedCell(null);
    } else {
      setSelectedCell(index);
    }
  };

  const handleDirectionClick = (e: React.MouseEvent, relDir: RelativeDirection) => {
    e.stopPropagation();
    if (selectedCell === null) return;
    const chosenCell = selectedCell;
    setSelectedCell(null);
    onSelectMove(chosenCell, relDir);
  };

  // Render tokens (Quan Lại & Nông Dân + Sỏi)
  const renderStones = (cell: CellState) => {
    const totalDan = cell.danCount;
    const totalQuan = cell.quanCount;
    const visibleDan = Math.min(totalDan, 10);

    return (
      <div className="stones-container">
        {totalQuan > 0 && (
          <div className="quan-avatar-wrapper animate-pulse">
            <QuanLaiAvatar size={48} />
          </div>
        )}

        {totalDan > 0 && (
          <div className="dan-group-wrapper">
            {!cell.isQuan && (
              <div className="nong-dan-badge">
                <NongDanAvatar size={34} />
              </div>
            )}
            <div className="dan-stones-grid">
              {Array.from({ length: visibleDan }).map((_, i) => (
                <div
                  key={i}
                  className="dan-stone"
                  style={{
                    transform: `rotate(${(i * 47) % 360}deg) scale(${0.85 + (i % 3) * 0.1})`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFloatingDeltas = (index: number) => {
    const deltas = floatingDeltas.filter(d => d.cellIndex === index);
    if (deltas.length === 0) return null;

    return (
      <div className="cell-deltas-layer">
        {deltas.map(d => (
          <div key={d.id} className={`floating-delta-badge delta-${d.type}`}>
            {d.deltaText}
          </div>
        ))}
      </div>
    );
  };

  const renderDanCell = (index: number) => {
    const cell = board[index];
    if (!cell) return null;

    const selectable = isCellSelectable(index);
    const isSelected = selectedCell === index;
    const isActiveInAnimation = activeCellIndex === index;
    const belongsToP1 = [7, 8, 9, 10, 11].includes(index);

    return (
      <div
        key={index}
        className={`board-cell dan-cell ${belongsToP1 ? 'p1-cell' : 'p2-cell'} ${
          selectable ? 'selectable' : ''
        } ${isSelected ? 'selected' : ''} ${isActiveInAnimation ? 'animating-active' : ''}`}
        onClick={() => handleCellClick(index)}
      >
        <div className="cell-header">
          <span className="cell-id">Ô {index}</span>
          <span className="stone-badge">
            {cell.danCount + cell.quanCount}
          </span>
        </div>

        {renderStones(cell)}
        {renderFloatingDeltas(index)}

        {/* Direction selection overlay */}
        {isSelected && !isAnimating && (
          <div className="direction-picker animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button
              className="dir-btn dir-left"
              title="Rải về bên Trái"
              onClick={(e) => handleDirectionClick(e, RelativeDirection.LEFT)}
            >
              <ArrowLeftIcon size={18} />
              <span>Trái</span>
            </button>
            <button
              className="dir-btn dir-right"
              title="Rải về bên Phải"
              onClick={(e) => handleDirectionClick(e, RelativeDirection.RIGHT)}
            >
              <span>Phải</span>
              <ArrowRightIcon size={18} />
            </button>
          </div>
        )}

        {/* Hand animation overlay */}
        {isActiveInAnimation && animatingHandCount !== null && animatingHandCount > 0 && (
          <div className="floating-hand-badge">
            <span>✋ {animatingHandCount}</span>
          </div>
        )}
      </div>
    );
  };

  const renderQuanCell = (index: number, positionName: string) => {
    const cell = board[index];
    if (!cell) return null;
    const isActiveInAnimation = activeCellIndex === index;

    return (
      <div
        className={`board-cell quan-cell ${index === 0 ? 'quan-left' : 'quan-right'} ${
          isActiveInAnimation ? 'animating-active' : ''
        }`}
      >
        <div className="cell-header">
          <span className="cell-id">{positionName}</span>
          <span className="stone-badge quan-badge">
            {cell.danCount + (cell.quanCount > 0 ? 10 : 0)}
          </span>
        </div>

        {renderStones(cell)}
        {renderFloatingDeltas(index)}

        {isActiveInAnimation && animatingHandCount !== null && animatingHandCount > 0 && (
          <div className="floating-hand-badge">
            <span>✋ {animatingHandCount}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="board-outer-wrapper">
      <div className="wooden-board-frame">
        {/* Quan Left (Tây - Index 0) */}
        {renderQuanCell(0, 'Quan Tây')}

        {/* Center 2 rows of 5 Dan cells */}
        <div className="dan-rows-container">
          {/* Top Row: Player 2 (1, 2, 3, 4, 5) */}
          <div className="dan-row top-row">
            {[1, 2, 3, 4, 5].map(idx => renderDanCell(idx))}
          </div>

          {/* Bottom Row: Player 1 (11, 10, 9, 8, 7) */}
          <div className="dan-row bottom-row">
            {[11, 10, 9, 8, 7].map(idx => renderDanCell(idx))}
          </div>
        </div>

        {/* Quan Right (Đông - Index 6) */}
        {renderQuanCell(6, 'Quan Đông')}
      </div>
    </div>
  );
};
