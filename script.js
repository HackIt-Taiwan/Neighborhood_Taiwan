// 主題管理系統
class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        // 設置初始主題
        this.setTheme(this.theme);
        
        // 創建主題切換按鈕
        this.createThemeToggle();
        
        // 監聽系統主題變化
        this.watchSystemTheme();
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateToggleButton();
    }

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    createThemeToggle() {
        // 檢查是否已經存在按鈕
        if (document.querySelector('.theme-toggle')) return;

        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', '切換深淺色主題');
        toggle.addEventListener('click', () => this.toggleTheme());
        
        document.body.appendChild(toggle);
        this.updateToggleButton();
    }

    updateToggleButton() {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
            toggle.title = this.theme === 'dark' ? '切換至淺色模式' : '切換至深色模式';
        }
    }

    watchSystemTheme() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // 只有在沒有手動設置主題時才跟隨系統
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// 手機選單管理系統
class MobileMenuManager {
    constructor() {
        this.sidebar = null;
        this.overlay = null;
        this.toggle = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createMobileElements();
        this.bindEvents();
    }

    createMobileElements() {
        // 創建漢堡選單按鈕
        if (!document.querySelector('.mobile-menu-toggle')) {
            const toggle = document.createElement('button');
            toggle.className = 'mobile-menu-toggle';
            toggle.setAttribute('aria-label', '開啟選單');
            toggle.innerHTML = `
                <span></span>
                <span></span>
                <span></span>
            `;
            document.body.appendChild(toggle);
        }

        // 創建覆蓋層
        if (!document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        this.sidebar = document.querySelector('.sidebar');
        this.overlay = document.querySelector('.sidebar-overlay');
        this.toggle = document.querySelector('.mobile-menu-toggle');
    }

    bindEvents() {
        // 漢堡選單按鈕事件
        this.toggle?.addEventListener('click', () => this.toggleMenu());
        
        // 覆蓋層點擊關閉
        this.overlay?.addEventListener('click', () => this.closeMenu());
        
        // ESC 鍵關閉選單
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // 導航連結點擊後關閉選單 (手機版)
        const navLinks = document.querySelectorAll('.sidebar nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMenu();
                }
            });
        });

        // 視窗大小改變時處理選單狀態
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.isOpen = true;
        this.sidebar?.classList.add('open');
        this.overlay?.classList.add('active');
        this.toggle?.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.toggle?.setAttribute('aria-label', '關閉選單');
    }

    closeMenu() {
        this.isOpen = false;
        this.sidebar?.classList.remove('open');
        this.overlay?.classList.remove('active');
        this.toggle?.classList.remove('active');
        document.body.style.overflow = '';
        this.toggle?.setAttribute('aria-label', '開啟選單');
    }
}

// 平滑滾動增強
class SmoothScrollManager {
    constructor() {
        this.init();
    }

    init() {
        // 為所有內部錨點連結添加平滑滾動
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// 影片管理系統
class VideoManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupVideoThumbnails();
    }

