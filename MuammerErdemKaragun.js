//page
const getRequestUrl = "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json";
const localStorage = {
    Products: "ebebek_products_cache",
    CachedDate: "ebebek_products_cached_date",
    Favs: "ebebek_favorites"
};
const title = "Beðenebileceðinizi Düþündüklerimiz";
const isHome = location.pathname === '/';
if (!isHome) { console.log("Wrong Page"); return; }

//fonctions,calculations

const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const read = (key, failValue = null) => {
    try {
        const value = localStorage.getItem(key);
        return value ? parse(value) : failValue;
    } catch {
        return failValue;
    }
};
const turkishLiraFormatter = number => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(number);
cosnt discountPercentage = (o_price, c_price) => (o_price > 0 && c_price < o_price) ? Math.round((1 - c / o) * 100) : 0;
const favProdSet = () => new Set((read(localStorage.Favs, []) || []).map(id => String(id)));
const writeFavProdSet = products => save(localStorage.Favs, Array.from(products));

const product = p => ({ // I assume that the attributes of the object coming from the GET request are not null. Thats why i dont add default values.
    id: String(p.id),
    brand: String(p.brand),
    name: String(p.name),
    url: String(p.url),
    img: String(p.image),
    price: String(p.price),
    original_price: String(p.original_price)
});

const fetchProducts = async () => {
    const response = await fetch(getRequestUrl, { method: "GET", crendentials: "omit" });
    if (!response.ok) throw new Error('Fetch failed ${response.status}');
    const raw = await response.json();
    const items = raw.map(product);
    save(localStorage.Products, items);
    save(localStorage.CachedDate, Date.now());
    return items;
}
// if local storage contains cached items, get them
const getProductsFromLocale = async () => {
    const cached = read(localStorage.Products);
    if (Array.isArray(cached) && cached.length) return cached;
    return await fetchProducts();
}
//HTML CSS 




