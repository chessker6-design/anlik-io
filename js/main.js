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
            // Aktif sınıfı güncelle
            categoryChips.forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
            
            // Kategori değerini al
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
            // Gerçekçi Placeholder Görsel Desteği (picsum.photos)
            const seed = game.id || game.slug || Math.random().toString(36).substring(7);
            const fallbackImage = `https://picsum.photos/seed/${seed}/400/500`;
            return {
                id: game.id || game.slug || "unknown",
                title: game.title || "İsimsiz Oyun",
                category: game.category || "Oyun",
                image: game.image || game.cover || fallbackImage,
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

    games.forEach(game => {
        const gameUrl = `./games/${game.id}/game.html`;
        
        const card = document.createElement("a");
        card.href = gameUrl;
        card.className = "big-game-card";
        
        card.innerHTML = `
            <img src="${game.image}" alt="${game.title}" loading="lazy">
            <div class="game-info">
                <div class="game-category">${game.category}</div>
                <div class="game-title">${game.title}</div>
            </div>
        `;
        
        fragment.appendChild(card);
    });

    gamesGrid.appendChild(fragment);
}