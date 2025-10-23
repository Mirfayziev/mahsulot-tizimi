"""
Telegram Bot - Admin Management Commands bilan
Bot orqali mahsulotlarni to'liq boshqarish
"""

import os
import json
import logging
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes, ConversationHandler

# Logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# Data directory
DATA_DIR = os.getenv('DATA_DIR', '/opt/render/project/src/bot_data')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')
CATEGORIES_FILE = os.path.join(DATA_DIR, 'categories.json')
ORDERS_FILE = os.path.join(DATA_DIR, 'orders.json')
SETTINGS_FILE = os.path.join(DATA_DIR, 'settings.json')
ADMIN_ID_FILE = os.path.join(DATA_DIR, 'admin_ids.json')

os.makedirs(DATA_DIR, exist_ok=True)

# Conversation states for adding products
ADD_PRODUCT_NAME, ADD_PRODUCT_CATEGORY, ADD_PRODUCT_PRICE, ADD_PRODUCT_QUANTITY, ADD_PRODUCT_DESCRIPTION = range(5)
ADD_CATEGORY_NAME, ADD_CATEGORY_ICON, ADD_CATEGORY_DESCRIPTION = range(5, 8)

# Admin IDs
def load_admin_ids():
    try:
        if os.path.exists(ADMIN_ID_FILE):
            with open(ADMIN_ID_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Admin IDs yuklashda xatolik: {e}")
    
    admin_ids_str = os.getenv('ADMIN_IDS', '320977751')
    if admin_ids_str:
        return [int(id.strip()) for id in admin_ids_str.split(',') if id.strip()]
    return []

def save_admin_ids(admin_ids):
    try:
        with open(ADMIN_ID_FILE, 'w', encoding='utf-8') as f:
            json.dump(admin_ids, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Admin IDs saqlashda xatolik: {e}")

ADMIN_IDS = load_admin_ids()

# Database functions
def load_data(filename, default=None):
    if default is None:
        default = []
    try:
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Ma'lumot yuklashda xatolik {filename}: {e}")
    return default

def save_data(filename, data):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Ma'lumot saqlashda xatolik {filename}: {e}")

def get_products():
    return load_data(PRODUCTS_FILE, [])

def get_categories():
    default_categories = [
        {'id': 1, 'name': 'Elektronika', 'description': 'Elektronik mahsulotlar', 'icon': '💻', 'createdAt': datetime.now().isoformat()},
        {'id': 2, 'name': 'Kiyimlar', 'description': 'Kiyim-kechak', 'icon': '👕', 'createdAt': datetime.now().isoformat()},
        {'id': 3, 'name': 'Oziq-ovqat', 'description': 'Oziq-ovqat mahsulotlari', 'icon': '🍕', 'createdAt': datetime.now().isoformat()},
        {'id': 4, 'name': 'Kitoblar', 'description': 'Kitoblar va nashrlar', 'icon': '📚', 'createdAt': datetime.now().isoformat()}
    ]
    
    categories = load_data(CATEGORIES_FILE, default_categories)
    if not categories:
        save_data(CATEGORIES_FILE, default_categories)
        categories = default_categories
    return categories

def get_orders():
    return load_data(ORDERS_FILE, [])

def get_settings():
    default_settings = {
        'bot_token': os.getenv('BOT_TOKEN', ''),
        'notify_new_order': True,
        'notify_low_stock': True,
        'welcome_message': 'Assalomu alaykum! Mahsulotlar katalogiga xush kelibsiz! 🛍️',
        'contact_info': '📞 Bog\'lanish:\nTelefon: +998 90 123 45 67\nEmail: info@example.uz'
    }
    
    settings = load_data(SETTINGS_FILE, default_settings)
    if not settings:
        save_data(SETTINGS_FILE, default_settings)
        settings = default_settings
    return settings

def add_order(order_data):
    orders = get_orders()
    order = {
        'id': int(datetime.now().timestamp() * 1000),
        'productId': order_data['productId'],
        'userName': order_data['userName'],
        'telegramId': order_data['telegramId'],
        'reason': order_data.get('reason', ''),
        'createdAt': datetime.now().isoformat(),
        'status': 'pending'
    }
    orders.append(order)
    save_data(ORDERS_FILE, orders)
    
    # Mahsulot miqdorini kamaytirish
    products = get_products()
    for product in products:
        if product['id'] == order_data['productId']:
            product['quantity'] = product.get('quantity', 0) - 1
            if product['quantity'] < 0:
                product['quantity'] = 0
            break
    save_data(PRODUCTS_FILE, products)
    
    return order

def format_price(price):
    return "{:,}".format(int(price)).replace(',', ' ')

# Regular bot commands
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    settings = get_settings()
    
    # Check if admin
    is_admin = user.id in ADMIN_IDS
    
    keyboard = [
        [KeyboardButton("🛍 Mahsulotlar")],
        [KeyboardButton("📋 Mening buyurtmalarim")],
        [KeyboardButton("ℹ️ Ma'lumot"), KeyboardButton("☎️ Aloqa")]
    ]
    
    if is_admin:
        keyboard.append([KeyboardButton("👤 Admin Panel")])
    
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    
    welcome_message = settings.get('welcome_message', f"Assalomu alaykum, {user.first_name}! 👋\n\nMahsulotlar katalogiga xush kelibsiz!")
    
    await update.message.reply_text(welcome_message, reply_markup=reply_markup)

# ADMIN COMMANDS - Mahsulot qo'shish (Conversation)
async def add_product_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in ADMIN_IDS:
        await update.message.reply_text("❌ Sizda admin huquqi yo'q.")
        return ConversationHandler.END
    
    await update.message.reply_text("📦 *Yangi mahsulot qo'shish*\n\nMahsulot nomini kiriting:", parse_mode='Markdown')
    return ADD_PRODUCT_NAME

async def add_product_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['new_product_name'] = update.message.text
    
    categories = get_categories()
    keyboard = [[InlineKeyboardButton(f"{cat.get('icon', '📦')} {cat['name']}", callback_data=f"newprod_cat_{cat['id']}")] for cat in categories]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text("Kategoriyani tanlang:", reply_markup=reply_markup)
    return ADD_PRODUCT_CATEGORY

async def add_product_category(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    category_id = int(query.data.split('_')[-1])
    context.user_data['new_product_category'] = category_id
    
    await query.edit_message_text("💰 Narxini kiriting (faqat raqam, so'm):")
    return ADD_PRODUCT_PRICE

async def add_product_price(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        price = float(update.message.text)
        context.user_data['new_product_price'] = price
        await update.message.reply_text("📦 Miqdorini kiriting (faqat raqam):")
        return ADD_PRODUCT_QUANTITY
    except ValueError:
        await update.message.reply_text("❌ Noto'g'ri format! Faqat raqam kiriting:")
        return ADD_PRODUCT_PRICE

async def add_product_quantity(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        quantity = int(update.message.text)
        context.user_data['new_product_quantity'] = quantity
        await update.message.reply_text("📝 Ta'rifini kiriting (yoki /skip):")
        return ADD_PRODUCT_DESCRIPTION
    except ValueError:
        await update.message.reply_text("❌ Noto'g'ri format! Faqat raqam kiriting:")
        return ADD_PRODUCT_QUANTITY

async def add_product_description(update: Update, context: ContextTypes.DEFAULT_TYPE):
    description = update.message.text if update.message.text != '/skip' else ''
    
    # Create product
    products = get_products()
    new_product = {
        'id': int(datetime.now().timestamp() * 1000),
        'name': context.user_data['new_product_name'],
        'categoryId': context.user_data['new_product_category'],
        'price': context.user_data['new_product_price'],
        'quantity': context.user_data['new_product_quantity'],
        'description': description,
        'image': '',
        'createdAt': datetime.now().isoformat()
    }
    
    products.append(new_product)
    save_data(PRODUCTS_FILE, products)
    
    await update.message.reply_text(
        f"✅ Mahsulot qo'shildi!\n\n"
        f"📱 Nomi: {new_product['name']}\n"
        f"💰 Narxi: {format_price(new_product['price'])} so'm\n"
        f"📦 Miqdori: {new_product['quantity']} dona"
    )
    
    # Clear user data
    context.user_data.clear()
    return ConversationHandler.END

async def add_product_cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("❌ Mahsulot qo'shish bekor qilindi.")
    context.user_data.clear()
    return ConversationHandler.END

# List all products (Admin)
async def list_products_admin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in ADMIN_IDS:
        await update.message.reply_text("❌ Sizda admin huquqi yo'q.")
        return
    
    products = get_products()
    categories = get_categories()
    
    if not products:
        await update.message.reply_text("📦 Hozircha mahsulotlar yo'q.\n\n/add_product - Yangi qo'shish")
        return
    
    message = "*📦 Barcha mahsulotlar:*\n\n"
    
    for product in products:
        category = next((c for c in categories if c['id'] == product.get('categoryId')), None)
        category_name = category['name'] if category else 'Noma\'lum'
        
        message += (
            f"*ID:* `{product['id']}`\n"
            f"📱 *Nomi:* {product['name']}\n"
            f"📂 *Kategoriya:* {category_name}\n"
            f"💰 *Narxi:* {format_price(product['price'])} so'm\n"
            f"📦 *Miqdori:* {product.get('quantity', 0)} dona\n"
            f"{'─' * 30}\n\n"
        )
    
    # Split if too long
    if len(message) > 4000:
        parts = [message[i:i+4000] for i in range(0, len(message), 4000)]
        for part in parts:
            await update.message.reply_text(part, parse_mode='Markdown')
    else:
        await update.message.reply_text(message, parse_mode='Markdown')

# Delete product (Admin)
async def delete_product_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in ADMIN_IDS:
        await update.message.reply_text("❌ Sizda admin huquqi yo'q.")
        return
    
    await update.message.reply_text("🗑 Mahsulot ID'sini kiriting:\n\n/list_products - Barcha mahsulotlarni ko'rish")

async def delete_product_by_id(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in ADMIN_IDS:
        return
    
    try:
        product_id = int(update.message.text)
        products = get_products()
        
        product_to_delete = next((p for p in products if p['id'] == product_id), None)
        
        if not product_to_delete:
            await update.message.reply_text(f"❌ ID {product_id} bo'lgan mahsulot topilmadi.")
            return
        
        products = [p for p in products if p['id'] != product_id]
        save_data(PRODUCTS_FILE, products)
        
        await update.message.reply_text(
            f"✅ Mahsulot o'chirildi!\n\n"
            f"📱 {product_to_delete['name']}\n"
            f"💰 {format_price(product_to_delete['price'])} so'm"
        )
    except ValueError:
        await update.message.reply_text("❌ Noto'g'ri ID format! Faqat raqam kiriting.")

# Admin panel
async def admin_panel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in ADMIN_IDS:
        await update.message.reply_text("❌ Sizda admin huquqi yo'q.")
        return
    
    products = get_products()
    orders = get_orders()
    categories = get_categories()
    
    total_products = len(products)
    available_products = len([p for p in products if p.get('quantity', 0) > 0])
    total_orders = len(orders)
    pending_orders = len([o for o in orders if o.get('status') == 'pending'])
    
    message = (
        "*👤 Admin Panel*\n\n"
        f"📊 *Statistika:*\n"
        f"📦 Jami mahsulotlar: {total_products}\n"
        f"✅ Mavjud: {available_products}\n"
        f"📂 Kategoriyalar: {len(categories)}\n"
        f"🛒 Jami buyurtmalar: {total_orders}\n"
        f"⏳ Kutilayotgan: {pending_orders}\n\n"
        f"*Buyruqlar:*\n"
        f"/add_product - Mahsulot qo'shish\n"
        f"/list_products - Mahsulotlar ro'yxati\n"
        f"/delete_product - Mahsulotni o'chirish\n"
        f"/add_category - Kategoriya qo'shish\n"
        f"/admin_orders - Buyurtmalar\n"
        f"/admin_stats - Statistika"
    )
    
    await update.message.reply_text(message, parse_mode='Markdown')

# Regular user commands (existing code continues...)
# [Your existing products, orders, etc. commands here]

# Main
def main():
    BOT_TOKEN = os.getenv('BOT_TOKEN')
    
    if not BOT_TOKEN:
        settings = get_settings()
        BOT_TOKEN = settings.get('bot_token')
    
    if not BOT_TOKEN:
        logger.error("❌ Bot tokeni topilmadi!")
        return
    
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Regular commands
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("admin", admin_panel))
    application.add_handler(CommandHandler("list_products", list_products_admin))
    
    # Add product conversation
    add_product_conv = ConversationHandler(
        entry_points=[CommandHandler('add_product', add_product_start)],
        states={
            ADD_PRODUCT_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_product_name)],
            ADD_PRODUCT_CATEGORY: [CallbackQueryHandler(add_product_category, pattern='^newprod_cat_')],
            ADD_PRODUCT_PRICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_product_price)],
            ADD_PRODUCT_QUANTITY: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_product_quantity)],
            ADD_PRODUCT_DESCRIPTION: [MessageHandler(filters.TEXT, add_product_description)],
        },
        fallbacks=[CommandHandler('cancel', add_product_cancel)]
    )
    application.add_handler(add_product_conv)
    
    logger.info("✅ Bot ishga tushdi!")
    logger.info(f"📊 Ma'lumotlar papkasi: {DATA_DIR}")
    logger.info(f"👥 Admin IDs: {ADMIN_IDS}")
    
    application.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)

if __name__ == '__main__':
    main()
