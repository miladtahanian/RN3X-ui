<div align="center">
  <br>
  <img src="./assets/icon.png" width="120" height="120" alt="RN3X-ui Logo">
  <h1>RN3X-ui</h1>
  <p>
    <strong>A modern, bilingual mobile client for 3X-UI proxy panel management</strong>
    <br>
    <strong>یک کلاینت موبایل مدرن و دو زبانه برای مدیریت پنل پروکسی 3X-UI</strong>
  </p>
  <p>
    Built with <a href="https://expo.dev">Expo</a> + <a href="https://reactnative.dev">React Native</a>
  </p>
  <p>
    <a href="#english">English</a> &bull; <a href="#persian">فارسی</a>
  </p>
  <br>
</div>

---

<a name="english"></a>
## 🇬🇧 English

**RN3X-ui** is a cross-platform mobile application for managing [3X-UI](https://github.com/MHSanaei/3x-ui) proxy server panels. It provides a beautiful, dark-themed dashboard to monitor and configure your Xray/V2Ray proxy infrastructure on the go.

### ✨ Features

- **Dashboard** — Real-time server status monitoring (CPU, RAM, Disk, Swap, Uptime, Xray status, Avg Load)
- **Traffic Analytics** — Upload/download traffic visualization with progress bars
- **Online Users** — See who's connected in real time
- **Client Management** — List, search, filter, delete clients, reset traffic, view detailed usage
- **Client Details** — Traffic consumption breakdown, user metadata (ID, IP limit, expiry, Sub ID), shareable connection links
- **Inbound Management** — View all inbounds with protocol badges (VLESS, VMESS, Trojan, Shadowsocks, etc.), enable/disable toggle, delete
- **Panel Settings** — View connection info, panel configuration, restart panel
- **Multi-language** — Full support for English and Persian (فارسی) with automatic RTL/LTR switching
- **Dark Theme** — Modern, eye-friendly dark UI with smooth animations

### 📸 Screenshots

> _Screenshots coming soon_

### 🚀 Getting Started

#### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A running [3X-UI](https://github.com/MHSanaei/3x-ui) panel instance

#### Installation

```bash
# Clone the repository
git clone https://github.com/miladtahanian/RN3X-ui.git
cd RN3X-ui

# Install dependencies
npm install

# Start the app
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) or press `w` to open in your browser.

#### Build for production

```bash
# Android APK
npx eas build --platform android --profile production

# iOS IPA
npx eas build --platform ios --profile production

# Web export
npx expo export --platform web
```

### 🧰 Usage

1. Open the app and enter your **3X-UI panel URL** (e.g. `https://your-server:2053`)
2. Log in with your panel **username** and **password**
3. The dashboard shows server status, traffic stats, and online users
4. Use the drawer menu to navigate between sections
5. Switch language in **Settings** → tap **English** or **فارسی**

### 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) | Framework |
| [React Native](https://reactnative.dev/) | Mobile UI |
| [React Navigation](https://reactnavigation.org/) | Drawer + Stack navigation |
| [Axios](https://axios-http.com/) | HTTP client |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Persistent storage |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | Animations |

### 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<a name="persian"></a>
## 🇮🇷 فارسی

**آر‌ان‌تری‌ایکس-یوآی** یک اپلیکیشن موبایل بین‌پلتفرمی برای مدیریت پنل‌های پروکسی [3X-UI](https://github.com/MHSanaei/3x-ui) است. با این برنامه می‌توانید زیرساخت پروکسی Xray/V2Ray خود را به صورت سیار مدیریت و مانیتور کنید.

### ✨ ویژگی‌ها

- **داشبورد** — مانیتورینگ لحظه‌ای وضعیت سرور (CPU، RAM، دیسک، Swap، آپتایم، وضعیت Xray، میانگین بار)
- **آمار ترافیک** — نمایش ترافیک آپلود/دانلود به صورت نمودار و اعداد
- **کاربران آنلاین** — مشاهده کاربران متصل در لحظه
- **مدیریت کاربران** — لیست، جستجو، فیلتر، حذف کاربران، ریست ترافیک و مشاهده جزئیات مصرف
- **جزئیات کاربر** — تفکیک مصرف ترافیک، اطلاعات کاربر (شناسه، محدودیت IP، تاریخ انقضا)، لینک‌های اشتراک‌گذاری
- **مدیریت Inboundها** — مشاهده تمام inboundها با نشان پروتکل (VLESS, VMESS, Trojan, Shadowsocks و ...)، فعال/غیرفعال کردن، حذف
- **تنظیمات پنل** — مشاهده اطلاعات اتصال، تنظیمات پنل، راه‌اندازی مجدد
- **دو زبانه** — پشتیبانی کامل از فارسی و انگلیسی با تغییر خودکار جهت RTL/LTR
- **تم تیره** — رابط کاربری تیره و مدرن با انیمیشن‌های روان

### 📸 تصاویر

> _به زودی اضافه می‌شود_

### 🚀 شروع به کار

#### پیش‌نیازها

- [Node.js](https://nodejs.org/) نسخه ۱۸ یا بالاتر
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- یک نمونه فعال از پنل [3X-UI](https://github.com/MHSanaei/3x-ui)

#### نصب

```bash
# کلون کردن مخزن
git clone https://github.com/miladtahanian/RN3X-ui.git
cd RN3X-ui

# نصب وابستگی‌ها
npm install

# اجرای اپلیکیشن
npx expo start
```

کد QR را با **Expo Go** اسکن کنید (اندروید/iOS) یا کلید `w` را بزنید تا در مرورگر باز شود.

#### ساخت نسخه نهایی

```bash
# APK اندروید
npx eas build --platform android --profile production

# iOS IPA
npx eas build --platform ios --profile production

# خروجی وب
npx expo export --platform web
```

### 🧰 نحوه استفاده

1. اپلیکیشن را باز کنید و **آدرس پنل 3X-UI** خود را وارد کنید (مثلاً `https://your-server:2053`)
2. با **نام کاربری** و **رمز عبور** پنل خود وارد شوید
3. داشبورد وضعیت سرور، آمار ترافیک و کاربران آنلاین را نمایش می‌دهد
4. از منوی کشویی برای جابجایی بین بخش‌ها استفاده کنید
5. زبان را در **تنظیمات** با انتخاب **English** یا **فارسی** تغییر دهید

### 🛠️ تکنولوژی‌های استفاده شده

| تکنولوژی | کاربرد |
|---|---|
| [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) | فریمورک اصلی |
| [React Native](https://reactnative.dev/) | رابط کاربری موبایل |
| [React Navigation](https://reactnavigation.org/) | ناوبری Drawer + Stack |
| [Axios](https://axios-http.com/) | کلاینت HTTP |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | ذخیره‌سازی محلی |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | انیمیشن‌ها |

### 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است — برای اطلاعات بیشتر فایل [LICENSE](LICENSE) را ببینید.

---

<div align="center">
  <br>
  <p>
    Made with ❤️ for the 3X-UI community
    <br>
    ساخته شده با ❤️ برای جامعه 3X-UI
  </p>
  <br>
</div>
