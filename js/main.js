const LIST_URL = "./games/oyun-listesi.json";

const gamesGrid = document.getElementById("gamesGrid");
const searchInput = document.getElementById("searchInput");
const loader = document.getElementById("loader");
const emptyState = document.getElementById("emptyState");

const slideLeft = document.getElementById("slideLeft");
const slideRight = document.getElementById("slideRight");
const categorySlider = document.getElementById("categorySlider");
const categoryChips = document.querySelectorAll(".category-chip");

/* Detail Overlay Elements */
const detailOverlay = document.getElementById("gameDetailOverlay");
const detailContent = document.getElementById("detailContentBlock");
const closeDetailBtn = document.getElementById("closeDetailBtn");
const detailIcon = document.getElementById("detailIcon");
const detailTitle = document.getElementById("detailTitle");
const detailCategory = document.getElementById("detailCategory");
const detailPlayBtn = document.getElementById("detailPlayBtn");
const detailImg1 = document.getElementById("detailImg1");
const detailImg2 = document.getElementById("detailImg2");
const detailDesc = document.getElementById("detailDesc");
const detailHowTo = document.getElementById("detailHowTo");

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

/* ── Oyun Açıklamaları & Nasıl Oynanır ── */
const GAME_META = {
    "neon-kacis": {
        desc: "Neon ışıklarla kaplı bir koridorda sonsuz bir kaçış! Engellerin arasından geç, reflekslerini test et ve en yüksek skoru kır. Hız arttıkça neon renkler değişir, ritim yükselir.",
        howTo: "Yön tuşları veya ekrana dokunarak şeritler arasında geçiş yap. Engellere çarpmadan mümkün olduğunca uzağa koş. Hız zamanla otomatik artar."
    },
    "kripto-cokus": {
        desc: "Kripto piyasaları çökerken stratejik al-sat yaparak hayatta kal! Grafikleri oku, dalgalanmaları tahmin et ve portföyünü korumaya çalış.",
        howTo: "AL ve SAT butonlarıyla coin'leri zamanında takas et. Piyasa ani darbeler alabilir, dikkatli ol. Portföy değerini sıfırın üzerinde tut."
    },
    "siber-kalkan": {
        desc: "Siber saldırıları savuşturarak sunucunu koru! Her dalga daha karmaşık saldırılar getirir. Güvenlik duvarını güçlendir ve virüsleri etkisiz hale getir.",
        howTo: "Fare veya parmağınla düşman paketlerini engelle. Kalkanı stratejik olarak konumlandır. Sunucu sağlığı biterse oyun biter."
    },
    "drone-kurye": {
        desc: "Drone'unla paketleri zamanında teslim et! Rüzgar, engeller ve yakıt yönetimi ile mücadele ederken teslimat rotanı optimize et.",
        howTo: "Yön tuşları veya dokunmatik joystick ile drone'u kontrol et. Paketleri al ve hedef noktalara bırak. Yakıta ve zamana dikkat et."
    },
    "yapay-zeka-isyani": {
        desc: "Yapay zeka kontrol dışına çıktı! Rogue AI birimlerini tespit edip etkisiz hale getir. Her seviyede AI daha akıllı ve tehlikeli hale gelir.",
        howTo: "Haritada gezen AI birimlerini tespit et ve sistemlerini hack'le. Zamanında müdahale etmezsen yayılırlar. Tüm birimleri saf dışı bırak."
    },
    "kutle-cekim": {
        desc: "Uzay boşluğunda çekim merkezleri oluşturarak gemiyi hedefe ulaştır! Gerçek fizik simülasyonu ile vektörel kuvvetleri kontrol et.",
        howTo: "Ekrana tıklayarak çekim noktaları oluştur. Gemi bu noktaların çekim kuvvetinden etkilenir. Engellere çarpmadan hedef bölgeye ulaştır."
    },
    "yorunge-sapmasi": {
        desc: "Gezegenler arası yörünge hesaplamaları yap! Uzay aracını doğru açı ve hızla fırlatarak hedef yörüngeye oturt. Her seviye yeni gezegen konfigürasyonları sunar.",
        howTo: "Fırlatma açısını ve gücünü ayarla, sonra ateşle. Gezegenlerin çekim kuvvetlerini hesaba kat. Hedef yörüngeye girdiğinde seviye tamamlanır."
    },
    "suru-zekasi": {
        desc: "Boid algoritması ile sürü davranışı simülasyonu! Kuşlar, balıklar veya drone sürülerini yönlendir. Doğadaki kolektif zekayı keşfet.",
        howTo: "Fare veya parmağınla sürüyü yönlendir. Hedef noktalara sürüyü götür. Ayrılma, hizalanma ve birleşme parametrelerini optimize et."
    },
    "neon-sovalye": {
        desc: "Neon zırhına bürünmüş bir şövalye olarak karanlık diyarlarda savaş! Kılıç komboları yap, düşmanları alt et ve labirentlerden geç.",
        howTo: "WASD ile hareket et, fare/dokunmatik ile saldır. Düşmanları yenip ilerlemeye devam et. Güç yükseltmelerini topla."
    },
    "hiper-suruklenme": {
        desc: "Yüksek hızda neon şehir sokaklarında sürüklenme yarışı! Drift yaparak turbo kazan, rakiplerini geride bırak. Adrenalin dolu bir yarış deneyimi.",
        howTo: "Yön tuşları ile dön, gaz ve fren ile hızı kontrol et. Virajlarda drift yaparak turbo birik. Birinci olmak için turboyu doğru zamanda kullan."
    },
    "siber-otoyol": {
        desc: "Dijital otoyolda veri paketlerini taşı! Trafik arasında manevra yap, virüslü araçlardan kaç ve verileri güvenli limana ulaştır.",
        howTo: "Sağ-sol tuşları ile şerit değiştir, yukarı ile hızlan. Kırmızı virüs araçlarından kaçın. Yeşil veri paketlerini topla."
    },
    "golge-suikastcisi": {
        desc: "Gölgelerde gizlenerek hedeflerini sessizce etkisiz hale getir! Düşman görüş konilerine yakalanma, arkadan yaklaş ve indirimi yap. Premium stealth deneyimi.",
        howTo: "WASD/Yön tuşları ile hareket et. Gölge bölgelerde daha hızlısın ve daha zor fark edilirsin. Düşmanın arkasına yaklaşıp Boşluk/E ile saldır."
    },
    "cekirdek-erimesi": {
        desc: "Nükleer reaktörün çekirdeği erime noktasına yaklaşıyor! Soğutma sistemlerini yönet, basınç vanalarını kontrol et ve felaketi engelle.",
        howTo: "Kontrol panelindeki düğmeleri kullanarak sıcaklık ve basıncı dengede tut. Kırmızı bölgeye girersen çekirdek erir. Zamana karşı yarış!"
    },
    "boyut-yolcusu": {
        desc: "Boyutlar arası geçiş yaparak bulmacaları çöz! Her boyutun kendine özgü fizik kuralları var. Doğru boyutta doğru hareketi yap.",
        howTo: "Boyut geçiş butonuna basarak alternatif boyuta atla. Her boyutta farklı engeller ve yollar var. İkisini kombine ederek çıkışa ulaş."
    },
    "piksel-sorfu": {
        desc: "Piksel dalgaları üzerinde sörf yap! Retro grafiklerin modern gameplayle buluştuğu bu arcade oyunda en uzun mesafeyi kat et.",
        howTo: "Yukarı/aşağı tuşları ile dalgada konumlan. Dalgaların tepesinde kalmaya çalış. Engelleri atla ve güçlendirmeleri topla."
    },
    "glitch-avcisi": {
        desc: "Dijital dünyada glitch'ler ortaya çıkıyor! Bu bozuklukları tespit et ve düzelt. Her glitch farklı bir meydan okuma sunar.",
        howTo: "Ekranda beliren glitch noktalarına tıkla/dokun. Zaman dolmadan tüm glitch'leri temizle. Seviye ilerledikçe glitch'ler daha hızlı ve karmaşık olur."
    },
    "zaman-catlagi": {
        desc: "Zaman akışında çatlaklar oluştu! Geçmiş ve gelecek arasında sıçrayarak bulmacaları çöz. Paradoks yaratmadan doğru zaman çizgisini onar.",
        howTo: "Zaman atlama butonuyla geçmiş ve gelecek arasında geçiş yap. Her zaman diliminde farklı engeller var. Doğru sırayla hareket ederek çıkışı bul."
    },
    "lazer-agi": {
        desc: "Lazer ışınlarından oluşan bir ağın içinden geç! Aynaları döndürerek lazer yolunu değiştir ve sensörleri aktive et. Işık fiziği bulmacası.",
        howTo: "Aynaları tıklayarak/dokunarak döndür. Lazer ışınını kaynaktan hedefe ulaştır. Tüm sensörleri aynı anda aydınlat."
    },
    "viral-dongu": {
        desc: "Bir virüsün yayılma döngüsünü kontrol et! Hücreleri enfekte ederken bağışıklık sisteminden kaç. Strateji ve zamanlama her şey.",
        howTo: "Hedef hücrelere tıklayarak virüsü yay. Beyaz kan hücreleri virüsü avlıyor, onlardan kaçın. Tüm hücreleri enfekte et."
    },
    "hafiza-korsani": {
        desc: "Bellek bloklarını eşleyerek sistemin hafızasını hack'le! Klasik hafıza oyununun siber-punk temalı modern versiyonu.",
        howTo: "Kartlara tıklayarak çevir. Eşleşen çiftleri bul. Minimum hamle sayısıyla tüm çiftleri eşleştirmeye çalış."
    },
    "itki-vektoru": {
        desc: "Roketini güvenle platforma indir! Gerçekçi fizik ile yerçekimi, itki vektörü ve yakıt yönetimini dengede tut. Bir Lunar Lander deneyimi.",
        howTo: "W/Yukarı ile itki ver, A/D ile roketi döndür. Dikey ve yatay hızı düşük tutarak platforma yumuşak bir iniş yap. Yakıt sınırlı!"
    },
    "kisa-devre": {
        desc: "PCB üzerindeki pinleri doğru kablolarla bağla! Flow Free tarzı bulmaca mekaniği ile devreyi tamamla. Tüm ızgarayı doldurmalısın.",
        howTo: "Aynı renkteki iki pini parmağınla veya fareyle birbirine bağla. Yollar kesişemez. Tüm pinler bağlanmalı ve ızgaranın tamamı dolmalı."
    },
    "taktik-yorunge": {
        desc: "İki kişilik topçu savaşı! Açıyı ve gücü ayarlayıp rakibinin tankını vur. Rüzgar her turda değişir, kraterler oluşur.",
        howTo: "Oyuncu 1: WASD + Boşluk | Oyuncu 2: Yön tuşları + Enter. Açıyı ve atış gücünü ayarlayıp ateş et. Rüzgarı hesaba kat!"
    },
    "frekans-avcisi": {
        desc: "Hedef sinyalin frekansını ve genliğini eşleştir! Osiloskop ekranında dalgaları üst üste getirerek rezonansa ulaş. Ses ve görsel harmoni.",
        howTo: "W/S ile genliği, A/D ile frekansı ayarla. Yeşil dalganı mavi hedef dalgayla eşleştir. %95+ eşleşmede rezonans çubuğu dolmaya başlar."
    },
    "tartarus-bolum-1": {
        desc: "Proje TARTARUS'un ilk bölümü: Kayıp Kapı. Gizemli bir uzay istasyonunda uyanıyorsun. Terminal ekranlarından ipuçlarını takip et ve enerji şebekesini onararak kapıyı aç.",
        howTo: "Terminal ekranındaki ipuçlarını oku. Enerji düğümlerini doğru sırayla bağlayarak güç yönlendirme bulmacasını çöz."
    },
    "tartarus-bolum-2": {
        desc: "TARTARUS Bölüm 2: Derin Karanlık. İstasyonun derinliklerinde düşman varlıklar dolaşıyor. Radarını kullanarak gizlice ilerle ve hayatta kal.",
        howTo: "Radar ekranına bakarak düşmanların konumunu tespit et. Görüş alanlarına girmeden sessizce ilerle. Hedef noktaya ulaş."
    },
    "tartarus-bolum-3": {
        desc: "TARTARUS Finali: Sistem Çöküşü. İstasyonun ana AI'ı kontrolü ele geçirdi! Son boss ile yüzleş ve sistemi kapat. Bullet Hell tarzı hayatta kalma savaşı.",
        howTo: "Joystick veya WASD ile hareket et. Düşman mermilerinden (bullet hell) kaçınarak hayatta kal. Boss'un zayıf noktalarını vur."
    },
    "void-runner": {
        desc: "Boşlukta sonsuz bir koşu! Platformlar arasında atlayarak ilerle. Her atlamada yerçekimi değişebilir. Minimalist ama bağımlılık yapıcı.",
        howTo: "Boşluk tuşu veya ekrana dokunarak atla. Platformları kaçırma! Bazı platformlar hareket eder veya kaybolur."
    },
    "yercekimi-darbesi": {
        desc: "Yerçekimini silah olarak kullan! Nesneleri çekerek ve iterek düşmanları alt et. Fizik tabanlı aksiyon ve bulmaca karışımı.",
        howTo: "Fare/parmakla nesneleri çek ve fırlat. Düşmanlara isabet ettir veya engelleri yıkarak yol aç."
    },
    "sinyal-kulesi-1-uyanis": {
        desc: "Sinyal Kulesi serisi başlıyor! Gizemli sinyaller alan bir kuledeki teknisyen olarak uyanıyorsun. Sinyalleri çöz ve gerçeği keşfet.",
        howTo: "Terminal bulmacalarını çöz. Sinyal frekanslarını ayarla ve mesajları deşifre et."
    },
    "sinyal-kulesi-2-kacis": {
        desc: "Sinyal Kulesi II: Kuleden kaçış zamanı! Tehlike yaklaşıyor, sinyaller seni yönlendiriyor. Hızlı reflekslerle engelleri aş.",
        howTo: "Platform ve refleks mekanikleriyle engelleri aş. Sinyallerin yönlendirmelerine kulak ver."
    },
    "sinyal-kulesi-3-son-yayin": {
        desc: "Sinyal Kulesi Finali: Son Yayın. Kuleye geri dönüp son mesajı göndermelisin. Tüm öğrendiklerini kullanarak final mücadelesini ver.",
        howTo: "Önceki bölümlerdeki yeteneklerin hepsini kullan. Boss mekaniklerini öğren ve son yayını gerçekleştir."
    }
};

