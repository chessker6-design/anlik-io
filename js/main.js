const LIST_URL = "./games/oyun-listesi.json";

const gamesGrid = document.getElementById("gamesGrid");
const searchInput = document.getElementById("searchInput");
const loader = document.getElementById("loader");
const emptyState = document.getElementById("emptyState");

const slideLeft = document.getElementById("slideLeft");
const slideRight = document.getElementById("slideRight");
const categorySlider = document.getElementById("categorySlider");
const categoryChips = document.querySelectorAll(".category-chip");

let allGames = [];
let currentCategory = "all";

/* ── Kategori → Renk Eşleştirmesi ── */
const CATEGORY_COLORS = {
    "aksiyon":   { bg: "rgba(239, 68, 68, 0.25)",  border: "rgba(239, 68, 68, 0.5)",  text: "#fca5a5" },
    "zeka":      { bg: "rgba(168, 85, 247, 0.25)", border: "rgba(168, 85, 247, 0.5)", text: "#d8b4fe" },
    "arcade":    { bg: "rgba(34, 211, 238, 0.25)", border: "rgba(34, 211, 238, 0.5)", text: "#a5f3fc" },
    "yarış":     { bg: "rgba(251, 191, 36, 0.25)", border: "rgba(251, 191, 36, 0.5)", text: "#fde68a" },
    "strateji":  { bg: "rgba(52, 211, 153, 0.25)", border: "rgba(52, 211, 153, 0.5)", text: "#a7f3d0" },
    "macera":    { bg: "rgba(96, 165, 250, 0.25)", border: "rgba(96, 165, 250, 0.5)", text: "#bfdbfe" },
    "spor":      { bg: "rgba(251, 146, 60, 0.25)", border: "rgba(251, 146, 60, 0.5)", text: "#fed7aa" },
    "rpg":       { bg: "rgba(232, 121, 249, 0.25)",border: "rgba(232, 121, 249, 0.5)",text: "#f0abfc" },
    "refleks":   { bg: "rgba(250, 204, 21, 0.25)", border: "rgba(250, 204, 21, 0.5)", text: "#fef08a" },
    "hayatta kalma": { bg: "rgba(74, 222, 128, 0.25)", border: "rgba(74, 222, 128, 0.5)", text: "#bbf7d0" },
    "fizik":     { bg: "rgba(56, 189, 248, 0.25)", border: "rgba(56, 189, 248, 0.5)", text: "#bae6fd" },
};

const DEFAULT_COLOR = { bg: "rgba(255,255,255,0.1)", border: "transparent", text: "#aaaaaa" };

function getCategoryColor(category) {
    const key = (category || "").toLocaleLowerCase("tr-TR").trim();
    return CATEGORY_COLORS[key] || DEFAULT_COLOR;
}

document.addEventListener("DOMContentLoaded", () => {
    init();
});

async function init() {
    bindEvents();
    await loadGames();
}

function bindEvents() {
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            applyFilters();
        });
    }

    if (slideLeft && slideRight && categorySlider) {
        slideLeft.addEventListener("click", () => {
            categorySlider.scrollBy({ left: -200, behavior: 'smooth' });
        });
        slideRight.addEventListener("click", () => {
            categorySlider.scrollBy({ left: 200, behavior: 'smooth' });
        });
    }

    // Kategorilere tıklama filtresi
    categoryChips.forEach(chip => {
        chip.addEventListener("click", (e) => {
            categoryChips.forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
            currentCategory = e.target.getAttribute("data-filter");
            applyFilters();
        });
    });
}

function applyFilters() {
    let filtered = allGames;
    
    // 1) Kategori Filtresi
    if (currentCategory !== "all") {
        filtered = filtered.filter(game => {
            const cat = (game.category || "").toLocaleLowerCase("tr-TR");
            return cat.includes(currentCategory);
        });
    }

    // 2) Arama Filtresi
    if (searchInput) {
        const query = searchInput.value.trim().toLocaleLowerCase("tr-TR");
        if (query) {
            filtered = filtered.filter(game => {
                const haystack = `${game.title} ${game.category}`.toLocaleLowerCase("tr-TR");
                return haystack.includes(query);
            });
        }
    }

    renderGames(filtered);
}

async function loadGames() {
    try {
        const response = await fetch(`${LIST_URL}?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Veri çekilemedi.");
        
        let rawData = await response.json();
        
        let rawGames = Array.isArray(rawData) ? rawData : (rawData.games || []);
        
        allGames = rawGames.map(game => {
            // Hem Türkçe hem İngilizce anahtar desteği
            const id = game.id || game.slug || Math.random().toString(36).substring(7);
            return {
                id: id,
                title: game.title || game.isim || "Bilinmeyen Oyun",
                category: game.category || game.kategori || "Genel",
                image: game.image || game.resim || game.cover || `https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=500&fit=crop&q=80`,
                url: game.url || null
            };
        });

        applyFilters();
    } catch (error) {
        console.error("Oyunlar yüklenemedi:", error);
        loader.classList.add("hidden");
        emptyState.classList.remove("hidden");
        emptyState.querySelector("h3").textContent = "Hata Oluştu";
        emptyState.querySelector("p").textContent = "Oyun listesi sunucudan alınamadı.";
    }
}

function renderGames(games) {
    loader.classList.add("hidden");
    gamesGrid.innerHTML = "";

    if (!games.length) {
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    const fragment = document.createDocumentFragment();

    games.forEach((game, index) => {
        const color = getCategoryColor(game.category);
        
        const card = document.createElement("a");
        // Detay sayfasına yönlendir
        card.href = `detail.html?id=${encodeURIComponent(game.id)}`;
        card.className = "big-game-card";
        card.style.animationDelay = `${index * 60}ms`;
        
        card.innerHTML = `
            <img src="${game.image}" alt="${game.title}" loading="lazy">
            <div class="game-info">
                <div class="game-category" style="background:${color.bg}; border: 1px solid ${color.border}; color:${color.text};">${game.category}</div>
                <div class="game-title">${game.title}</div>
            </div>
        `;
        
        fragment.appendChild(card);
    });

    gamesGrid.appendChild(fragment);
}