# DECISIONS.md — Nhật ký quyết định và điểm lệch

File này ghi lại **mọi quyết định quan trọng** và **mọi điểm lệch so với mục tiêu của người dùng** khi viết mã, theo quy tắc chung trong `~/.dsh/AGENTS.md`.

- Mỗi mục nhập được **append theo thứ tự thời gian** (mục mới nhất ở cuối).
- Cấu trúc mỗi mục: Trạng thái / Quyết định / Lý do / Phương án thay thế đã cân nhắc / Lệch so với mục tiêu người dùng.

---

## [2026-08-15] Khôi phục mã nguồn gốc từ source map

- **Trạng thái:** Accepted
- **Quyết định:** Dự án `o-an-quan-game` chỉ còn thư mục `build/` (bản build đã biên dịch), toàn bộ mã nguồn `src/` và `public/` đã bị mất. Đã trích xuất 19 file mã nguồn gốc (TypeScript/TSX) từ `build/static/js/main.*.js.map` (trường `sourcesContent`) về đúng cấu trúc `src/` (game-logic, utils, components, App, index, reportWebVitals), đọc source map bằng UTF-8 tường minh để giữ nguyên tiếng Việt có dấu.
- **Lý do:** Cần đọc hiểu logic game hiện tại trước khi đề xuất/phát triển tính năng mới; source map vẫn còn nguyên nội dung mã nguồn nên khôi phục không mất dữ liệu.
- **Phương án thay thế đã cân nhắc:** (1) Chỉ đọc source map tạm thời không ghi ra file — bị bỏ vì khôi phục về `src/` giúp dự án chạy và chỉnh sửa được ngay, đồng thời tạo nền cho các phiên sau. (2) Viết lại game từ đầu — bị bỏ vì tốn công và không cần thiết khi mã gốc còn đầy đủ.
- **Lệch so với mục tiêu người dùng:** CÓ — mã nguồn gốc bị mất khỏi thư mục dự án (chỉ còn bản build). Điểm lệch này có sẵn trước khi bắt đầu, đã khắc phục bằng cách khôi phục từ source map; không làm thay đổi hành vi game.

---

## [2026-08-15] Chọn hướng cốt truyện "Làng Đôi Bờ" + chế độ Campaign

- **Trạng thái:** Accepted
- **Quyết định:** Để làm game hấp dẫn hơn (không chỉ dựa vào độ khó), chọn hướng cốt truyện **"Làng Đôi Bờ"** — mỗi ván cờ là một mùa thu hoạch giữa Quan Lại và Nông Dân, bàn cờ là cánh đồng. Bổ sung: roster đối thủ có tên/tính cách/lời thoại, chế độ **Campaign** theo chương (mỗi chương một biến thể luật nhẹ), tường thuật mở đầu/cao trào/kết ván, sự kiện mùa ngẫu nhiên, danh hiệu & thành tích.
- **Lý do:** Game hiện tại thuần cơ chế, chưa có cốt truyện, nhân vật có hồn, tiến trình hay phần thưởng — đây là khoảng trống lớn nhất để tăng sức hút mà không phá luật Ô Ăn Quan truyền thống. Hướng A tận dụng sẵn theme "Quan Lại & Nông Dân Cổ Truyền" và hai avatar đã có.
- **Phương án thay thế đã cân nhắc:** (1) Hướng B "Truyền thuyết Viên Ngọc" (thần thoại) — bị bỏ vì phải xây lại toàn bộ mỹ thuật/âm thanh theo tông huyền bí, tốn công hơn. (2) Hướng C "Hồi ức làng quê" (hoài niệm) — bị bỏ vì thiên về định vị văn hóa hơn là gameplay; có thể kết hợp về sau. (3) Chỉ tăng độ khó AI — bị bỏ vì người dùng yêu cầu sáng tạo cốt truyện, không chỉ độ khó.
- **Lệch so với mục tiêu người dùng:** KHÔNG.

---

## [2026-08-15] Hiện thực hóa cốt truyện + Campaign (đã build thành công)

- **Trạng thái:** Accepted
- **Quyết định:** Hiện thực hóa hướng A thành tính năng chạy được:
  1. Thêm type `StoryCharacter`, `SeasonModifier`, `CampaignChapter`, `StoryAvatarId` và mở rộng `GameSettings` (tên người chơi/đối thủ, `lockedDirection`, `seasonId`).
  2. File `storydata.ts`: 5 nhân vật có lời thoại (Lý Trưởng Lộc, Cô Đồng Sen, Tú Tài Văn, Bà Ba Chợ, Trạng Cờ Làng) + 6 chương = 6 mùa.
  3. `campaignManager.ts`: lưu tiến trình (tên người chơi, sao 0–3, mở khóa) vào localStorage; `computeStars` chấm sao theo hiệu số điểm.
  4. UI mới: `StoryAvatar` (5 avatar SVG), `DialogueOverlay` (bong bóng thoại), `CampaignModal` (chọn chương + đặt tên + sao + khóa); tích hợp vào `App.tsx` (mở đầu/ăn Quan/kết ván), `PlayerPanel` (avatar nhân vật), `GameOverModal` (tường thuật + sao + "Mùa tiếp theo").
- **Quyết định kỹ thuật chính:**
  - Biến thể mùa ánh xạ lên `GameSettings` đã có (`startingDanPerCell`, `quanValue`, `timeLimitPerTurn`) — không sửa logic `OAnQuanGame`; riêng Mùa Lụt thêm `lockedDirection` và `OAnQuanAI.getDirections()` để cả người lẫn máy cùng bị giới hạn 1 hướng (công bằng).
  - Chấm sao: thắng = 1⭐, cách biệt ≥ 10 = 2⭐, ≥ 20 = 3⭐; thắng chương N mở chương N+1.
- **Lý do:** Đáp ứng yêu cầu "tự quyết định để game hay nhất" — thêm cốt truyện, nhân vật có hồn và tiến trình mà không phá luật truyền thống.
- **Phương án thay thế đã cân nhắc:** Làm PvP async / nhạc dân tộc / sự kiện mùa ngẫu nhiên — tạm hoãn vì là pha mở rộng sau, ưu tiên giá trị cốt lõi trước.
- **Lệch so với mục tiêu người dùng:** KHÔNG (mọi ý tưởng thêm mới đều đặt sau luật gốc; khôi phục mã nguồn gốc từ source map để dự án chạy được).