const DEFAULT_DESC = "Heyecan dolu bir oyun deneyimi seni bekliyor! Reflekslerini ve stratejini test et.";
const DEFAULT_HOWTO = "Klavye (WASD / Yön tuşları) veya dokunmatik ekran kontrolleri ile oyna. Detaylar oyun içinde açıklanır.";

/* ══════════════════════════════════════
   Başlatma
   ══════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
    init();
});

async function init() {
    bindEvents();
    await loadGames();
    handleHash(); // sayfa ilk yüklendiğinde hash kontrolü
}

function bindEvents() {
    /* Arama */
    if (searchInput) {
        searchInput.addEventListener("input", () => { applyFilters(); });
    }

    /* Kategori kaydırma butonları */
    if (slideLeft && slideRight && categorySlider) {
        slideLeft.addEventListener("click", () => { categorySlider.scrollBy({ left: -200, behavior: 'smooth' }); });
        slideRight.addEventListener("click", () => { categorySlider.scrollBy({ left: 200, behavior: 'smooth' }); });
    }

    /* Kategori çipleri */
    categoryChips.forEach(chip => {
        chip.addEventListener("click", (e) => {
            categoryChips.forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
            currentCategory = e.target.getAttribute("data-filter");
            applyFilters();
        });
    });

    /* Hash routing */
    window.addEventListener("hashchange", handleHash);

    /* Overlay kapatma */
    if (closeDetailBtn) closeDetailBtn.addEventListener("click", closeDetail);
    if (detailOverlay) {
        detailOverlay.addEventListener("click", (e) => {
            if (e.target === detailOverlay) closeDetail();
        });
    }

    /* ESC ile kapatma */
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDetail();
    });

    /* Swipe-down kapatma (drag indicator + touch) */
    setupSwipeDown();
}

