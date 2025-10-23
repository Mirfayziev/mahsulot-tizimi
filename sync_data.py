"""
Ma'lumotlar Sinxronizatsiyasi
Web sayt va Telegram bot o'rtasida ma'lumotlarni sinxronlashtiradi
"""

import json
import os
import shutil
from datetime import datetime

# Papkalar
WEB_DATA_DIR = 'web_data'
BOT_DATA_DIR = 'bot_data'

# Fayllar
FILES_TO_SYNC = ['products.json', 'categories.json', 'orders.json', 'settings.json']

def ensure_directories():
    """Papkalarni yaratish"""
    os.makedirs(WEB_DATA_DIR, exist_ok=True)
    os.makedirs(BOT_DATA_DIR, exist_ok=True)

def sync_web_to_bot():
    """Web saytdan bot'ga ma'lumotlarni nusxalash"""
    ensure_directories()
    
    print("🔄 Web saytdan bot'ga sinxronizatsiya boshlandi...")
    
    for filename in FILES_TO_SYNC:
        web_file = os.path.join(WEB_DATA_DIR, filename)
        bot_file = os.path.join(BOT_DATA_DIR, filename)
        
        if os.path.exists(web_file):
            shutil.copy2(web_file, bot_file)
            print(f"✅ {filename} nusxalandi")
        else:
            print(f"⚠️ {filename} topilmadi")
    
    print("✅ Sinxronizatsiya tugadi!\n")

def sync_bot_to_web():
    """Botdan web saytga ma'lumotlarni nusxalash"""
    ensure_directories()
    
    print("🔄 Botdan web saytga sinxronizatsiya boshlandi...")
    
    for filename in FILES_TO_SYNC:
        bot_file = os.path.join(BOT_DATA_DIR, filename)
        web_file = os.path.join(WEB_DATA_DIR, filename)
        
        if os.path.exists(bot_file):
            shutil.copy2(bot_file, web_file)
            print(f"✅ {filename} nusxalandi")
        else:
            print(f"⚠️ {filename} topilmadi")
    
    print("✅ Sinxronizatsiya tugadi!\n")

def create_backup():
    """Backup yaratish"""
    ensure_directories()
    
    backup_dir = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(backup_dir, exist_ok=True)
    
    print(f"💾 Backup yaratilmoqda: {backup_dir}")
    
    # Web ma'lumotlarini backup qilish
    for filename in FILES_TO_SYNC:
        web_file = os.path.join(WEB_DATA_DIR, filename)
        if os.path.exists(web_file):
            shutil.copy2(web_file, os.path.join(backup_dir, f"web_{filename}"))
    
    # Bot ma'lumotlarini backup qilish
    for filename in FILES_TO_SYNC:
        bot_file = os.path.join(BOT_DATA_DIR, filename)
        if os.path.exists(bot_file):
            shutil.copy2(bot_file, os.path.join(backup_dir, f"bot_{filename}"))
    
    print(f"✅ Backup yaratildi: {backup_dir}\n")

def show_status():
    """Ma'lumotlar holati"""
    ensure_directories()
    
    print("📊 Ma'lumotlar holati:\n")
    
    print("Web Sayt:")
    for filename in FILES_TO_SYNC:
        web_file = os.path.join(WEB_DATA_DIR, filename)
        if os.path.exists(web_file):
            size = os.path.getsize(web_file)
            with open(web_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                count = len(data) if isinstance(data, list) else "N/A"
            print(f"  ✅ {filename}: {size} bytes, {count} items")
        else:
            print(f"  ❌ {filename}: Mavjud emas")
    
    print("\nTelegram Bot:")
    for filename in FILES_TO_SYNC:
        bot_file = os.path.join(BOT_DATA_DIR, filename)
        if os.path.exists(bot_file):
            size = os.path.getsize(bot_file)
            with open(bot_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                count = len(data) if isinstance(data, list) else "N/A"
            print(f"  ✅ {filename}: {size} bytes, {count} items")
        else:
            print(f"  ❌ {filename}: Mavjud emas")
    
    print()

def auto_sync():
    """Avtomatik sinxronizatsiya (har 10 sekundda)"""
    import time
    
    print("🔄 Avtomatik sinxronizatsiya rejimi")
    print("Ctrl+C bilan to'xtatish mumkin\n")
    
    try:
        while True:
            sync_web_to_bot()
            sync_bot_to_web()
            print(f"⏰ Keyingi sinxronizatsiya 10 sekunddan keyin...")
            time.sleep(10)
    except KeyboardInterrupt:
        print("\n👋 Sinxronizatsiya to'xtatildi")

def main():
    """Asosiy menyu"""
    print("=" * 50)
    print("📦 Ma'lumotlar Sinxronizatsiya Tizimi")
    print("=" * 50)
    print()
    
    while True:
        print("Tanlang:")
        print("1. Web → Bot sinxronizatsiya")
        print("2. Bot → Web sinxronizatsiya")
        print("3. Ikki tomonlama sinxronizatsiya")
        print("4. Backup yaratish")
        print("5. Holat ko'rsatish")
        print("6. Avtomatik sinxronizatsiya")
        print("0. Chiqish")
        print()
        
        choice = input("Tanlov (0-6): ").strip()
        
        if choice == '1':
            sync_web_to_bot()
        elif choice == '2':
            sync_bot_to_web()
        elif choice == '3':
            sync_web_to_bot()
            sync_bot_to_web()
        elif choice == '4':
            create_backup()
        elif choice == '5':
            show_status()
        elif choice == '6':
            auto_sync()
        elif choice == '0':
            print("👋 Xayr!")
            break
        else:
            print("❌ Noto'g'ri tanlov\n")

if __name__ == '__main__':
    main()
