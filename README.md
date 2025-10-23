# 🛍️ Mahsulot Boshqaruv Tizimi va Telegram Bot

Professional darajadagi web sayt va Telegram bot integratsiyasi mahsulotlarni boshqarish, buyurtmalarni kuzatish va hisobotlarni yaratish uchun.

## ✨ Asosiy xususiyatlar

### 🌐 Web Sayt (Admin Panel)

1. **Chiroyli va zamonaviy dizayn**
   - Responsive interfeys (mobil, planshet, kompyuter)
   - Gradient ranglar va animatsiyalar
   - Professional dashboard
   - Dark mode qo'llab-quvvatlash

2. **Mahsulotlar boshqaruvi**
   - Mahsulot qo'shish, tahrirlash, o'chirish
   - Rasm yuklash va ko'rsatish
   - Narx, miqdor, tavsif qo'shish
   - Real vaqtda qidiruv va filtrlash

3. **Kategoriyalar tizimi**
   - 3-4 ta kategoriya yaratish
   - Kategoriyalarni o'zgartirish
   - Har bir kategoriya uchun icon tanlash
   - Mahsulotlarni kategoriya bo'yicha filtrlash

4. **Buyurtmalar boshqaruvi**
   - Barcha buyurtmalarni ko'rish
   - Kim tomonidan va qachon olinganini ko'rish
   - Buyurtma sababi ko'rsatilishi
   - Buyurtma statusini o'zgartirish

5. **Hisobotlar tizimi**
   - Sana bo'yicha qidirish
   - Kategoriya bo'yicha filtrlash
   - Statistik ma'lumotlar
   - Excel faylga yuklab olish

6. **Telegram bot sozlamalari**
   - Bot tokenini saqlash
   - Bot menyusini boshqarish
   - Xabarnomalar sozlamalari
   - Menu tugmalarini qo'shish/o'chirish

7. **Admin panel**
   - Admin login tizimi
   - Parolni o'zgartirish
   - Ma'lumotlar bazasi backup
   - Barcha ma'lumotlarni tozalash

8. **Xabarnomalar**
   - Yangi buyurtma haqida xabar
   - Mahsulot tugaganda ogohlantirish
   - Real vaqtda notification

### 🤖 Telegram Bot

