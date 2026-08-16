import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { OAnQuanGame } from './game-logic/oanquangame';
import { OAnQuanAI } from './game-logic/oanquanai';
import { PlayerSide, MoveDirection, AIDifficulty } from './game-logic/gametypes';
import { leaderboardManager } from './utils/leaderboardManager';

describe('Ô Ăn Quan Game Engine Tests', () => {
  test('Khởi tạo bàn cờ 12 ô chuẩn xác với 50 Dân và 2 Quan', () => {
    const game = new OAnQuanGame();
    const board = game.getBoard();

    expect(board.length).toBe(12);

    // 2 Ô quan (0 và 6)
    expect(board[0].isQuan).toBe(true);
    expect(board[0].quanCount).toBe(1);
    expect(board[0].danCount).toBe(0);

    expect(board[6].isQuan).toBe(true);
    expect(board[6].quanCount).toBe(1);
    expect(board[6].danCount).toBe(0);

    // 10 Ô dân (1..5 của P2, 7..11 của P1)
    const p1Squares = [7, 8, 9, 10, 11];
    const p2Squares = [1, 2, 3, 4, 5];

    p1Squares.forEach(idx => {
      expect(board[idx].isQuan).toBe(false);
      expect(board[idx].danCount).toBe(5);
      expect(board[idx].owner).toBe(PlayerSide.PLAYER1);
    });

    p2Squares.forEach(idx => {
      expect(board[idx].isQuan).toBe(false);
      expect(board[idx].danCount).toBe(5);
      expect(board[idx].owner).toBe(PlayerSide.PLAYER2);
    });
  });

  test('Người chơi 1 thực hiện nước đi hợp lệ và đổi lượt', () => {
    const game = new OAnQuanGame();
    expect(game.getCurrentPlayer()).toBe(PlayerSide.PLAYER1);

    // Đi ô 11 theo chiều kim đồng hồ (sang trái về hướng ô Quan 0)
    const result = game.executeMove(11, MoveDirection.CLOCKWISE);
    expect(result.success).toBe(true);
    expect(result.log).toBeDefined();
    expect(result.log?.startCell).toBe(11);
    expect(result.log?.steps.length).toBeGreaterThan(0);

    // Sau nước đi thành công, chuyển lượt sang Player 2
    expect(game.getCurrentPlayer()).toBe(PlayerSide.PLAYER2);
  });

  test('AI engine chọn được nước đi hợp lệ ở cả 5 cấp độ từ Dễ đến Kiện Tướng', () => {
    const game = new OAnQuanGame({ gameMode: 'pve' });
    const ai = new OAnQuanAI();

    [
      AIDifficulty.EASY,
      AIDifficulty.MEDIUM,
      AIDifficulty.HARD,
      AIDifficulty.MASTER,
      AIDifficulty.GRANDMASTER
    ].forEach(diff => {
      ai.setDifficulty(diff);
      const move = ai.chooseMove(game);
      expect(move).not.toBeNull();
      expect([1, 2, 3, 4, 5]).toContain(move?.cellIndex);
    });
  });
});

describe('Ô Ăn Quan Leaderboard Tests', () => {
  test('LeaderboardManager lưu và tính toán thống kê chính xác', () => {
    const initialCount = leaderboardManager.getMatches().length;
    expect(initialCount).toBeGreaterThan(0);

    const stats = leaderboardManager.getStats();
    expect(stats.totalMatches).toBe(initialCount);
    expect(stats.highestScore).toBeGreaterThan(0);
  });
});

describe('Ô Ăn Quan UI Rendering Tests', () => {
  test('Render giao diện chính, tiêu đề, nút Bảng Xếp Hạng và các thanh điều khiển', () => {
    render(<App />);

    // Kiểm tra logo và tiêu đề
    expect(screen.getAllByText(/Ô ĂN QUAN/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Quan Lại & Nông Dân Cổ Truyền/i)).toBeInTheDocument();

    // Kiểm tra các nút điều khiển
    expect(screen.getByTitle('Chuyển đổi giao diện 3D / 2.5D Cổ truyền')).toBeInTheDocument();
    expect(screen.getByTitle('Xem Bảng Xếp Hạng và Lịch Sử Ván Đấu')).toBeInTheDocument();
    expect(screen.getByTitle('Hướng dẫn luật chơi')).toBeInTheDocument();
    expect(screen.getByTitle('Cài đặt trò chơi')).toBeInTheDocument();
    expect(screen.getByTitle('Ván mới')).toBeInTheDocument();

    // Mở modal Bảng Xếp Hạng
    fireEvent.click(screen.getByTitle('Xem Bảng Xếp Hạng và Lịch Sử Ván Đấu'));
    expect(screen.getByText(/Bảng Xếp Hạng & Lịch Sử Ván Đấu/i)).toBeInTheDocument();

    // Kiểm tra nút Chia Sẻ
    expect(screen.getByTitle('Chia sẻ trò chơi và gửi lời thách đấu')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Chia sẻ trò chơi và gửi lời thách đấu'));
    expect(screen.getByText(/Chia Sẻ & Quảng Bá Trò Chơi/i)).toBeInTheDocument();
  });
});
