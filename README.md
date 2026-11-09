# 🥢 Tokyo Michelin & Tabelog Guide Explorer

An interactive web application mapping Tokyo's Michelin-starred and Bib Gourmand restaurants, cross-referenced with **Tabelog (食べログ)** scores, **Reddit** community consensus (from r/finedining, r/TokyoFood, and r/JapanTravel), pricing tiers, and a **dynamic travel window booking engine**.

🔗 **GitHub Repository**: [https://github.com/laufogh/tokyo-michelin](https://github.com/laufogh/tokyo-michelin)

---

## 🌟 Key Features

### 1. 🗺️ Interactive Tokyo Fine Dining Map
- Interactive Leaflet map centered on Tokyo's gastronomic hubs (Ginza, Roppongi, Shinjuku, Shibuya, Kagurazaka, Asakusa).
- Custom map pins visualising Michelin stars (3-Star Gold, 2-Star Silver/Rose, 1-Star Red, Bib Gourmand Emerald).
- Clickable pins with thumbnail images, live availability indicators, Tabelog ratings, and one-click booking links.
- Seamless sync: clicking a restaurant card smoothly pans and zooms the map (`flyTo`).

### 2. 🍣 Grouped by Cuisine Types
Pill and tab filters for instant exploration:
- 🍣 **Sushi** (Edomae, Jukusei dry-aged sushi)
- 🍜 **Ramen** (Consommé, Tantanmen, Tori Paitan, Shoyu)
- 🍱 **Kaiseki & Traditional Japanese** (Kappo, Shojin, Kyoto style)
- 🍷 **French & Contemporary** (Modern French, Satoyama)
- 🍤 **Tempura** (Artisanal low-oil technique)
- 🍢 **Yakitori** (Kishu Binchotan charcoal grilled)
- 🥩 **Wagyu, Sukiyaki & Tonkatsu** (Teppanyaki, Kuroge Wagyu, Heritage Pork)
- 🥢 **Soba & Udon** (Hand-milled Teuchi soba, Sanuki udon)
- 🥟 **Chinese & Asian** (Haute Kaiseki Chinese)
- 🍕 **Italian & Modern Pizza** (Wood-fired Tokyo Neapolitan)

### 3. ⭐ Multi-Dimensional Rating Breakdown
- **Michelin Stars**: 3 Stars, 2 Stars, 1 Star, Bib Gourmand, Green Star (Sustainability).
- **Tabelog Ratings**:
  - Incorporates Japan's standard gourmet benchmark out of 5.00.
  - Distinguishes **Gold**, **Silver**, **Bronze**, and **Hyakumeiten (Top 100)** awardees.
  - Interactive **Tabelog Guide Modal** explaining why scores above 3.80 are elite (top 0.1% in Japan) and 4.00+ are world-class.
- **Reddit Community Consensus**:
  - Approval percentage & community ratings across `r/finedining`, `r/TokyoFood`, and `r/JapanTravel`.
  - Curated insider quotes and recommendations for each venue.

### 4. 📅 Smart Travel Window & Booking Availability Engine
- **Plug in your travel dates** (Arrival and Departure) + party size.
- The engine calculates booking availability against each venue's specific booking policy:
  - 🟢 **Available Now / Open for Booking**: Direct booking links to TableCheck, Omakase.jp, Pocket Concierge, or AutoReserve.
  - 🟡 **Window Opens Soon (With Countdown)**: Displays exact date & time when slots release (e.g., *"Opens on 1st of month at 10:00 AM JST"*).
  - 📆 **Add to Google Calendar Button**: Pre-fills a calendar event with time and URL so you never miss a Japanese booking drop.
  - 🚶 **Walk-in / Queue Estimator**: Arrival advice and queue tips for ramen, soba, and budget Michelin spots.
- **"Only Bookable Now" Toggle**: Instantly filters the map and list to show only restaurants that can be reserved for your specific trip dates!

### 5. 💰 Multi-Currency Pricing
- Lunch and Dinner course price ranges.
- Real-time conversion toggle: **JPY (¥)**, **USD ($)**, **EUR (€)**, **GBP (£)**.

### 6. 🗂️ View Modes
- **Split View**: Synchronized map on right, card feed on left.
- **Grid View**: Full-screen photo card browsing.
- **Map View**: Full-screen interactive map with overlay controls.
- **Comparison Table View**: Side-by-side data table comparing Michelin vs. Tabelog vs. Reddit vs. Price vs. Platform.

### 7. 🔖 Trip Itinerary & Export
- Save restaurants to your personal Tokyo trip shortlist.
- Export your itinerary directly to formatted **Markdown (.md)**, complete with Japanese addresses formatted for taxi drivers.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### Quick Start (Windows)
Double-click **`start.bat`** (or **`run.bat`**) in the project folder. This will:
1. Verify Node.js and dependencies (auto-running `npm install` if needed).
2. Launch the console with live file watching.
3. Automatically launch your default browser to `http://localhost:5173`.
4. Register any code changes made (by you or AI assistant) in real-time and automatically refresh the browser via Vite HMR.

### Manual Installation
```bash
# Clone the repository
git clone https://github.com/laufogh/tokyo-michelin.git
cd tokyo-michelin

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet + CartoDB tiles
- **Icons**: Lucide React
- **Data Source**: Michelin Guide Tokyo 2024/2025/2026, Tabelog Awards, Reddit r/finedining

---

## 📄 License
MIT License. Created for food travelers exploring Tokyo.
