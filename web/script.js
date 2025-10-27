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
class Database {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('products')) {
            localStorage.setItem('products', JSON.stringify([]));
        }
        if (!localStorage.getItem('categories')) {
            localStorage.setItem('categories', JSON.stringify([
                { id: 1, name: 'Elektronika', description: 'Elektronik mahsulotlar', icon: '💻', createdAt: new Date().toISOString() },
                { id: 2, name: 'Kiyimlar', description: 'Kiyim-kechak', icon: '👕', createdAt: new Date().toISOString() },
                { id: 3, name: 'Oziq-ovqat', description: 'Oziq-ovqat mahsulotlari', icon: '🍕', createdAt: new Date().toISOString() },
                { id: 4, name: 'Kitoblar', description: 'Kitoblar va nashrlar', icon: '📚', createdAt: new Date().toISOString() }
            ]));
        }
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }
        if (!localStorage.getItem('settings')) {
            localStorage.setItem('settings', JSON.stringify({
                botToken: '',
                notifyNewOrder: true,
                notifyLowStock: true,
                menuItems: [
                    { id: 1, text: '🛍 Mahsulotlar', command: '/products' },
                    { id: 2, text: '📋 Mening buyurtmalarim', command: '/my_orders' },
                    { id: 3, text: 'ℹ️ Ma\'lumot', command: '/info' },
                    { id: 4, text: '☎️ Aloqa', command: '/contact' }
                ]
            }));
        }
    }

    getProducts() {
        return JSON.parse(localStorage.getItem('products') || '[]');
    }

    getProduct(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    }

    addProduct(product) {
        const products = this.getProducts();
        product.id = Date.now();
        product.createdAt = new Date().toISOString();
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));
        return product;
    }

    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            localStorage.setItem('products', JSON.stringify(products));
            return products[index];
        }
        return null;
    }

    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
    }

    getCategories() {
        return JSON.parse(localStorage.getItem('categories') || '[]');
    }

    getCategory(id) {
        const categories = this.getCategories();
        return categories.find(c => c.id === id);
    }

    addCategory(category) {
        const categories = this.getCategories();
        category.id = Date.now();
        category.createdAt = new Date().toISOString();
        categories.push(category);
        localStorage.setItem('categories', JSON.stringify(categories));
        return category;
    }

    updateCategory(id, updates) {
        const categories = this.getCategories();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = { ...categories[index], ...updates };
            localStorage.setItem('categories', JSON.stringify(categories));
            return categories[index];
        }
        return null;
    }

    deleteCategory(id) {
        let categories = this.getCategories();
        categories = categories.filter(c => c.id !== id);
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    getOrders() {
        return JSON.parse(localStorage.getItem('orders') || '[]');
    }

    addOrder(order) {
        const orders = this.getOrders();
        order.id = Date.now();
        order.createdAt = new Date().toISOString();
        order.status = 'pending';
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Decrease product quantity
        const product = this.getProduct(order.productId);
        if (product) {
            this.updateProduct(order.productId, {
                quantity: product.quantity - 1
            });
        }
        
        return order;
    }

    updateOrder(id, updates) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates };
            localStorage.setItem('orders', JSON.stringify(orders));
            return orders[index];
        }
        return null;
    }

    getSettings() {
        return JSON.parse(localStorage.getItem('settings') || '{}');
    }

    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        localStorage.setItem('settings', JSON.stringify(newSettings));
        return newSettings;
    }

    exportData() {
        return {
            products: this.getProducts(),
            categories: this.getCategories(),
            orders: this.getOrders(),
            settings: this.getSettings()
        };
    }

    importData(data) {
        if (data.products) localStorage.setItem('products', JSON.stringify(data.products));
        if (data.categories) localStorage.setItem('categories', JSON.stringify(data.categories));
        if (data.orders) localStorage.setItem('orders', JSON.stringify(data.orders));
        if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));
    }

    clearAll() {
        localStorage.removeItem('products');
        localStorage.removeItem('categories');
        localStorage.removeItem('orders');
        this.init();
    }
}

const db = new Database();

// UI Functions
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