1. **Foydalanuvchi imkoniyatlari**
   - Mahsulotlar katalogini ko'rish
   - Kategoriyalar bo'yicha qidirish
   - Mahsulot tafsilotlari (rasm, narx, ta'rif)
   - Buyurtma berish
   - Buyurtma sababini yozish
   - O'z buyurtmalarini ko'rish

2. **Admin imkoniyatlari**
   - Yangi buyurtma haqida xabar olish
   - Statistikani ko'rish
   - Mahsulot tugaganda ogohlantirish

3. **Real vaqt sinxronizatsiya**
   - Web saytdagi o'zgarishlar botda ko'rinadi
   - Botdagi buyurtmalar saytda ko'rinadi
   - Mahsulot miqdori avtomatik kamayadi

## 📋 Talablar

### Web Sayt uchun:
- Zamonaviy brauzer (Chrome, Firefox, Safari, Edge)
- JavaScript yoqilgan bo'lishi kerak

### Telegram Bot uchun:
- Python 3.8 yoki yuqori versiya
- pip (Python package manager)
- Telegram bot tokeni

## 🚀 O'rnatish

### 1. Web Saytni ishga tushirish

#### A. Oddiy usul (Local server)

1. Fayllarni yuklab oling
2. `index.html` faylini brauzerda oching
3. Tayyor! Sayt ishlashni boshlaydi

#### B. HTTP server orqali

```bash
# Python bilan
python -m http.server 8000

# Node.js bilan
npx http-server

# PHP bilan
php -S localhost:8000
```

Keyin brauzerda `http://localhost:8000` ga o'ting.

### 2. Telegram Botni ishga tushirish

#### A. Bot yaratish

1. Telegram'da @BotFather ni oching
2. `/newbot` buyrug'ini yozing
3. Bot nomi va username kiriting
4. Bot tokenini saqlang (masalan: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### B. Kerakli kutubxonalarni o'rnatish

```bash
pip install python-telegram-bot
```

#### C. Bot tokenini sozlash

1-usul: `bot_data/settings.json` faylini yarating:

```json
{
  "bot_token": "SIZNING_BOT_TOKEN",
  "notify_new_order": true,
  "notify_low_stock": true
}
```

2-usul: Muhit o'zgaruvchisi orqali:

```bash
export BOT_TOKEN="SIZNING_BOT_TOKEN"
```

#### D. Botni ishga tushirish

```bash
python telegram_bot.py
```

#### E. Admin ID qo'shish

1. Botni Telegram'da oching
2. `/start` ni bosing
3. Sizning Telegram ID'ni oling (botda ko'rsatiladi)
4. `bot_data/admin_ids.json` faylini yarating:

```json
[123456789, 987654321]
```

Yoki botda `/add_admin <user_id>` buyrug'i orqali qo'shing.

## 📚 Foydalanish

### Web Sayt

#### Mahsulot qo'shish:
1. "Mahsulotlar" bo'limiga o'ting
2. "Yangi mahsulot" tugmasini bosing
3. Ma'lumotlarni kiriting:
   - Nomi
   - Kategoriya
   - Narxi
   - Miqdori
   - Ta'rifi
   - Rasm (ixtiyoriy)
4. "Saqlash" ni bosing

#### Kategoriya qo'shish:
1. "Kategoriyalar" bo'limiga o'ting
2. "Yangi kategoriya" tugmasini bosing
3. Ma'lumotlarni kiriting:
   - Nomi
   - Ta'rifi
   - Icon (emoji)
4. "Saqlash" ni bosing

#### Buyurtmalarni ko'rish:
1. "Buyurtmalar" bo'limiga o'ting
2. Buyurtmalarni ko'ring va filtrlang
3. Statusni o'zgartiring (✓ - bajarildi, ✗ - bekor qilindi)

#### Hisobot yaratish:
1. "Hisobotlar" bo'limiga o'ting
2. Sana oralig'ini tanlang
3. Kategoriya tanlang (ixtiyoriy)
4. "Hisobot yaratish" ni bosing
5. "Excel yuklab olish" orqali faylni saqlang

#### Bot sozlamalari:
1. "Bot Sozlamalari" bo'limiga o'ting
2. Bot tokenini kiriting
3. Menu tugmalarini qo'shing/o'zgartiring
4. Xabarnomalarni yoqing/o'chiring

### Telegram Bot

#### Foydalanuvchilar uchun:

1. Botni Telegram'da oching
2. `/start` ni bosing
3. "🛍 Mahsulotlar" ni tanlang
4. Kategoriyani tanlang
5. Mahsulotni tanlang
6. "✅ Buyurtma berish" ni bosing
7. Buyurtma sababini yozing
8. Tayyor!

#### Buyurtmalarni ko'rish:
- "📋 Mening buyurtmalarim" ni bosing

#### Admin buyruqlari:
- `/admin_stats` - Statistikani ko'rish
- `/add_admin <user_id>` - Yangi admin qo'shish

## 🔧 Konfiguratsiya

### Web Sayt sozlamalari

`script.js` faylida:

```javascript
// Mahsulot minimal miqdori (kam qolganda ogohlantirish)
const MIN_STOCK = 5;

// Xabarnoma ko'rsatish vaqti (millisekundlarda)
const NOTIFICATION_DURATION = 3000;
```

### Bot sozlamalari

`bot_data/settings.json` faylida:

```json
{
  "bot_token": "SIZNING_BOT_TOKEN",
  "notify_new_order": true,
  "notify_low_stock": true,
  "welcome_message": "Xush kelibsiz!",
  "contact_info": "Tel: +998901234567"
}
```

## 📊 Ma'lumotlar bazasi

### Fayl tuzilishi:

```
bot_data/
├── products.json        # Mahsulotlar
├── categories.json      # Kategoriyalar
├── orders.json          # Buyurtmalar
├── settings.json        # Sozlamalar
└── admin_ids.json       # Admin ID'lar
```

### Backup yaratish:

Web saytda:
1. "Sozlamalar" bo'limiga o'ting
2. "Backup yaratish" tugmasini bosing
3. JSON fayl yuklab olinadi

### Ma'lumotlarni tiklash:

1. Backup faylini oching
2. Ichidagi ma'lumotlarni tegishli faylga ko'chiring

## 🔐 Xavfsizlik

### Web Sayt:

- Admin panelga kirish uchun parol talab qilinadi (production'da)
- LocalStorage ishlatiladi (real loyihada server-side database kerak)
- HTTPS orqali ishlash tavsiya etiladi

### Bot:

- Admin ID'lar `admin_ids.json` faylida saqlanadi
- Bot tokeni muhofaza qilinishi kerak
- `.env` fayldan foydalanish tavsiya etiladi

## 🚀 Production'ga deploy qilish

### Web Sayt:

1. **GitHub Pages:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
   Settings → Pages → Deploy from main branch

2. **Netlify:**
   - Fayllarni drag & drop qiling
   - Yoki GitHub'ga ulab deploy qiling

3. **Vercel:**
   - `vercel deploy` buyrug'ini ishlating

### Telegram Bot:

1. **VPS/Cloud Server:**
   ```bash
   # Screen yoki tmux ishlatish
   screen -S telegram_bot
   python telegram_bot.py
   # Ctrl+A+D (detach)
   ```

2. **Heroku:**
   - `Procfile` yarating: `web: python telegram_bot.py`
   - Git orqali deploy qiling

3. **PythonAnywhere:**
   - Fayllarni yuklab oling
   - "Always on" task yarating

## 🐛 Muammolarni hal qilish

### Web Sayt ishlamayapti:
- JavaScript console'ni tekshiring (F12)
- Browser'ni yangilang
- Cache'ni tozalang

### Bot javob bermayapti:
- Bot tokeni to'g'ri ekanligini tekshiring
- Internet aloqasini tekshiring
- Bot loglarini ko'ring:
  ```bash
  python telegram_bot.py
  ```

### Ma'lumotlar saqlanmayapti:
- LocalStorage yoqilganligini tekshiring
- Private/Incognito mode'da emas ekanligini tekshiring

## 📞 Yordam

Savollar yoki muammolar bo'lsa:
- Telegram: @yourusername
- Email: your@email.com
- GitHub: github.com/yourusername/yourrepo

## 📝 Litsenziya

Bu loyiha MIT litsenziyasi ostida tarqatiladi.

## 🎉 Xususiyatlar

- ✅ Responsive dizayn
- ✅ Real vaqt sinxronizatsiya
- ✅ Rasm yuklash
- ✅ Excel export
- ✅ Xabarnomalar
- ✅ Multi-kategoriya
- ✅ Admin panel
- ✅ Telegram bot
- ✅ Buyurtmalar tizimi
- ✅ Hisobotlar
- ✅ Ma'lumotlar bazasi backup

## 🔄 Yangilanishlar

### v1.0.0 (2025-01-23)
- Dastlabki versiya
- Barcha asosiy xususiyatlar qo'shildi
- Web sayt va bot integratsiyasi

---

**Muallif:** Sizning ismingiz  
**Versiya:** 1.0.0  
**Sana:** 2025-01-23
