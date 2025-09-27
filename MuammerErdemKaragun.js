
(() => {
    "use strict";

    const requestUrl = "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json";
    const locStr = { products: "eb_products_cache", cachedDate: "eb_products_cached_at", favProducts: "eb_favorites" };
    const mainTitle = "Beğenebileceğinizi düşündüklerimiz";
    const cardGap = 12;
    const cardMinWidth = 180;
    const minCols = 2, maxCols = 5;
    const orangeColorCode = "#ff6a00";
    const lightGreenColorCode = "#22c97a";

    const isHome = location.pathname === "/";
    if (!isHome) { console.log("wrong page"); alert("Wrong Page"); return; }

    const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    const read = (key, failValue = null) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : failValue; } catch { return failValue; } };
    const turkishLiraFormatter = number => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(number);
    const discountPercentage = (originalPrice, currentPrice) => (originalPrice > 0 && currentPrice < originalPrice) ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;
    const favSet = () => new Set((read(locStr.favProducts, []) || []).map(x => String(x)));
    const writeFavs = s => save(locStr.favProducts, Array.from(s));

    const product = p => ({
        id: String(p.id),
        brand: String(p.brand),
        title: String(p.name),
        url: String(p.url),
        image: String(p.img),
        price: Number(p.price),
        original_price: Number(p.original_price)
    });

    const fetchProducts = async () => {
        const response = await fetch(requestUrl, { method: "GET", credentials: "omit" });
        const raw = await response.json();
        const items = raw.map(product).filter(x => x.url && x.title);
        save(locStr.products, items); save(locStr.cachedDate, Date.now());
        return items;
    };

    const getProducts = async () => {
        const cached = read(locStr.products);
        if (Array.isArray(cached) && cached.length) return cached;
        return await fetchProducts();
    };

    const selectSlotContainer = () => {
        const slot = document.querySelector("cx-page-slot.Section2A");
        if (!slot) return null;

        let carousel = slot.querySelector("eb-product-carousel");
        if (!carousel) { carousel = document.createElement("eb-product-carousel"); slot.innerHTML = ""; slot.appendChild(carousel); }

        let banner = carousel.querySelector(".banner");
        if (!banner) { banner = document.createElement("div"); banner.className = "banner"; carousel.appendChild(banner); }

        let container = banner.querySelector(".container");
        if (!container) { container = document.createElement("div"); container.className = "container"; banner.appendChild(container); }

        container.innerHTML = "";// removing original cards for injection

        const header = document.createElement("eb-carousel-header");
        const titles = document.createElement("div"); titles.className = "banner__titles";
        const h2 = document.createElement("h2"); h2.textContent = mainTitle;
        titles.appendChild(h2); header.appendChild(titles); container.appendChild(header);

        const host = document.createElement("div"); host.className = "eb-carousel-host";
        container.appendChild(host);
        return host;
    };

    const injectCSS = () => {
        if (document.getElementById("eb-custom-style")) return;
        const css = `
.eb-carousel-host{position:relative; overflow:visible; --card-w:${cardMinWidth}px; --img-ratio:0.78; --arrow-out:56px;}

.ebc-track{display:flex; gap:${cardGap}px; overflow:auto; padding:6px 0 18px 0; scroll-behavior:smooth; -webkit-overflow-scrolling:touch; scroll-snap-type:x proximity; scroll-padding:12px;}
.ebc-track::-webkit-scrollbar{height:8px}
.ebc-track::-webkit-scrollbar-thumb{background:#e6eef7;border-radius:8px}
/* Card */
.ebc-card{position:relative; flex:0 0 var(--card-w); background:#fff; border:1px solid #eef2f7; border-radius:16px; padding:10px; box-shadow:0 2px 6px rgba(0,0,0,.04); scroll-snap-align:start}
.ebc-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)}
/* Image */
.ebc-img{width:100%; height:calc(var(--card-w)*var(--img-ratio)); display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:12px; background:#fff}
.ebc-img img{max-width:100%; max-height:100%; object-fit:contain; background:#fff}

.ebc-brand{margin-top:6px; font-size:11px; color:#8a97a8}
.ebc-title{margin-top:6px; font-size:13px; line-height:1.3; height:34px; overflow:hidden; color:#1b2a3a}
/* Price */
.ebc-price{margin-top:8px; display:flex; align-items:baseline; gap:8px; flex-wrap:wrap}
.ebc-price .cur{font-weight:800; font-size:16px; color:#000}
.ebc-price .cur.disc{color:${lightGreenColorCode}}
.ebc-price .old{font-size:12px; color:#8a97a8; text-decoration:line-through}

.ebc-badge{position:absolute; left:10px; top:10px; background:#ffefe3; color:${orangeColorCode}; font-weight:800; font-size:12px; padding:4px 8px; border-radius:999px}
/* Hearth */
.ebc-heart{position:absolute; right:10px; top:10px; background:transparent !important; border:none !important; box-shadow:none !important; width:auto; height:auto; padding:0; cursor:pointer; user-select:none; color:${orangeColorCode}; font-size:24px; line-height:1; z-index:5; pointer-events:auto;}
.ebc-heart.inactive{color:#d0d7e2}
.ebc-heart:hover{transform:scale(1.06)}
.ebc-heart::after{content:""; position:absolute; inset:-6px}

.ebc-link{position:absolute; inset:0; z-index:0}
/* SideArrows */
.ebc-arrow{position:absolute; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:50%; border:2px solid #ffd7bf; background:#fff; color:${orangeColorCode}; box-shadow:0 2px 8px rgba(9,43,84,.15); display:grid; place-items:center; cursor:pointer; z-index:3; transition:border-color .15s ease, box-shadow .15s ease, background .15s ease, color .15s ease;}
.ebc-arrow svg{width:22px; height:22px; display:block}
.ebc-arrow svg path{stroke:currentColor}
.ebc-arrow:hover{background:#fff; border-color:${orangeColorCode}; color:${orangeColorCode}; box-shadow:0 0 0 3px rgba(255,106,0,.15);}
.ebc-arrow:focus-visible{outline:2px solid ${orangeColorCode}; outline-offset:2px;}
.ebc-arrow.ebc-prev{left: calc(-1 * var(--arrow-out));}
.ebc-arrow.ebc-next{right: calc(-1 * var(--arrow-out));}
@media (max-width:1024px){.eb-carousel-host{--arrow-out:16px}}
@media (max-width:768px){.ebc-arrow{width:38px; height:38px}.ebc-arrow svg{width:20px; height:20px}}
`.trim();
        const style = document.createElement("style");
        style.id = "eb-custom-style"; style.textContent = css;
        document.head.appendChild(style);
    };
    
    const chevronLeft = () => `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M14 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`.trim();

    const chevronRight = () => `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M10 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`.trim();
    //calculating Column count
    function computeCols(w) {
        const rough = Math.max(1, Math.round(w / (cardMinWidth + cardGap)));
        return Math.max(minCols, Math.min(maxCols, rough));
    }
    function applyLayout(host, track) {
        const W = host.clientWidth || 0; 
        const cols = computeCols(W);
        const cardWidth = Math.floor((W - cardGap * (cols - 1)) / cols); // fitting card
        host.style.setProperty("--card-w", `${cardWidth}px`);
        track.dataset.cols = String(cols);
    }

    const buildCard = (p, favs) => {
        const id = String(p.id);
        const card = document.createElement("div");
        card.className = "ebc-card";
        card.dataset.id = id;

        //if the product has discount 
        const discount = discountPercentage(p.original_price, p.price);
        if (discount > 0) {
            const b = document.createElement("div"); b.className = "ebc-badge"; b.textContent = `%${discount} İndirim`; card.appendChild(b);
        }

        // fav button event
        const isFav = favs.has(id);
        const heart = document.createElement("button");
        heart.className = "ebc-heart" + (isFav ? "" : " inactive");
        heart.textContent = isFav ? "♥" : "♡";
        heart.addEventListener("click", (e) => {
            const set = favSet();
            if (set.has(id)) { set.delete(id); heart.textContent = "♡"; heart.classList.add("inactive"); }
            else { set.add(id); heart.textContent = "♥"; heart.classList.remove("inactive"); }
            writeFavs(set);
        });
        card.appendChild(heart);

        const imgW = document.createElement("div"); imgW.className = "ebc-img";
        const img = document.createElement("img"); img.loading = "lazy"; img.alt = p.title; img.src = p.image || "";
        imgW.appendChild(img); card.appendChild(imgW);

        const brand = document.createElement("div"); brand.className = "ebc-brand"; brand.textContent = p.brand || "";
        const title = document.createElement("div"); title.className = "ebc-title"; title.textContent = p.title;
        card.append(brand, title);

        const price = document.createElement("div"); price.className = "ebc-price";
        const cur = document.createElement("div"); cur.className = "cur"; cur.textContent = turkishLiraFormatter(p.price);
        const isDiscount = p.original_price && p.original_price > p.price;
        if (isDiscount) cur.classList.add("disc");
        price.appendChild(cur);
        if (isDiscount) {
            const old = document.createElement("div"); old.className = "old"; old.textContent = turkishLiraFormatter(p.original_price);
            price.appendChild(old);
        }
        card.appendChild(price);

        const a = document.createElement("a"); a.href = p.url; a.target = "_blank"; a.rel = "noopener"; a.className = "ebc-link";
        card.appendChild(a);
        return card;
    };

    const buildUI = (products) => {
        injectCSS();
        const host = selectSlotContainer();
        const track = document.createElement("div"); track.className = "ebc-track";
        host.innerHTML = ""; host.appendChild(track);

        const favs = favSet();
        products.forEach(p => track.appendChild(buildCard(p, favs)));

        const prev = document.createElement("button"); prev.className = "ebc-arrow ebc-prev"; prev.innerHTML = chevronLeft();
        const next = document.createElement("button"); next.className = "ebc-arrow ebc-next"; next.innerHTML = chevronRight();
        host.append(prev, next);

        const onResize = () => applyLayout(host, track);
        onResize();
        window.addEventListener("resize", onResize);

        const cardWidth = () => parseFloat(getComputedStyle(host).getPropertyValue("--card-w")) || cardMinWidth;
        const colsPerView = () => Number(track.dataset.cols || minCols);
        const scrollCards = (n) => {
            const step = (cardWidth() + cardGap) * colsPerView();
            track.scrollBy({ left: n * step, behavior: "smooth" });
        };
        prev.addEventListener("click", () => scrollCards(-1));
        next.addEventListener("click", () => scrollCards(1));

        //card drag scroll

        let isDragging = false;
        let dragStartX = 0;
        let startScrollLeft = 0;

        const dragStart = x => {
            isDragging = true;
            dragStartX = x;
            startScrollLeft = track.scrollLeft;
        };

        const dragMove = x => {
            if (!isDragging) return;
            track.scrollLeft = startScrollLeft - (x - dragStartX);
        };

        const dragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            const step = cardWidth() + cardGap;
            const target = Math.round(track.scrollLeft / step) * step;
            track.scrollTo({ left: target, behavior: "smooth" });
        };

        track.addEventListener("mousedown", e => dragStart(e.pageX));
        window.addEventListener("mousemove", e => dragMove(e.pageX));
        window.addEventListener("mouseup", dragEnd);
        track.addEventListener("touchstart", e => dragStart(e.touches[0].pageX), { passive: true });
        track.addEventListener("touchmove", e => dragMove(e.touches[0].pageX), { passive: true });
        track.addEventListener("touchend", dragEnd);
    };

    (async () => {
        try {
            const products = await getProducts(); //  I assume that the response will always contain row.
            buildUI(products);
        } catch (e) { console.error(e); }
    })();
})();