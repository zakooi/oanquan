# Cốt truyện & Thiết kế Campaign — "Làng Đôi Bờ"

> Tài liệu thiết kế cho hướng phát triển cốt truyện và chế độ Campaign của game Ô Ăn Quan.
> Mục tiêu: biến "một ván cờ" thành "một câu chuyện có hồn", tăng sức hút bằng **cốt truyện, nhân vật và tiến trình** — không phá luật Ô Ăn Quan truyền thống.

---

## 1. Ý tưởng cốt lõi

- **Mỗi ván cờ = một mùa thu hoạch** trong ngôi làng nằm hai bên bờ sông.
- **Bàn cờ = cánh đồng**: 10 ô Dân là 10 thửa ruộng, 2 ô Quan là **2 kho thóc lớn** (Kho Tây và Kho Đông).
- **Hai phe đối lập đã có sẵn trong game:** Quan Lại (bờ Bắc) và Nông Dân (bờ Nam) — tận dụng luôn 2 avatar `QuanLaiAvatar` / `NongDanAvatar` hiện có.
- Người chơi vào vai **Nông Dân (bờ Nam)**, hành trình qua các mùa để đối mặt với từng "kỳ thủ" của làng, kết thúc bằng trận đấu với **Trạng Cờ Làng** bất bại.

---

## 2. Thế giới & bối cảnh

- **Làng Đôi Bờ** nằm ven một con sông; sông chia làng thành **Bờ Bắc** (phía Quan, giàu có, uy quyền) và **Bờ Nam** (phía Dân, chăm chỉ, đoàn kết).
- Mỗi năm trải qua **6 mùa** (cũng là 6 chương Campaign): Mùa Gieo → Mùa Lụt → Mùa Hạn → Mùa Hội Làng → Mùa Đông → Mùa Gặt.
- Truyền thuyết làng kể: *"Ai thắng trọn vụ mùa sẽ nhận **Giỏ Thóc Vàng** — phần thưởng cho người giỏi nhất, và là biểu tượng của một mùa no ấm."*

---

## 3. Roster nhân vật (đối thủ Campaign)

Mỗi đối thủ có: tên, thân phận, tính cách, độ khó AI tương ứng, câu mở đầu (khi vào trận), lời chế giễu (khi đối thủ thắng 1 nước lớn) và phản ứng (khi thua). Độ khó ánh xạ sẵn vào `AIDifficulty` đã có.

| # | Nhân vật | Thân phận / tính cách | Độ khó AI | Điểm nhấn lời thoại |
|---|---|---|---|---|
| 1 | **Lý Trưởng Lộc** | Quan lại tham lam, tự phụ, coi thường dân | `EASY` | "Thử lấy nổi một thửa ruộng của ta xem!" |
| 2 | **Cô Đồng Sen** | Nông dân lanh lợi, tinh quái, nói nhanh | `MEDIUM` | "Ăn liên hoàn là nghề của chị đấy!" |
| 3 | **Tú Tài Văn** | Quan văn mưu lược, tính toán lạnh lùng | `HARD` | "Cờ này là phép tính, không phải trò trẻ con." |
| 4 | **Bà Ba Chợ** | Tiểu thương sắc sảo, giỏi "mua rẻ bán đắt" | `MASTER` | "Mỗi viên sỏi đều có giá của nó!" |
| 5 | **Trạng Cờ Làng** | Nhà vô địch bất bại, điềm tĩnh, ẩn dật | `GRANDMASTER` | "Ta đã chờ người thắng trọn 4 mùa để gặp." |

> Người chơi (Nông Dân bờ Nam) là nhân vật ẩn danh do người dùng đặt tên — mở khóa tính năng "đặt tên nhân vật".

---

## 4. Cấu trúc Campaign (6 chương / 6 mùa)

Mỗi chương = 1 trận đấu với 1 đối thủ + 1 **biến thể luật** (điều kiện mùa) để tăng sự đa dạng, không chỉ tăng độ khó. Biến thể áp lên `GameSettings` hiện có, giữ luật gốc làm nền tảng.