/* ── Filtreleme ── */

function applyFilters() {
    let filtered = allGames;

    if (currentCategory !== "all") {
        filtered = filtered.filter(game => {
            const cat = (game.category || "").toLocaleLowerCase("tr-TR");
            return cat.includes(currentCategory);
        });
    }

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

/* ── Oyun Verisi Yükleme ── */

async function loadGames() {
    try {
        const response = await fetch(`${LIST_URL}?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Veri çekilemedi.");

        let rawData = await response.json();
        let rawGames = Array.isArray(rawData) ? rawData : (rawData.games || []);

        allGames = rawGames.map(game => {
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

/* ── Oyun Kartlarını Çizme ── */

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
        card.href = `#/oyun/${game.id}`;        // SPA hash route
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

/* ══════════════════════════════════════
   Hash Routing – SPA Detay Sayfası
   ══════════════════════════════════════ */

function handleHash() {
    const hash = location.hash; // örn: #/oyun/kutle-cekim

    if (hash.startsWith("#/oyun/")) {
        const gameId = hash.replace("#/oyun/", "");
        const game = allGames.find(g => g.id === gameId);
        if (game) {
            openDetail(game);
        }
    } else {
        // hash boş veya farklı → overlay kapat
        if (detailOverlay && detailOverlay.classList.contains("open")) {
            detailOverlay.classList.remove("open");
            document.body.classList.remove("overlay-open");
        }
    }
}

function openDetail(game) {
    if (!detailOverlay) return;

    const meta = GAME_META[game.id] || {};
    const color = getCategoryColor(game.category);
    const gameUrl = game.url ? game.url : `./games/${game.id}/game.html`;

    /* Başlık & Kategori */
    detailTitle.textContent = game.title;
    detailCategory.textContent = game.category;
    detailCategory.style.background = color.bg;
    detailCategory.style.border = `1px solid ${color.border}`;
    detailCategory.style.color = color.text;

    /* İkon */
    detailIcon.src = game.image;

    /* Play butonu */
    detailPlayBtn.href = gameUrl;

    /* Galeri görselleri - farklı seed'ler */
    detailImg1.src = `https://picsum.photos/seed/${game.id}-ss1/800/450`;
    detailImg2.src = `https://picsum.photos/seed/${game.id}-ss2/800/450`;

    /* Açıklama & Nasıl Oynanır */
    detailDesc.textContent = meta.desc || DEFAULT_DESC;
    detailHowTo.textContent = meta.howTo || DEFAULT_HOWTO;

    /* Overlay aç */
    detailOverlay.classList.add("open");
    document.body.classList.add("overlay-open");

    /* İçerik scroll'unu başa al */
    detailContent.scrollTop = 0;
}

function closeDetail() {
    if (!detailOverlay) return;
    detailOverlay.classList.remove("open");
    document.body.classList.remove("overlay-open");

    // Hash'i temizle (sayfa yenilenmez)
    if (location.hash.startsWith("#/oyun/")) {
        history.pushState(null, "", location.pathname);
    }
}

/* ── Swipe-Down Kapatma ── */

function setupSwipeDown() {
    if (!detailContent) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    detailContent.addEventListener("touchstart", (e) => {
        // Sadece en üstte scroll konumundayken swipe kabul et
        if (detailContent.scrollTop > 5) return;
        startY = e.touches[0].clientY;
        isDragging = true;
        detailContent.style.transition = "none";
    }, { passive: true });

    detailContent.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 0) {
            // Aşağı sürükleniyor – paneli aşağı kaydır
            detailContent.style.transform = `translateY(${diff}px)`;
        }
    }, { passive: true });

    detailContent.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;
        const diff = currentY - startY;

        detailContent.style.transition = "transform 0.4s cubic-bezier(.32,.72,.24,1.02)";

        if (diff > 120) {
            // Yeterli mesafe sürüklendi → kapat
            closeDetail();
        }
        // Her durumda pozisyonu sıfırla (CSS transition ile)
        detailContent.style.transform = "";
    }, { passive: true });
}