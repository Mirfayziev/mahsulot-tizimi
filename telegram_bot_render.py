"""
Telegram Bot - Render.com uchun optimizatsiya qilingan
24/7 ishlash uchun disk storage bilan
"""

import os
import json
import logging
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes

# Logging sozlash
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Ma'lumotlar bazasi fayllari - Render.com disk storage
DATA_DIR = os.getenv('DATA_DIR', '/opt/render/project/src/bot_data')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')
CATEGORIES_FILE = os.path.join(DATA_DIR, 'categories.json')
ORDERS_FILE = os.path.join(DATA_DIR, 'orders.json')
SETTINGS_FILE = os.path.join(DATA_DIR, 'settings.json')
ADMIN_ID_FILE = os.path.join(DATA_DIR, 'admin_ids.json')

# Ma'lumotlar bazasi papkasini yaratish
os.makedirs(DATA_DIR, exist_ok=True)

# Admin ID'lar
def load_admin_ids():
    """Admin ID'larni yuklash"""
    try:
        if os.path.exists(ADMIN_ID_FILE):
            with open(ADMIN_ID_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Admin IDs yuklashda xatolik: {e}")
    
    # Default admin ID (muhit o'zgaruvchisidan)
    admin_ids_str = os.getenv('ADMIN_IDS', '')
    if admin_ids_str:
        return [int(id.strip()) for id in admin_ids_str.split(',') if id.strip()]
    return []

def save_admin_ids(admin_ids):
    """Admin ID'larni saqlash"""
    try:
        with open(ADMIN_ID_FILE, 'w', encoding='utf-8') as f:
            json.dump(admin_ids, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Admin IDs saqlashda xatolik: {e}")

ADMIN_IDS = load_admin_ids()

# Ma'lumotlar bazasi funksiyalari
def load_data(filename, default=None):
    """Fayldan ma'lumotlarni yuklash"""
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
    """Ma'lumotlarni faylga saqlash"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Ma'lumot saqlashda xatolik {filename}: {e}")

def get_products():
    """Mahsulotlarni olish"""
    return load_data(PRODUCTS_FILE, [])

def get_categories():
    """Kategoriyalarni olish"""
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
    """Buyurtmalarni olish"""
    return load_data(ORDERS_FILE, [])

def get_settings():
    """Sozlamalarni olish"""
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
    """Yangi buyurtma qo'shish"""
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

# Bot buyruqlari
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start buyrug'i - asosiy menyu"""
    user = update.effective_user
    settings = get_settings()
    
    keyboard = [
        [KeyboardButton("🛍 Mahsulotlar")],
        [KeyboardButton("📋 Mening buyurtmalarim")],
        [KeyboardButton("ℹ️ Ma'lumot"), KeyboardButton("☎️ Aloqa")]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    
    welcome_message = settings.get('welcome_message', 
        f"Assalomu alaykum, {user.first_name}! 👋\n\n"
        "Mahsulotlar katalogiga xush kelibsiz!\n\n"
        "Quyidagi tugmalardan birini tanlang:"
    )
    
    await update.message.reply_text(welcome_message, reply_markup=reply_markup)

async def products(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Mahsulotlar kategoriyalarini ko'rsatish"""
    categories = get_categories()
    
    if not categories:
        await update.message.reply_text("Hozircha kategoriyalar mavjud emas.")
        return
    
    keyboard = []
    for category in categories:
        keyboard.append([InlineKeyboardButton(
            f"{category.get('icon', '📦')} {category['name']}", 
            callback_data=f"category_{category['id']}"
        )])
    
    keyboard.append([InlineKeyboardButton("🔙 Orqaga", callback_data="back_to_main")])
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "📦 *Kategoriyalar:*\n\nQaysi kategoriyani ko'rmoqchisiz?",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def show_category_products(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Tanlangan kategoriya mahsulotlarini ko'rsatish"""
    query = update.callback_query
    await query.answer()
    
    category_id = int(query.data.split('_')[1])
    products = get_products()
    categories = get_categories()
    
    category = next((cat for cat in categories if cat['id'] == category_id), None)
    if not category:
        await query.edit_message_text("Kategoriya topilmadi.")
        return
    
    category_products = [p for p in products if p.get('categoryId') == category_id and p.get('quantity', 0) > 0]
    
    if not category_products:
        keyboard = [[InlineKeyboardButton("🔙 Orqaga", callback_data="back_to_categories")]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(
            f"*{category['name']}* kategoriyasida hozircha mahsulotlar yo'q.",
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
        return
    
    keyboard = []
    for product in category_products:
        keyboard.append([InlineKeyboardButton(
            f"{product['name']} - {format_price(product['price'])} so'm",
            callback_data=f"product_{product['id']}"
        )])
    
    keyboard.append([InlineKeyboardButton("🔙 Orqaga", callback_data="back_to_categories")])
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        f"*{category['name']}*\n\n{category.get('description', '')}\n\nMahsulotlar:",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def show_product_details(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Mahsulot tafsilotlarini ko'rsatish"""
    query = update.callback_query
    await query.answer()
    
    product_id = int(query.data.split('_')[1])
    products = get_products()
    categories = get_categories()
    
    product = next((p for p in products if p['id'] == product_id), None)
    if not product:
        await query.edit_message_text("Mahsulot topilmadi.")
        return
    
    category = next((cat for cat in categories if cat['id'] == product.get('categoryId')), None)
    category_name = category['name'] if category else "Kategoriyasiz"
    
    message = (
        f"*{product['name']}*\n\n"
        f"📂 Kategoriya: {category_name}\n"
        f"💰 Narxi: {format_price(product['price'])} so'm\n"
        f"📦 Mavjud: {product.get('quantity', 0)} dona\n\n"
    )
    
    if product.get('description'):
        message += f"📝 Tavsif: {product['description']}\n\n"
    
    keyboard = [
        [InlineKeyboardButton("✅ Buyurtma berish", callback_data=f"order_{product_id}")],
        [InlineKeyboardButton("🔙 Orqaga", callback_data=f"category_{product.get('categoryId')}")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(message, reply_markup=reply_markup, parse_mode='Markdown')

async def order_product(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Mahsulotga buyurtma berish"""
    query = update.callback_query
    await query.answer()
    
    product_id = int(query.data.split('_')[1])
    context.user_data['ordering_product_id'] = product_id
    
    await query.edit_message_text(
        "Buyurtma sababini yozing:\n(Masalan: O'zimga kerak, Do'stimga sovg'a, ish uchun va h.k.)",
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("❌ Bekor qilish", callback_data=f"product_{product_id}")
        ]])
    )

async def handle_order_reason(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Buyurtma sababini qabul qilish"""
    if 'ordering_product_id' not in context.user_data:
        return
    
    product_id = context.user_data['ordering_product_id']
    reason = update.message.text
    user = update.effective_user
    
    products = get_products()
    product = next((p for p in products if p['id'] == product_id), None)
    
    if not product:
        await update.message.reply_text("Mahsulot topilmadi.")
        del context.user_data['ordering_product_id']
        return
    
    if product.get('quantity', 0) <= 0:
        await update.message.reply_text("Kechirasiz, bu mahsulot tugadi.")
        del context.user_data['ordering_product_id']
        return
    
    order_data = {
        'productId': product_id,
        'userName': f"{user.first_name} {user.last_name or ''}".strip(),
        'telegramId': user.id,
        'reason': reason
    }
    
    order = add_order(order_data)
    
    await update.message.reply_text(
        f"✅ Buyurtma qabul qilindi!\n\n"
        f"Buyurtma raqami: #{order['id']}\n"
        f"Mahsulot: {product['name']}\n"
        f"Sabab: {reason}\n\n"
        f"Buyurtmangiz tez orada ko'rib chiqiladi."
    )
    
    # Adminga xabar yuborish
    settings = get_settings()
    if settings.get('notify_new_order', True):
        for admin_id in ADMIN_IDS:
            try:
                await context.bot.send_message(
                    chat_id=admin_id,
                    text=(
                        f"🔔 *Yangi buyurtma!*\n\n"
                        f"Buyurtma ID: #{order['id']}\n"
                        f"Mahsulot: {product['name']}\n"
                        f"Foydalanuvchi: {order_data['userName']}\n"
                        f"Telegram ID: {user.id}\n"
                        f"Sabab: {reason}\n"
                        f"Qolgan miqdor: {product.get('quantity', 0)} dona"
                    ),
                    parse_mode='Markdown'
                )
            except Exception as e:
                logger.error(f"Admin {admin_id} ga xabar yuborishda xatolik: {e}")
        
        if product.get('quantity', 0) <= 5 and settings.get('notify_low_stock', True):
            for admin_id in ADMIN_IDS:
                try:
                    await context.bot.send_message(
                        chat_id=admin_id,
                        text=f"⚠️ Diqqat! *{product['name']}* mahsuloti kamayib bormoqda!\nQolgan miqdor: {product.get('quantity', 0)} dona",
                        parse_mode='Markdown'
                    )
                except Exception as e:
                    logger.error(f"Admin {admin_id} ga low stock xabari yuborishda xatolik: {e}")
    
    del context.user_data['ordering_product_id']

async def my_orders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Foydalanuvchining buyurtmalarini ko'rsatish"""
    user = update.effective_user
    orders = get_orders()
    products = get_products()
    
    user_orders = [o for o in orders if o.get('telegramId') == user.id]
    
    if not user_orders:
        await update.message.reply_text("Sizda hali buyurtmalar yo'q.")
        return
    
    message = "*📋 Sizning buyurtmalaringiz:*\n\n"
    
    for order in reversed(user_orders[-10:]):
        product = next((p for p in products if p['id'] == order.get('productId')), None)
        product_name = product['name'] if product else "Noma'lum mahsulot"
        
        status_emoji = {'pending': '⏳', 'completed': '✅', 'cancelled': '❌'}
        status_text = {'pending': 'Kutilmoqda', 'completed': 'Bajarildi', 'cancelled': 'Bekor qilindi'}
        
        emoji = status_emoji.get(order.get('status', 'pending'), '⏳')
        status = status_text.get(order.get('status', 'pending'), 'Kutilmoqda')
        
        order_date = datetime.fromisoformat(order['createdAt']).strftime('%d.%m.%Y %H:%M')
        
        message += (
            f"{emoji} *Buyurtma #{order['id']}*\n"
            f"Mahsulot: {product_name}\n"
            f"Sabab: {order.get('reason', '-')}\n"
            f"Sana: {order_date}\n"
            f"Status: {status}\n\n"
        )
    
    await update.message.reply_text(message, parse_mode='Markdown')

async def info(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Bot haqida ma'lumot"""
    message = (
        "*ℹ️ Bot haqida ma'lumot*\n\n"
        "Bu bot orqali siz:\n"
        "• Mahsulotlar katalogini ko'rishingiz\n"
        "• Buyurtma berishingiz\n"
        "• Buyurtmalaringizni kuzatishingiz mumkin\n\n"
        "Barcha ma'lumotlar sayt bilan real vaqtda sinxronlashadi.\n\n"
        "*Buyruqlar:*\n"
        "/start - Asosiy menyu\n"
        "/products - Mahsulotlar\n"
        "/my_orders - Mening buyurtmalarim\n"
        "/info - Ma'lumot\n"
        "/contact - Aloqa\n"
        "/health - Bot holati"
    )
    
    await update.message.reply_text(message, parse_mode='Markdown')

async def contact(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Aloqa ma'lumotlari"""
    settings = get_settings()
    contact_info = settings.get('contact_info', 
        "📞 Bog'lanish uchun:\n"
        "Telefon: +998901234567\n"
        "Email: info@example.com"
    )
    
    await update.message.reply_text(contact_info)

async def health(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Bot holati - Render.com health check"""
    products = get_products()
    orders = get_orders()
    categories = get_categories()
    
    message = (
        "✅ *Bot ishlayapti!*\n\n"
        f"📦 Mahsulotlar: {len(products)}\n"
        f"📂 Kategoriyalar: {len(categories)}\n"
        f"🛒 Buyurtmalar: {len(orders)}\n"
        f"📁 Data papka: {DATA_DIR}\n"
        f"⏰ Vaqt: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    )
    
    await update.message.reply_text(message, parse_mode='Markdown')

async def handle_text_messages(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Matnli xabarlarni qayta ishlash"""
    text = update.message.text
    
    if 'ordering_product_id' in context.user_data:
        await handle_order_reason(update, context)
        return
    
    if text == "🛍 Mahsulotlar":
        await products(update, context)
    elif text == "📋 Mening buyurtmalarim":
        await my_orders(update, context)
    elif text == "ℹ️ Ma'lumot":
        await info(update, context)
    elif text == "☎️ Aloqa":
        await contact(update, context)
    else:
        await update.message.reply_text("Noto'g'ri buyruq. /start buyrug'ini bosing.")

async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Callback so'rovlarini qayta ishlash"""
    query = update.callback_query
    data = query.data
    
    if data.startswith('category_'):
        await show_category_products(update, context)
    elif data.startswith('product_'):
        await show_product_details(update, context)
    elif data.startswith('order_'):
        await order_product(update, context)
    elif data == 'back_to_main':
        await query.answer()
        await query.message.delete()
    elif data == 'back_to_categories':
        await query.answer()
        categories = get_categories()
        
        keyboard = []
        for category in categories:
            keyboard.append([InlineKeyboardButton(
                f"{category.get('icon', '📦')} {category['name']}", 
                callback_data=f"category_{category['id']}"
            )])
        
        keyboard.append([InlineKeyboardButton("🔙 Orqaga", callback_data="back_to_main")])
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            "📦 *Kategoriyalar:*\n\nQaysi kategoriyani ko'rmoqchisiz?",
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )

def format_price(price):
    """Narxni formatlash"""
    return "{:,}".format(int(price)).replace(',', ' ')

async def admin_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin statistikasi"""
    user_id = update.effective_user.id
    
    if user_id not in ADMIN_IDS:
        await update.message.reply_text("Sizda admin huquqi yo'q.")
        return
    
    products = get_products()
    categories = get_categories()
    orders = get_orders()
    
    total_products = len(products)
    available_products = len([p for p in products if p.get('quantity', 0) > 0])
    total_orders = len(orders)
    pending_orders = len([o for o in orders if o.get('status') == 'pending'])
    
    message = (
        f"*📊 Admin statistikasi*\n\n"
        f"📦 Jami mahsulotlar: {total_products}\n"
        f"✅ Mavjud mahsulotlar: {available_products}\n"
        f"📂 Kategoriyalar: {len(categories)}\n"
        f"🛒 Jami buyurtmalar: {total_orders}\n"
        f"⏳ Kutilayotgan buyurtmalar: {pending_orders}\n"
    )
    
    await update.message.reply_text(message, parse_mode='Markdown')

async def add_admin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Yangi admin qo'shish"""
    user_id = update.effective_user.id
    
    if user_id not in ADMIN_IDS:
        await update.message.reply_text("Sizda admin huquqi yo'q.")
        return
    
    if not context.args:
        await update.message.reply_text("Foydalanish: /add_admin <user_id>")
        return
    
    try:
        new_admin_id = int(context.args[0])
        if new_admin_id not in ADMIN_IDS:
            ADMIN_IDS.append(new_admin_id)
            save_admin_ids(ADMIN_IDS)
            await update.message.reply_text(f"✅ Admin qo'shildi: {new_admin_id}")
        else:
            await update.message.reply_text("Bu foydalanuvchi allaqachon admin.")
    except ValueError:
        await update.message.reply_text("Noto'g'ri user_id formati.")

# Error handler
async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Xatolarni qayta ishlash"""
    logger.error(f"Update {update} caused error {context.error}")

def main():
    """Botni ishga tushirish"""
    BOT_TOKEN = os.getenv('BOT_TOKEN')
    
    if not BOT_TOKEN:
        settings = get_settings()
        BOT_TOKEN = settings.get('bot_token')
    
    if not BOT_TOKEN:
        logger.error("❌ Bot tokeni topilmadi!")
        logger.error("BOT_TOKEN muhit o'zgaruvchisini belgilang yoki bot_data/settings.json da saqlang")
        return
    
    # Applicationni yaratish
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Handlerlarni qo'shish
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("products", products))
    application.add_handler(CommandHandler("my_orders", my_orders))
    application.add_handler(CommandHandler("info", info))
    application.add_handler(CommandHandler("contact", contact))
    application.add_handler(CommandHandler("health", health))
    application.add_handler(CommandHandler("admin_stats", admin_stats))
    application.add_handler(CommandHandler("add_admin", add_admin))
    
    application.add_handler(CallbackQueryHandler(callback_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text_messages))
    
    # Error handler
    application.add_error_handler(error_handler)
    
    # Botni ishga tushirish
    logger.info("✅ Bot ishga tushdi!")
    logger.info(f"📊 Ma'lumotlar papkasi: {DATA_DIR}")
    logger.info(f"👥 Admin IDs: {ADMIN_IDS}")
    
    application.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)

if __name__ == '__main__':
    main()