| Chương | Mùa | Đối thủ | Biến thể luật (điều kiện mùa) |
|---|---|---|---|
| 1 | Mùa Gieo | Lý Trưởng Lộc | Luật chuẩn — dạy cơ bản, khởi đầu nhẹ nhàng |
| 2 | Mùa Lụt | Cô Đồng Sen | **Ô Quan "ngập nước"**: mỗi lượt chỉ được chọn 1 hướng (hướng còn lại bị "nước chặn") |
| 3 | Mùa Hạn | Tú Tài Văn | **Mùa khô hạn**: khởi đầu mỗi ô Dân chỉ 3 viên (thay vì 5), cuộc đua điểm gay cấn hơn |
| 4 | Mùa Hội Làng | Bà Ba Chợ | **Hội làng**: ăn được Quan thì thưởng nhân đôi (20đ/Quan) |
| 5 | Mùa Đông | Trạng Cờ Làng (lượt giao hữu) | **Giá rét**: giới hạn thời gian mỗi nước đi (time-limit chặt) |
| 6 | Mùa Gặt | Trạng Cờ Làng (trận chung kết) | Luật chuẩn, độ khó cao nhất — trận đấu danh dự |

### 4.1 Diễn biến kể chuyện trong một chương

1. **Mở đầu:** hội thoại ngắn giữa người chơi và đối thủ (hộp thoại kiểu visual-novel, có avatar).
2. **Cao trào:** khi có nước đi "ăn Quan" hoặc "ăn liên hoàn ≥ 3", đối thủ thốt một lời phản ứng (bong bóng thoại + âm thanh).
3. **Kết ván:** đoạn tường thuật tự động 2–3 câu tóm tắt ván đấu (sinh từ `MoveLog` đã có sẵn: ai ăn bao nhiêu Dân/Quan, nước quyết định), kèm xếp hạng sao (1–3 sao theo hiệu số điểm).
4. **Mở khóa:** thắng chương → mở chương tiếp theo + mở khóa trang phục/skin tương ứng với mùa.

---

## 5. Cơ chế mới cần bổ sung (ngoài cốt truyện)

| Cơ chế | Mô tả | Nền tảng có sẵn để tận dụng |
|---|---|---|
| **StoryCharacter** | Type mới: tên, avatar, tính cách, lời thoại, độ khó | `AIDifficulty`, `CharacterAvatars` |
| **CampaignState** | Tiến trình chương, sao, mở khóa (lưu localStorage) | `leaderboardManager` (đã có mẫu lưu localStorage) |
| **SeasonModifier** | Điều kiện mùa áp lên `GameSettings` | `GameSettings` (thêm trường tùy chọn) |
| **DialogueBubble** | Bong bóng thoại + lời kể trước/trong/sau ván | Hệ modal + `statusMessage` đã có |
| **Tường thuật tự động** | Sinh đoạn kể từ `MoveLog` | `MoveLog`/`MoveStep` đã đầy đủ dữ liệu |
| **Danh hiệu & thành tích** | "Tay ăn liên hoàn", "Trạng nguyên cờ"… | `LeaderboardStats` có thể mở rộng |

---

## 6. Lộ trình triển khai đề xuất

1. **Pha 1 — Khung cốt truyện:** thêm type `StoryCharacter`, dữ liệu 5 đối thủ, hộp thoại mở đầu/kết ván, đặt tên nhân vật.
2. **Pha 2 — Campaign:** màn hình chọn chương, `CampaignState`, 6 chương với `SeasonModifier`, hệ thống sao & mở khóa.
3. **Pha 3 — Hồn cho ván đấu:** bong bóng phản ứng khi ăn Quan/liên hoàn, tường thuật tự động, âm thanh lời thoại.
4. **Pha 4 — Giữ chân người chơi:** danh hiệu & thành tích, sự kiện mùa ngẫu nhiên ở chế độ "Ván nhanh", sau đó mở rộng skin/nhạc/PvP async.

> Tất cả ý tưởng ở mục 5–6 đều **thêm mới và đặt sau luật gốc**, không sửa đổi logic `OAnQuanGame` trừ khi cần tham số hóa (ví dụ số Dân khởi đầu đã có sẵn trong `GameSettings.startingDanPerCell`).
