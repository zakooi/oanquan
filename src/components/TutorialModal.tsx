import React, { useState } from 'react';
import { XIcon, BookOpenIcon, ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSlides = [
  {
    title: '1. Bàn Cờ & Quân Cờ Chuẩn',
    badge: 'Khái niệm',
    content: (
      <div>
        <p>Bàn cờ Ô Ăn Quan gồm <strong>12 ô</strong> hình elip truyền thống:</p>
        <ul className="tutorial-list">
          <li><strong>2 Ô Quan</strong>: 2 ô bán nguyệt ở 2 đầu (Quan Tây & Quan Đông), mỗi ô chứa 1 quân Quan lớn (trị giá 10 điểm).</li>
          <li><strong>10 Ô Dân</strong>: Chia làm 2 hàng song song (mỗi người 5 ô). Ban đầu mỗi ô Dân có 5 viên sỏi nhỏ (trị giá 1 điểm/viên).</li>
          <li>Tổng số điểm trên bàn: 50 Dân + 2 Quan (20đ) = <strong>70 điểm</strong>.</li>
        </ul>
      </div>
    )
  },
  {
    title: '2. Cách Đi & Rải Quân',
    badge: 'Luật cơ bản',
    content: (
      <div>
        <p>Đến lượt của mình, người chơi thực hiện:</p>
        <ul className="tutorial-list">
          <li>Chọn <strong>1 ô Dân bất kỳ</strong> thuộc 5 ô bên mình có chứa quân.</li>
          <li>Bốc tất cả quân trong ô đó lên và chọn hướng rải: <strong>Sang Trái</strong> hoặc <strong>Sang Phải</strong>.</li>
          <li>Rải từng viên một vào các ô kế tiếp theo chiều đã chọn (bao gồm cả ô Quan).</li>
        </ul>
      </div>
    )
  },
  {
    title: '3. Rải Quân Nối Tiếp (Chuyền)',
    badge: 'Liên hoàn',
    content: (
      <div>
        <p>Khi rải hết viên sỏi cuối cùng trong tay:</p>
        <ul className="tutorial-list">
          <li>Nếu ô liền kề là <strong>ô Dân có quân</strong>: Người chơi tiếp tục bốc toàn bộ quân ở ô đó và rải tiếp theo chiều vừa đi.</li>
          <li>Nếu ô liền kề là <strong>ô Quan có quân</strong>: Dừng lượt (không được bốc quân trong ô Quan để rải).</li>
        </ul>
      </div>
    )
  },
  {
    title: '4. Cách Ăn Quân & Ăn Liên Hoàn',
    badge: 'Ghi điểm',
    content: (
      <div>
        <p>Đây là điểm tinh hoa và tính toán hấp dẫn nhất của Ô Ăn Quan:</p>
        <ul className="tutorial-list">
          <li>Nếu sau viên sỏi cuối cùng là <strong>1 Ô TRỐNG</strong>, và ô liền sau ô trống đó <strong>CÓ QUÂN</strong> (Dân hoặc Quan): Người chơi được <strong>ĂN TOÀN BỘ</strong> quân ở ô đó!</li>
          <li><strong>Ăn liên hoàn</strong>: Nếu sau ô vừa bị ăn lại là một ô TRỐNG và ô kế tiếp CÓ QUÂN, người chơi tiếp tục ăn ô đó (Ăn kép, Ăn ba...).</li>
          <li>Nếu gặp <strong>2 ô trống liên tiếp</strong> hoặc ô kế tiếp trống nhưng ô sau đó cũng trống: Bị đứt đoạn ("chững"), dừng lượt mà không được ăn.</li>
        </ul>
      </div>
    )
  },
  {
    title: '5. Chầu Quân (Rải Quân Khi Hết)',
    badge: 'Tình huống đặc biệt',
    content: (
      <div>
        <p>Khi đến lượt mà cả 5 ô Dân bên mình đều <strong>TRỐNG</strong>:</p>
        <ul className="tutorial-list">
          <li>Người chơi bắt buộc phải lấy <strong>5 viên sỏi</strong> từ rổ điểm của mình để đặt lại vào 5 ô Dân (mỗi ô 1 viên) để có quân đi tiếp.</li>
          <li>Nếu không đủ 5 viên trong rổ điểm: Phải <strong>vay đối thủ</strong> (ghi nợ và trả lại khi tính điểm cuối ván).</li>
        </ul>
      </div>
    )
  },
  {
    title: '6. Kết Thúc Ván & Tính Điểm',
    badge: 'Chiến thắng',
    content: (
      <div>
        <p>Ván cờ kết thúc khi:</p>
        <ul className="tutorial-list">
          <li><strong>Hết Quan tàn Dân</strong>: Khi cả 2 ô Quan đều đã bị ăn hết quân. Số quân Dân còn lại trên nửa bàn của ai thuộc về người đó.</li>
          <li><strong>Tính điểm</strong>: 1 Dân = 1 điểm, 1 Quan = 10 điểm (trừ điểm nợ vay nếu có). Người có tổng điểm cao hơn sẽ giành <strong>CHIẾN THẮNG</strong>!</li>
        </ul>
      </div>
    )
  }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, tutorialSlides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const slide = tutorialSlides[currentSlide];

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-container tutorial-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <BookOpenIcon size={22} className="modal-icon text-amber-500" />
            <h2 className="modal-title">Hướng Dẫn Luật Chơi Dân Gian</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            <XIcon size={20} />
          </button>
        </div>

        <div className="modal-body tutorial-body">
          <div className="tutorial-card">
            <div className="tutorial-card-header">
              <span className="tutorial-badge">{slide.badge}</span>
              <h3 className="tutorial-slide-title">{slide.title}</h3>
            </div>
            <div className="tutorial-slide-content">{slide.content}</div>
          </div>

          <div className="tutorial-dots">
            {tutorialSlides.map((_, idx) => (
              <button
                key={idx}
                className={`tutorial-dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="modal-footer tutorial-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <ArrowLeftIcon size={16} />
            <span>Trang trước</span>
          </button>

          {currentSlide === tutorialSlides.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Đã hiểu & Vào chơi!
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={nextSlide}>
              <span>Trang tiếp</span>
              <ArrowRightIcon size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
