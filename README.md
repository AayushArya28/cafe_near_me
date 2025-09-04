# ☕ Cafe Finder

A React + Google Maps project that helps users **find cafes near them**, filter by distance, view ratings, and get directions with an integrated route display.

---

## 🚀 Features
- 🔍 **Search Cafes Near Me** – Quickly find cafes using Google Places API.
- 📍 **Use My Location** – Center the map on your current location.
- ⭐ **Rating Display** – Cafes show star ratings with a smooth rating bar.
- 📏 **Distance Filter** – Filter cafes based on selected distance range.
- 🗺 **Open in Google Maps** – Direct link to view a cafe in Google Maps.
- 🛣 **Show Route** – See the route from your location to the selected cafe using Google Directions API.
- 📞 **Contact Info** – Phone number and website links (if available).

---

## 🛠 Tech Stack
- **Frontend:** React, Vite, TailwindCSS
- **Maps:** @react-google-maps/api
- **Styling:** TailwindCSS
- **Routing & Distance:** Google Directions API

---

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cafe-finder.git
   cd cafe-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add your **Google Maps API key**:
     ```env
     VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🔑 Google API Setup
Make sure you enable the following APIs for your key in [Google Cloud Console](https://console.cloud.google.com/):
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Directions API

Also, restrict your key to your domain (for production).

---

## 📂 Project Structure
```
├── src
│   ├── components
│   │   ├── MapContainer.jsx   # Main map logic
│   │   ├── RatingStars.jsx    # Star rating component
│   │   └── SearchBar.jsx      # Search and distance filter
│   ├── App.jsx
│   └── main.jsx
├── public
└── README.md
```

---

## 🎯 Usage
1. Click **Find Cafes Near Me** to load cafes around your location.
2. Use **Use My Location** to recenter the map.
3. Select a cafe → see **details, rating, contact info**.
4. Click **Show Route** → to display directions on the map.
5. Or open in **Google Maps** for full navigation.

---

## 📸 Screenshots
<img src="src\assets\ss1.png" width=330px>
<img src="src\assets\ss2.png" width=330px>
---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 💡 Future Improvements
- Add cafe photos carousel
- Add user reviews
- Add multiple category filters (restaurants, bars, etc.)
- Save favorite cafes

