/**
 * WALLET.JS
 * Xử lý Connect Wallet popup và detect các Web3 wallets
 */

// Hàm mở popup wallet
function openWalletModal() {
    const modal = document.querySelector('.wallet-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Khóa scroll khi popup mở
    }
  }
  
  // Hàm đóng popup wallet
  function closeWalletModal() {
    const modal = document.querySelector('.wallet-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = ''; // Mở lại scroll
    }
  }
  
  // Detect và connect Phantom wallet
  async function connectPhantom() {
    console.log('🔗 Đang kết nối Phantom wallet...');
    
    // Kiểm tra Phantom đã cài chưa
    if (window.solana && window.solana.isPhantom) {
      try {
        // Yêu cầu kết nối
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();
        
        console.log('✅ Đã kết nối Phantom!');
        console.log('Public Key:', publicKey);
        
        // Lưu vào localStorage (để check sau)
        localStorage.setItem('walletConnected', 'phantom');
        localStorage.setItem('walletAddress', publicKey);
        
        // Đóng modal
        closeWalletModal();
        
        // Hiển thị thông báo hoặc redirect
        alert(`✅ Đã kết nối Phantom!\n\nĐịa chỉ: ${publicKey.substring(0, 8)}...`);
        
        // TODO: Redirect sang dashboard
        // window.location.href = 'dashboard.html';
        
      } catch (error) {
        console.error('❌ Lỗi kết nối Phantom:', error);
        alert('⚠️ Không thể kết nối Phantom. Vui lòng thử lại!');
      }
    } else {
      // Phantom chưa cài
      alert('⚠️ Chưa cài Phantom Wallet!\n\nVui lòng cài extension tại: https://phantom.app');
      window.open('https://phantom.app', '_blank');
    }
  }
  
  // Detect và connect Solflare wallet
  async function connectSolflare() {
    console.log('🔗 Đang kết nối Solflare wallet...');
    
    // Kiểm tra Solflare đã cài chưa
    if (window.solflare && window.solflare.isSolflare) {
      try {
        await window.solflare.connect();
        const publicKey = window.solflare.publicKey.toString();
        
        console.log('✅ Đã kết nối Solflare!');
        console.log('Public Key:', publicKey);
        
        localStorage.setItem('walletConnected', 'solflare');
        localStorage.setItem('walletAddress', publicKey);
        
        closeWalletModal();
        alert(`✅ Đã kết nối Solflare!\n\nĐịa chỉ: ${publicKey.substring(0, 8)}...`);
        
      } catch (error) {
        console.error('❌ Lỗi kết nối Solflare:', error);
        alert('⚠️ Không thể kết nối Solflare. Vui lòng thử lại!');
      }
    } else {
      alert('⚠️ Chưa cài Solflare Wallet!\n\nVui lòng cài extension tại: https://solflare.com');
      window.open('https://solflare.com', '_blank');
    }
  }
  
  // Detect và connect MetaMask
  async function connectMetaMask() {
    console.log('🔗 Đang kết nối MetaMask...');
    
    // Kiểm tra MetaMask đã cài chưa
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        // Request accounts
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        const address = accounts[0];
        
        console.log('✅ Đã kết nối MetaMask!');
        console.log('Address:', address);
        
        localStorage.setItem('walletConnected', 'metamask');
        localStorage.setItem('walletAddress', address);
        
        closeWalletModal();
        alert(`✅ Đã kết nối MetaMask!\n\nĐịa chỉ: ${address.substring(0, 8)}...`);
        
      } catch (error) {
        console.error('❌ Lỗi kết nối MetaMask:', error);
        alert('⚠️ Không thể kết nối MetaMask. Vui lòng thử lại!');
      }
    } else {
      alert('⚠️ Chưa cài MetaMask!\n\nVui lòng cài extension tại: https://metamask.io');
      window.open('https://metamask.io', '_blank');
    }
  }
  
  // Check xem user đã connect wallet chưa (khi load page)
  function checkWalletConnection() {
    const walletConnected = localStorage.getItem('walletConnected');
    const walletAddress = localStorage.getItem('walletAddress');
    
    if (walletConnected && walletAddress) {
      console.log(`✅ Đã có wallet: ${walletConnected}`);
      console.log(`Địa chỉ: ${walletAddress}`);
      
      // TODO: Hiển thị địa chỉ wallet thay vì nút "Connect Wallet"
      const connectBtn = document.querySelector('.connect-wallet-btn');
      if (connectBtn) {
        connectBtn.textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
        connectBtn.style.cursor = 'default';
      }
    }
  }
  
  // Disconnect wallet
  function disconnectWallet() {
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    console.log('✅ Đã ngắt kết nối wallet');
    location.reload(); // Reload page
  }
  
  // Setup event listeners khi DOM load xong
  document.addEventListener('DOMContentLoaded', () => {
    // Check wallet đã connect chưa
    checkWalletConnection();
    
    // Event: Click nút Connect Wallet
    const connectBtn = document.querySelector('.connect-wallet-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', openWalletModal);
    }
    
    // Event: Click nút Close modal
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeWalletModal);
    }
    
    // Event: Click ngoài modal để đóng
    const modal = document.querySelector('.wallet-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        // Chỉ đóng khi click vào backdrop (không phải nội dung modal)
        if (e.target === modal) {
          closeWalletModal();
        }
      });
    }
    
    // Event: ESC key để đóng modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeWalletModal();
      }
    });
  });