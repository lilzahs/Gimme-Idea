/**
 * BACKGROUND.JS
 * Generate 280 spans động cho Matrix background effect
 * Thay vì hard-code 280 dòng <span></span> trong HTML
 */

// Hàm tạo background spans
function createBackground() {
    const section = document.querySelector('section');
    
    // Kiểm tra xem section có tồn tại không
    if (!section) {
      console.error('Không tìm thấy <section> element!');
      return;
    }
    
    // Số lượng spans dựa theo screen size (responsive)
    let spanCount;
    const screenWidth = window.innerWidth;
    
    if (screenWidth > 1024) {
      spanCount = 280; // Desktop: 16x16 grid
    } else if (screenWidth > 768) {
      spanCount = 160; // Tablet: 10x10 grid
    } else {
      spanCount = 80; // Mobile: 5x5 grid (ít hơn để tăng performance)
    }
    
    // Generate spans
    for (let i = 0; i < spanCount; i++) {
      const span = document.createElement('span');
      section.appendChild(span);
    }
    
    console.log(`✅ Đã tạo ${spanCount} background spans`);
  }
  
  // Chạy khi DOM đã load xong
  document.addEventListener('DOMContentLoaded', createBackground);
  
  // Re-generate khi resize window (optional - có thể bỏ nếu lag)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Xóa spans cũ
      const section = document.querySelector('section');
      const oldSpans = section.querySelectorAll('span');
      oldSpans.forEach(span => span.remove());
      
      // Tạo lại với số lượng mới
      createBackground();
    }, 500); // Đợi 500ms sau khi user ngừng resize
  });