function showNotification(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    const messageEl = document.getElementById('notification-message');
    messageEl.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function logout() {
    if (confirm('Tizimdan chiqishni xohlaysizmi?')) {
        window.location.reload();
    }
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show corresponding page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}-page`).classList.add('active');
        
        // Update page title
        const title = item.querySelector('span').textContent;
        document.getElementById('page-title').textContent = title;
        
        // Load page data
        loadPageData(page);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    });
});

function loadPageData(page) {
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'reports':
            loadReportsPage();
            break;
        case 'bot-settings':
            loadBotSettings();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard
function loadDashboard() {
    const products = db.getProducts();
    const categories = db.getCategories();
    const orders = db.getOrders();
    
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('available-products').textContent = products.filter(p => p.quantity > 0).length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-categories').textContent = categories.length;
    document.getElementById('notification-count').textContent = orders.filter(o => o.status === 'pending').length;
    
    // Load recent orders
    const recentOrders = orders.slice(-5).reverse();
    const tbody = document.getElementById('recent-orders-body');
    
    if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">Hozircha buyurtmalar yo\'q</td></tr>';
    } else {
        tbody.innerHTML = recentOrders.map(order => {
            const product = db.getProduct(order.productId);
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${product ? product.name : 'Noma\'lum'}</td>
                    <td>${order.userName}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString('uz-UZ')}</td>
                    <td><span class="status-badge ${order.status}">${getStatusText(order.status)}</span></td>
                </tr>
            `;
        }).join('');
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Kutilmoqda',
        'completed': 'Bajarildi',
        'cancelled': 'Bekor qilindi'
    };
    return statusMap[status] || status;
}

// Products
function loadProducts() {
    const products = db.getProducts();
    const categories = db.getCategories();
    const grid = document.getElementById('products-grid');
    
    // Load category filter
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.innerHTML = '<option value="">Barcha kategoriyalar</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    
    // Load product category selects
    const productCategorySelect = document.getElementById('product-category');
    const editProductCategorySelect = document.getElementById('edit-product-category');
    const categoryOptions = categories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
    productCategorySelect.innerHTML = '<option value="">Kategoriya tanlang</option>' + categoryOptions;
    editProductCategorySelect.innerHTML = categoryOptions;
    
    displayProducts(products);
}

function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="no-data">Hozircha mahsulotlar yo\'q</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => {
        const category = db.getCategory(product.categoryId);
        return `
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-category">${category ? category.name : 'Kategoriyasiz'}</span>
                    <p class="product-price">${formatPrice(product.price)} so'm</p>
                    <p class="product-quantity">Mavjud: ${product.quantity} dona</p>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-small" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Tahrirlash
                        </button>
                        <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> O'chirish
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterProducts() {
    const searchQuery = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    let products = db.getProducts();
    
    if (searchQuery) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(searchQuery) ||
            (p.description && p.description.toLowerCase().includes(searchQuery))
        );
    }
    
    if (categoryFilter) {
        products = products.filter(p => p.categoryId == categoryFilter);
    }
    
    displayProducts(products);
}

function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price);
}

function showAddProductModal() {
    document.getElementById('add-product-modal').classList.add('active');
}

function editProduct(id) {
    const product = db.getProduct(id);
    if (!product) return;
    
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-category').value = product.categoryId;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-quantity').value = product.quantity;
    document.getElementById('edit-product-description').value = product.description || '';
    
    if (product.image) {
        document.getElementById('edit-product-preview').innerHTML = 
            `<img src="${product.image}" alt="${product.name}">`;
    }
    
    document.getElementById('edit-product-modal').classList.add('active');
}

function deleteProduct(id) {
    if (confirm('Bu mahsulotni o\'chirmoqchimisiz?')) {
        db.deleteProduct(id);
        loadProducts();
        showNotification('Mahsulot o\'chirildi', 'success');
    }
}

// Categories
function loadCategories() {
    const categories = db.getCategories();
    const grid = document.getElementById('categories-grid');
    
    if (categories.length === 0) {
        grid.innerHTML = '<p class="no-data">Hozircha kategoriyalar yo\'q</p>';
        return;
    }
    
    grid.innerHTML = categories.map(category => {
        const products = db.getProducts().filter(p => p.categoryId === category.id);
        return `
            <div class="category-card">
                <div class="category-icon">${category.icon}</div>
                <h3 class="category-name">${category.name}</h3>
                <p class="category-description">${category.description || ''}</p>
                <p class="category-count">${products.length} mahsulot</p>
                <div class="category-actions">
                    <button class="btn btn-primary btn-small" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i> Tahrirlash
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i> O'chirish
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function showAddCategoryModal() {
    document.getElementById('add-category-modal').classList.add('active');
}

function editCategory(id) {
    const category = db.getCategory(id);
    if (!category) return;
    
    // You would implement this similar to editProduct
    showNotification('Kategoriya tahrirlash funksiyasi', 'info');
}