    setupVideoThumbnails() {
        const videoThumbnails = document.querySelectorAll('.video-thumbnail');
        
        videoThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', (e) => {
                this.handleVideoClick(e, thumbnail);
            });

            // 鍵盤無障礙支援
            thumbnail.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleVideoClick(e, thumbnail);
                }
            });

            // 添加 tabindex 使其可聚焦
            thumbnail.setAttribute('tabindex', '0');
            thumbnail.setAttribute('role', 'button');
        });
    }

    handleVideoClick(e, thumbnail) {
        e.preventDefault();
        
        const videoId = thumbnail.getAttribute('data-video-id');
        const eventCard = thumbnail.closest('.event-card');
        
        // 添加點擊動畫效果
        thumbnail.style.transform = 'scale(0.95)';
        setTimeout(() => {
            thumbnail.style.transform = '';
        }, 150);

        // 提供兩種選擇：嵌入播放或新視窗開啟
        this.showVideoOptions(videoId, eventCard);
    }

    showVideoOptions(videoId, eventCard) {
        const modal = this.createVideoModal(videoId);
        document.body.appendChild(modal);
        
        // 添加顯示動畫
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        // ESC 鍵關閉
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeVideoModal(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    createVideoModal(videoId) {
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3>觀看影片</h3>
                    <button class="video-modal-close" aria-label="關閉">&times;</button>
                </div>
                <div class="video-embed-container">
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
                        frameborder="0" 
                        allowfullscreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                    </iframe>
                </div>
                <div class="video-modal-footer">
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="btn-outline">
                        在 YouTube 開啟
                    </a>
                </div>
            </div>
            <div class="video-modal-overlay"></div>
        `;

        // 綁定關閉事件
        const closeBtn = modal.querySelector('.video-modal-close');
        const overlay = modal.querySelector('.video-modal-overlay');
        
        closeBtn.addEventListener('click', () => this.closeVideoModal(modal));
        overlay.addEventListener('click', () => this.closeVideoModal(modal));

        return modal;
    }

    closeVideoModal(modal) {
        modal.classList.add('hide');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 載入動畫管理
class LoadingAnimationManager {
    constructor() {
        this.init();
    }

    init() {
        // 頁面載入完成後添加動畫類別
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            
            // 漸入動畫
            this.animateElements();
        });
    }

    animateElements() {
        // 為卡片添加進入動畫
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // 觀察卡片、步驟等元素 (排除事件卡片，因為它們有自己的動畫)
        const elements = document.querySelectorAll('.card, .step-item, .cta-section');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });

        // 為事件卡片添加特殊的進入動畫（較輕微）
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            card.style.transition = `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s`;
            
            // 為事件卡片使用更寬鬆的觀察選項
            const cardObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        cardObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.05,
                rootMargin: '0px 0px -20px 0px'
            });
            
            cardObserver.observe(card);
        });
    }
}

// 性能優化管理
class PerformanceManager {
    constructor() {
        this.init();
    }

    init() {
        // 圖片懶載入
        this.setupLazyLoading();
        
        // 減少重繪
        this.optimizeScrollEvents();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    optimizeScrollEvents() {
        let ticking = false;
        
        const updateScrollElements = () => {
            // 在這裡處理滾動相關的更新
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollElements);
                ticking = true;
            }
        });
    }
}

// 社群彈出視窗管理系統
class CommunityModalManager {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.modal = document.getElementById('community-modal');
        this.bindEvents();
    }

    bindEvents() {
        // 開啟彈出視窗按鈕
        const joinBtn = document.getElementById('join-community-btn');
        joinBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });

        // 關閉按鈕
        const closeBtn = document.getElementById('community-modal-close');
        closeBtn?.addEventListener('click', () => this.closeModal());

        // 覆蓋層點擊關閉
        const overlay = this.modal?.querySelector('.community-modal-overlay');
        overlay?.addEventListener('click', () => this.closeModal());

        // ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });

        // 社群選項點擊後關閉彈出視窗
        const communityOptions = this.modal?.querySelectorAll('.community-option');
        communityOptions?.forEach(option => {
            option.addEventListener('click', () => {
                // 延遲關閉，讓用戶看到點擊效果
                setTimeout(() => this.closeModal(), 150);
            });
        });
    }

    openModal() {
        if (!this.modal) return;
        
        this.isOpen = true;
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // 聚焦到第一個社群選項，提升無障礙體驗
        setTimeout(() => {
            const firstOption = this.modal.querySelector('.community-option');
            firstOption?.focus();
        }, 300);
    }

    closeModal() {
        if (!this.modal) return;
        
        this.isOpen = false;
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // 將焦點返回到觸發按鈕
        const joinBtn = document.getElementById('join-community-btn');
        joinBtn?.focus();
    }
}

// 初始化所有管理器
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new MobileMenuManager();
    new SmoothScrollManager();
    new VideoManager();
    new LoadingAnimationManager();
    new PerformanceManager();
    new CommunityModalManager();
});

// 錯誤處理
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

// 匯出供其他腳本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        MobileMenuManager,
        SmoothScrollManager,
        LoadingAnimationManager,
        PerformanceManager
    };
} 