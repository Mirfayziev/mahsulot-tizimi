// ============================================
// GITHUB RAW - BOT_DATA DAN O'QISH
// ============================================

// GitHub Raw Files URL
const GITHUB_USER = 'Mirfayziev';
const GITHUB_REPO = 'mahsulot-tizimi';
const GITHUB_BRANCH = 'main';
const GITHUB_RAW = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/bot_data`;

// Database class - GitHub Raw + LocalStorage
class Database {
    constructor() {
        this.products = [];
        this.categories = [];
        this.orders = [];
        this.settings = {};
        this.lastUpdate = null;
        this.init();
    }

    async init() {
        // Birinchi localStorage'dan yuklash (tez)
        this.loadFromLocalStorage();
        
        // Keyin GitHub'dan yangilash
        await this.loadFromGitHub();
        
        // Auto-refresh har 30 soniyada
        this.startAutoRefresh();
    }

    // GitHub'dan ma'lumotlarni yuklash
    async loadFromGitHub() {
        try {
            console.log('🔄 GitHub\'dan yangilanyapti...');
            
            const [products, categories, orders] = await Promise.all([
                this.fetchGitHubFile('products.json'),
                this.fetchGitHubFile('categories.json'),
                this.fetchGitHubFile('orders.json')
            ]);
            
            // Faqat o'zgarish bo'lsa yangilash
            const hasChanges = 
                JSON.stringify(this.products) !== JSON.stringify(products) ||
                JSON.stringify(this.categories) !== JSON.stringify(categories) ||
                JSON.stringify(this.orders) !== JSON.stringify(orders);
            
            if (hasChanges) {
                this.products = products;
                this.categories = categories;
                this.orders = orders;
                this.lastUpdate = new Date();
                
                // LocalStorage'ga backup
                this.saveToLocalStorage();
                
                console.log('✅ GitHub\'dan yangilandi');
                console.log('📦 Mahsulotlar:', products.length);
                console.log('📂 Kategoriyalar:', categories.length);
                console.log('🛒 Buyurtmalar:', orders.length);
                
                // UI'ni yangilash
                if (typeof loadDashboard === 'function') {
                    loadDashboard();
                }
                
                showNotification('Ma\'lumotlar yangilandi! 🔄', 'success');
            }
        } catch (err) {
            console.error('❌ GitHub\'dan yuklashda xato:', err);
            console.log('⚠️ LocalStorage\'dan foydalanilmoqda');
        }
    }

    // GitHub'dan bitta faylni yuklash
    async fetchGitHubFile(filename) {
        try {
            const url = `${GITHUB_RAW}/${filename}`;
            const response = await fetch(url, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(`Xato: ${filename}`, err);
            return filename === 'settings.json' ? {} : [];
        }
    }

    // Auto-refresh
    startAutoRefresh() {
        // Har 30 soniyada yangilash
        setInterval(async () => {
            await this.loadFromGitHub();
        }, 30000);
        
        console.log('⏰ Auto-refresh yoqildi (30 soniya)');
    }

    // LocalStorage'dan yuklash
    loadFromLocalStorage() {
        try {
            this.products = JSON.parse(localStorage.getItem('products') || '[]');
            this.categories = JSON.parse(localStorage.getItem('categories') || '[]');
            this.orders = JSON.parse(localStorage.getItem('orders') || '[]');
            this.settings = JSON.parse(localStorage.getItem('settings') || '{}');
            
            // Default kategoriyalar
            if (this.categories.length === 0) {
                this.categories = [
                    { id: 1, name: 'Elektronika', description: 'Elektronik mahsulotlar', icon: '💻', createdAt: new Date().toISOString() },
                    { id: 2, name: 'Kiyimlar', description: 'Kiyim-kechak', icon: '👕', createdAt: new Date().toISOString() },
                    { id: 3, name: 'Oziq-ovqat', description: 'Oziq-ovqat mahsulotlari', icon: '🍕', createdAt: new Date().toISOString() },
                    { id: 4, name: 'Kitoblar', description: 'Kitoblar va nashrlar', icon: '📚', createdAt: new Date().toISOString() }
                ];
            }
            
            console.log('📂 LocalStorage\'dan yuklandi');
        } catch (err) {
            console.error('LocalStorage xato:', err);
        }
    }

    // LocalStorage'ga saqlash
    saveToLocalStorage() {
        try {
            localStorage.setItem('products', JSON.stringify(this.products));
            localStorage.setItem('categories', JSON.stringify(this.categories));
            localStorage.setItem('orders', JSON.stringify(this.orders));
            localStorage.setItem('settings', JSON.stringify(this.settings));
        } catch (err) {
            console.error('LocalStorage saqlashda xato:', err);
        }
    }

    // ============================================
    // PRODUCTS
    // ============================================

    getProducts() {
        return this.products;
    }

    getProduct(id) {
        return this.products.find(p => p.id === id);
    }

    addProduct(product) {
        product.id = Date.now();
        product.createdAt = new Date().toISOString();
        this.products.push(product);
        this.saveToLocalStorage();
        
        // Ma'lumot: GitHub'ga yuklash kerak
        showNotification(
            '⚠️ Mahsulot qo\'shildi! Bot\'da ko\'rinishi uchun "Bot\'ga Yuborish" tugmasini bosing.',
            'warning',
            10000
        );
        
        return product;
    }

    updateProduct(id, updates) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updates };
            this.saveToLocalStorage();
            
            showNotification(
                '⚠️ Mahsulot yangilandi! Bot\'da ko\'rinishi uchun "Bot\'ga Yuborish" tugmasini bosing.',
                'warning',
                10000
            );
            
            return this.products[index];
        }
        return null;
    }

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveToLocalStorage();
        
        showNotification(
            '⚠️ Mahsulot o\'chirildi! Bot\'da ko\'rinishi uchun "Bot\'ga Yuborish" tugmasini bosing.',
            'warning',
            10000
        );
    }

    // ============================================
    // CATEGORIES
    // ============================================

    getCategories() {
        return this.categories;
    }

    getCategory(id) {
        return this.categories.find(c => c.id === id);
    }

    addCategory(category) {
        category.id = Date.now();
        category.createdAt = new Date().toISOString();
        this.categories.push(category);
        this.saveToLocalStorage();
        return category;
    }

    // ============================================
    // ORDERS
    // ============================================

    getOrders() {
        return this.orders;
    }

    addOrder(order) {
        order.id = Date.now();
        order.createdAt = new Date().toISOString();
        order.status = 'pending';
        this.orders.push(order);
        this.saveToLocalStorage();
        return order;
    }

    // ============================================
    // SETTINGS
    // ============================================

    getSettings() {
        return this.settings;
    }

    updateSettings(updates) {
        this.settings = { ...this.settings, ...updates };
        this.saveToLocalStorage();
        return this.settings;
    }

    // ============================================
    // SYNC STATUS
    // ============================================

    getSyncStatus() {
        return {
            lastUpdate: this.lastUpdate,
            isSynced: this.lastUpdate !== null,
            productsCount: this.products.length,
            categoriesCount: this.categories.length,
            ordersCount: this.orders.length
        };
    }
}

// Database instance
const db = new Database();

// ============================================
// SYNC STATUS INDICATOR
// ============================================

function updateSyncStatus() {
    const status = db.getSyncStatus();
    const indicator = document.getElementById('sync-status');
    
    if (!indicator) return;
    
    if (status.isSynced) {
        const timeSince = Math.floor((new Date() - status.lastUpdate) / 1000);
        indicator.innerHTML = `
            <i class="fas fa-check-circle" style="color: #28a745;"></i>
            <span style="color: #666; font-size: 12px;">
                ${timeSince < 60 ? 'Hozir' : Math.floor(timeSince / 60) + ' daqiqa avval'} yangilandi
            </span>
        `;
    } else {
        indicator.innerHTML = `
            <i class="fas fa-sync-alt fa-spin" style="color: #ffc107;"></i>
            <span style="color: #666; font-size: 12px;">Sinxronlanmoqda...</span>
        `;
    }
}

// Har 5 soniyada status yangilash
setInterval(updateSyncStatus, 5000);

// ============================================
// MANUAL REFRESH BUTTON
// ============================================

async function manualRefresh() {
    showNotification('🔄 GitHub\'dan yangilanyapti...', 'info');
    await db.loadFromGitHub();
}

// ============================================
// PAGE LOAD
// ============================================

window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Web sayt yuklandi');
    console.log('📡 GitHub sinxronizatsiya yoqildi');
    console.log(`🔗 Repository: ${GITHUB_USER}/${GITHUB_REPO}`);
    
    // Sync status indicator qo'shish
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
        const syncStatus = document.createElement('div');
        syncStatus.id = 'sync-status';
        syncStatus.style.marginRight = '15px';
        syncStatus.style.display = 'flex';
        syncStatus.style.alignItems = 'center';
        syncStatus.style.gap = '5px';
        headerRight.insertBefore(syncStatus, headerRight.firstChild);
        
        // Manual refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn btn-secondary btn-small';
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Yangilash';
        refreshBtn.onclick = manualRefresh;
        refreshBtn.style.marginRight = '10px';
        headerRight.insertBefore(refreshBtn, headerRight.firstChild);
    }
    
    updateSyncStatus();
});

// Bu faylning qolgan qismi - barcha UI funksiyalar
// (loadDashboard, loadProducts, etc.) o'zgartirilmagan holda qoladi