function deleteCategory(id) {
    const products = db.getProducts().filter(p => p.categoryId === id);
    if (products.length > 0) {
        showNotification('Bu kategoriyada mahsulotlar mavjud. Avval mahsulotlarni o\'chiring.', 'error');
        return;
    }
    
    if (confirm('Bu kategoriyani o\'chirmoqchimisiz?')) {
        db.deleteCategory(id);
        loadCategories();
        showNotification('Kategoriya o\'chirildi', 'success');
    }
}

// Orders
function loadOrders() {
    const orders = db.getOrders().reverse();
    const tbody = document.getElementById('orders-body');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-data">Hozircha buyurtmalar yo\'q</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const product = db.getProduct(order.productId);
        return `
            <tr>
                <td>#${order.id}</td>
                <td>${product ? product.name : 'Noma\'lum'}</td>
                <td>${product && product.image ? `<img src="${product.image}" alt="${product.name}">` : '-'}</td>
                <td>${order.userName}</td>
                <td>${order.telegramId}</td>
                <td>${order.reason || '-'}</td>
                <td>${new Date(order.createdAt).toLocaleString('uz-UZ')}</td>
                <td><span class="status-badge ${order.status}">${getStatusText(order.status)}</span></td>
                <td>
                    <button class="btn btn-success btn-small" onclick="updateOrderStatus(${order.id}, 'completed')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="updateOrderStatus(${order.id}, 'cancelled')">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterOrders() {
    const searchQuery = document.getElementById('order-search').value.toLowerCase();
    const dateFrom = document.getElementById('order-date-from').value;
    const dateTo = document.getElementById('order-date-to').value;
    
    let orders = db.getOrders().reverse();
    
    if (searchQuery) {
        orders = orders.filter(o => 
            o.userName.toLowerCase().includes(searchQuery) ||
            o.telegramId.toString().includes(searchQuery)
        );
    }
    
    if (dateFrom) {
        orders = orders.filter(o => new Date(o.createdAt) >= new Date(dateFrom));
    }
    
    if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        orders = orders.filter(o => new Date(o.createdAt) <= endDate);
    }
    
    // Update table with filtered orders
    const tbody = document.getElementById('orders-body');
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-data">Hech narsa topilmadi</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const product = db.getProduct(order.productId);
        return `
            <tr>
                <td>#${order.id}</td>
                <td>${product ? product.name : 'Noma\'lum'}</td>
                <td>${product && product.image ? `<img src="${product.image}" alt="${product.name}">` : '-'}</td>
                <td>${order.userName}</td>
                <td>${order.telegramId}</td>
                <td>${order.reason || '-'}</td>
                <td>${new Date(order.createdAt).toLocaleString('uz-UZ')}</td>
                <td><span class="status-badge ${order.status}">${getStatusText(order.status)}</span></td>
                <td>
                    <button class="btn btn-success btn-small" onclick="updateOrderStatus(${order.id}, 'completed')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="updateOrderStatus(${order.id}, 'cancelled')">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateOrderStatus(id, status) {
    db.updateOrder(id, { status });
    loadOrders();
    loadDashboard();
    showNotification('Buyurtma statusi yangilandi', 'success');
}

function exportOrders() {
    const orders = db.getOrders();
    const csvContent = generateOrdersCSV(orders);
    downloadCSV(csvContent, 'buyurtmalar.csv');
    showNotification('Buyurtmalar Excel faylga yuklandi', 'success');
}

