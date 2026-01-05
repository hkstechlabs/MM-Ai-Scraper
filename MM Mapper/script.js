const apiUrl = 'https://portal.mobilemonster.com.au/version-live/api/1.1/wf/types_vendor_json';
const typesContainer = document.getElementById('types-container');
const brandsContainer = document.getElementById('brands-container');

// Brand logos mapping
const brandLogos = {
  "Apple": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  "Samsung": "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
  "Google": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  "Motorola": "https://upload.wikimedia.org/wikipedia/commons/2/2a/Motorola_logo.svg",
  "Huawei": "https://upload.wikimedia.org/wikipedia/commons/9/9f/Huawei_Logo.svg",
  "HTC": "https://upload.wikimedia.org/wikipedia/commons/4/4a/HTC_logo.svg",
  "LG": "https://upload.wikimedia.org/wikipedia/commons/2/2e/LG_logo_%282015%29.svg",
  "OnePlus": "https://upload.wikimedia.org/wikipedia/commons/2/29/OnePlus_Logo.svg",
  "Oppo": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Oppo_logo.svg",
  "Sony": "https://upload.wikimedia.org/wikipedia/commons/2/23/Sony_Logo.svg",
  "Asus": "https://upload.wikimedia.org/wikipedia/commons/5/51/ASUS_Logo.svg",
  "BlackBerry": "https://upload.wikimedia.org/wikipedia/commons/2/2b/BlackBerry_logo.svg",
  "Microsoft": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
  "Nokia": "https://upload.wikimedia.org/wikipedia/commons/2/27/Nokia_wordmark.svg",
  "Nintendo": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.png",
  "Nothing": "https://upload.wikimedia.org/wikipedia/commons/3/3b/Nothing_logo.svg",
  "Xiaomi": "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg",
  "Segway Electric Scooter": "https://upload.wikimedia.org/wikipedia/commons/8/89/Segway_Logo.svg"
};


let types = [];
let brands = [];

// Load types & brands
async function loadData() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Failed to fetch data');

    const data = await res.json();
    types = data.Type;
    brands = data.Brand;

    renderTypes();
    initView(); // check URL on load
  } catch (err) {
    typesContainer.innerHTML = '<p>Failed to load data.</p>';
  }
}

// Render types page
function renderTypes() {
  typesContainer.innerHTML = '';
  types.forEach(type => {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = type;
    card.onclick = () => showBrands(type);
    typesContainer.appendChild(card);
  });
}

// Render brands page
function showBrands(type) {
  // Update URL
  window.history.pushState({ type }, '', `?type=${encodeURIComponent(type)}`);

  // Render brands
  brandsContainer.innerHTML = `<button id="back-btn">← Back</button><h2>Brands for ${type}</h2>`;

  brands.forEach((brand, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    // Logo placeholder (first letter)
    const logoPlaceholder = document.createElement('div');
    logoPlaceholder.className = 'card-icon';
    logoPlaceholder.textContent = brand[0]; // first letter as placeholder

    // Alternate colors for logos (purple & green)
    if (index % 2 === 0) {
      logoPlaceholder.style.background = 'rgba(115,28,175,0.1)'; // purple background
      logoPlaceholder.style.color = '#731caf';
    } else {
      logoPlaceholder.style.background = 'rgba(97,187,71,0.1)'; // green background
      logoPlaceholder.style.color = '#61bb47';
    }

    // Try to load real logo
    const logoImg = document.createElement('img');
    logoImg.className = 'card-icon';
    logoImg.src = brandLogos[brand]; // logo URL if exists
    logoImg.alt = `${brand} logo`;

    // On image load success, replace placeholder
    logoImg.onload = () => {
      card.replaceChild(logoImg, logoPlaceholder);
    };

    // On image error, keep placeholder (do nothing)
    logoImg.onerror = () => {};

    // Brand name
    const name = document.createElement('div');
    name.className = 'card-text';
    name.textContent = brand;

    // Append placeholder first
    card.appendChild(logoPlaceholder);
    card.appendChild(name);
    brandsContainer.appendChild(card);
  });

  // Show brands, hide types
  typesContainer.style.display = 'none';
  brandsContainer.style.display = 'grid';

  // Back button
  document.getElementById('back-btn').onclick = () => {
    typesContainer.style.display = 'grid';
    brandsContainer.style.display = 'none';
    window.history.pushState({}, '', '/'); // reset URL
  };
}


// Check URL on page load
function initView() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  if (type) showBrands(type);
  else {
    typesContainer.style.display = 'grid';
    brandsContainer.style.display = 'none';
  }
}

// Browser back/forward
window.onpopstate = () => initView();

// Initialize
loadData();