// Reports
function loadReportsPage() {
    const categories = db.getCategories();
    const reportCategory = document.getElementById('report-category');
    reportCategory.innerHTML = '<option value="">Barcha kategoriyalar</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

function generateReport() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const categoryId = document.getElementById('report-category').value;
    
    let orders = db.getOrders();
    
    if (startDate) {
        orders = orders.filter(o => new Date(o.createdAt) >= new Date(startDate));
    }
    
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        orders = orders.filter(o => new Date(o.createdAt) <= end);
    }
    
    if (categoryId) {
        const products = db.getProducts().filter(p => p.categoryId == categoryId);
        const productIds = products.map(p => p.id);
        orders = orders.filter(o => productIds.includes(o.productId));
    }
    
    const resultsDiv = document.getElementById('report-results');
    
    if (orders.length === 0) {
        resultsDiv.innerHTML = '<p class="no-data">Ushbu filtrlar bo\'yicha ma\'lumot topilmadi</p>';
        return;
    }
    
    // Calculate statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    // Generate report HTML
    resultsDiv.innerHTML = `
        <h3>Hisobot natijalari</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="stat-info">
                    <h3>${totalOrders}</h3>
                    <p>Jami buyurtmalar</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <h3>${completedOrders}</h3>
                    <p>Bajarilgan</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                    <h3>${pendingOrders}</h3>
                    <p>Kutilmoqda</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red">
                    <i class="fas fa-times-circle"></i>
                </div>
                <div class="stat-info">
                    <h3>${cancelledOrders}</h3>
                    <p>Bekor qilingan</p>
                </div>
            </div>
        </div>
        <div class="table-container" style="margin-top: 30px;">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Mahsulot</th>
                        <th>Foydalanuvchi</th>
                        <th>Sana</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => {
                        const product = db.getProduct(order.productId);
                        return `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${product ? product.name : 'Noma\'lum'}</td>
                                <td>${order.userName}</td>
                                <td>${new Date(order.createdAt).toLocaleString('uz-UZ')}</td>
                                <td><span class="status-badge ${order.status}">${getStatusText(order.status)}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function exportReport() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const categoryId = document.getElementById('report-category').value;
    
    let orders = db.getOrders();
    
    if (startDate) {
        orders = orders.filter(o => new Date(o.createdAt) >= new Date(startDate));
    }
    
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        orders = orders.filter(o => new Date(o.createdAt) <= end);
    }
    
    if (categoryId) {
        const products = db.getProducts().filter(p => p.categoryId == categoryId);
        const productIds = products.map(p => p.id);
        orders = orders.filter(o => productIds.includes(o.productId));
    }
    
    const csvContent = generateOrdersCSV(orders);
    downloadCSV(csvContent, 'hisobot.csv');
    showNotification('Hisobot Excel faylga yuklandi', 'success');
}

function generateOrdersCSV(orders) {
    let csv = 'ID,Mahsulot,Foydalanuvchi,Telegram ID,Sabab,Sana,Status\n';
    
    orders.forEach(order => {
        const product = db.getProduct(order.productId);
        csv += `${order.id},"${product ? product.name : 'Noma\'lum'}","${order.userName}",${order.telegramId},"${order.reason || '-'}","${new Date(order.createdAt).toLocaleString('uz-UZ')}","${getStatusText(order.status)}"\n`;
    });
    
    return csv;
}

function downloadCSV(content, filename) {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Bot Settings
function loadBotSettings() {
    const settings = db.getSettings();
    document.getElementById('bot-token').value = settings.botToken || '';
    document.getElementById('notify-new-order').checked = settings.notifyNewOrder;
    document.getElementById('notify-low-stock').checked = settings.notifyLowStock;
    
    loadMenuItems(settings.menuItems || []);
}

function loadMenuItems(items) {
    const container = document.getElementById('menu-items');
    
    if (items.length === 0) {
        container.innerHTML = '<p class="no-data">Hozircha menyu tugmalari yo\'q</p>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="menu-item">
            <span class="menu-item-text">${item.text} - ${item.command}</span>
            <div class="menu-item-actions">
                <button class="btn btn-danger btn-small" onclick="deleteMenuItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function saveBotToken() {
    const token = document.getElementById('bot-token').value;
    db.updateSettings({ botToken: token });
    showNotification('Bot token saqlandi', 'success');
}

function addMenuItem() {
    const text = prompt('Tugma matni:');
    if (!text) return;
    
    const command = prompt('Buyruq (masalan: /start):');
    if (!command) return;
    
    const settings = db.getSettings();
    const menuItems = settings.menuItems || [];
    menuItems.push({
        id: Date.now(),
        text: text,
        command: command
    });
    
    db.updateSettings({ menuItems });
    loadMenuItems(menuItems);
    showNotification('Menyu tugmasi qo\'shildi', 'success');
}

function deleteMenuItem(id) {
    const settings = db.getSettings();
    const menuItems = settings.menuItems.filter(item => item.id !== id);
    db.updateSettings({ menuItems });
    loadMenuItems(menuItems);
    showNotification('Menyu tugmasi o\'chirildi', 'success');
}

// Settings
function loadSettings() {
    // Admin settings already loaded in HTML
}

function updateAdminProfile() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (password) {
        // In a real app, you would hash the password
        showNotification('Admin profili yangilandi', 'success');
    } else {
        showNotification('Parolni kiriting', 'error');
    }
}

function exportDatabase() {
    const data = db.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('Backup yaratildi', 'success');
}

function clearDatabase() {
    if (confirm('Barcha ma\'lumotlarni o\'chirmoqchimisiz? Bu amalni qaytarib bo\'lmaydi!')) {
        db.clearAll();
        loadDashboard();
        loadProducts();
        loadCategories();
        loadOrders();
        showNotification('Barcha ma\'lumotlar o\'chirildi', 'success');
    }
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Form Handlers
document.getElementById('add-product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const categoryId = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const quantity = document.getElementById('product-quantity').value;
    const description = document.getElementById('product-description').value;
    const imageInput = document.getElementById('product-image');
    
    if (!categoryId) {
        showNotification('Kategoriya tanlang', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    if (imageInput.files && imageInput.files[0]) {
        reader.onload = function(e) {
            const product = {
                name,
                categoryId: parseInt(categoryId),
                price: parseFloat(price),
                quantity: parseInt(quantity),
                description,
                image: e.target.result
            };
            
            db.addProduct(product);
            closeModal('add-product-modal');
            loadProducts();
            loadDashboard();
            showNotification('Mahsulot qo\'shildi', 'success');
            e.target.form.reset();
            document.getElementById('product-preview').innerHTML = '';
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        const product = {
            name,
            categoryId: parseInt(categoryId),
            price: parseFloat(price),
            quantity: parseInt(quantity),
            description,
            image: ''
        };
        
        db.addProduct(product);
        closeModal('add-product-modal');
        loadProducts();
        loadDashboard();
        showNotification('Mahsulot qo\'shildi', 'success');
        e.target.reset();
        document.getElementById('product-preview').innerHTML = '';
    }
});

document.getElementById('edit-product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('edit-product-id').value);
    const name = document.getElementById('edit-product-name').value;
    const categoryId = document.getElementById('edit-product-category').value;
    const price = document.getElementById('edit-product-price').value;
    const quantity = document.getElementById('edit-product-quantity').value;
    const description = document.getElementById('edit-product-description').value;
    const imageInput = document.getElementById('edit-product-image');
    
    const updates = {
        name,
        categoryId: parseInt(categoryId),
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description
    };
    
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            updates.image = e.target.result;
            db.updateProduct(id, updates);
            closeModal('edit-product-modal');
            loadProducts();
            loadDashboard();
            showNotification('Mahsulot yangilandi', 'success');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        db.updateProduct(id, updates);
        closeModal('edit-product-modal');
        loadProducts();
        loadDashboard();
        showNotification('Mahsulot yangilandi', 'success');
    }
});

document.getElementById('add-category-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('category-name').value;
    const description = document.getElementById('category-description').value;
    const icon = document.getElementById('category-icon').value || '📦';
    
    const category = {
        name,
        description,
        icon
    };
    
    db.addCategory(category);
    closeModal('add-category-modal');
    loadCategories();
    loadDashboard();
    showNotification('Kategoriya qo\'shildi', 'success');
    e.target.reset();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    // Simulate receiving orders from Telegram bot
    simulateTelegramOrders();
});

// Simulate Telegram Bot Integration
function simulateTelegramOrders() {
    // This function simulates receiving orders from Telegram bot
    // In a real application, this would be connected to your Telegram bot API
    
    window.receiveOrderFromTelegram = function(orderData) {
        const order = {
            productId: orderData.productId,
            userName: orderData.userName,
            telegramId: orderData.telegramId,
            reason: orderData.reason
        };
        
        db.addOrder(order);
        loadOrders();
        loadDashboard();
        
        // Show notification
        const notificationCount = document.getElementById('notification-count');
        const currentCount = parseInt(notificationCount.textContent);
        notificationCount.textContent = currentCount + 1;
        
        showNotification(`Yangi buyurtma: ${orderData.userName}`, 'success');
        
        // Check notification settings
        const settings = db.getSettings();
        if (settings.notifyNewOrder) {
            if (Notification.permission === 'granted') {
                new Notification('Yangi buyurtma', {
                    body: `${orderData.userName} tomonidan buyurtma qabul qilindi`,
                    icon: '/favicon.ico'
                });
            }
        }
        
        // Check low stock
        const product = db.getProduct(orderData.productId);
        if (product && product.quantity <= 5 && settings.notifyLowStock) {
            showNotification(`Diqqat! ${product.name} kamayib bormoqda (${product.quantity} dona)`, 'warning');
        }
    };
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}


// Bu faylning qolgan qismi - barcha UI funksiyalar
// (loadDashboard, loadProducts, etc.) o'zgartirilmagan holda qoladi
