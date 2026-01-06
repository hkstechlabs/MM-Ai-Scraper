const apiUrl = 'https://portal.mobilemonster.com.au/version-live/api/1.1/wf/types_vendor_json';
const typesContainer = document.getElementById('types-container');
const brandsContainer = document.getElementById('brands-container');

// Brand logos mapping - using local assets
const brandLogos = {
  "Apple": "./assets/apple-13.svg",
  "Samsung": "./assets/samsung-8.svg",
  "Google": "./assets/google-1-1.svg",
  "Motorola": "./assets/motorola-6.svg",
  "Huawei": "./assets/huawei.svg",
  "HTC": "./assets/htc.svg",
  "LG": "./assets/lg.svg",
  "OnePlus": "./assets/oneplus-2.svg",
  "Oppo": "./assets/oppo-2022-1.svg",
  "Sony": "./assets/sony-2.svg",
  "Asus": "./assets/asus.svg",
  "BlackBerry": "./assets/blackberry.svg",
  "Microsoft": "./assets/microsoft.svg",
  "Nokia": "./assets/nokia.svg",
  "Nintendo": "./assets/nintendo.jpeg",
  "Nothing": "./assets/nothing.svg",
  "Xiaomi": "./assets/xiaomi.svg",
  "Segway Electric Scooter": "./assets/segway.svg"
};

// Type icons mapping
const typeIcons = {
  "Phone": "📱",
  "Smart Watch": "⌚",
  "Tablet": "📱",
  "Laptop": "💻",
  "PlayStation": "🎮",
  "Nintendo": "🎮",
  "Xbox": "🎮",
  "AirPod": "🎧",
  "Headset": "🎧",
  "Electric Scooter": "🛴",
  "Pencil": "✏️",
  "Keyboard": "⌨️",
  "Desktop": "🖥️",
  "Watch": "⌚",
  "Headphones": "🎧",
  "Speaker": "🔊",
  "Camera": "📷",
  "Gaming": "🎮",
  "TV": "📺",
  "Monitor": "🖥️",
  "Mouse": "🖱️",
  "Charger": "🔌",
  "Cable": "🔌",
  "Case": "📱",
  "Screen Protector": "🛡️",
  "Power Bank": "🔋",
  "Wireless Charger": "⚡",
  "Car Mount": "🚗",
  "Stand": "📐",
  "Stylus": "✏️",
  "VR": "🥽",
  "Drone": "🚁",
  "Smart Home": "🏠",
  "Fitness": "💪",
  "Audio": "🎵",
  "Video": "🎬",
  "Storage": "💾",
  "Network": "🌐",
  "Security": "🔒",
  "Tools": "🔧",
  "Accessories": "🎒"
};


let types = [];
let brands = [];
let filteredTypes = [];
let filteredBrands = [];

// Load types & brands
async function loadData() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Failed to fetch data');

    const data = await res.json();
    types = data.Type.sort(); // Sort alphabetically
    brands = data.Brand.sort(); // Sort alphabetically
    
    filteredTypes = [...types];
    filteredBrands = [...brands];

    renderTypes();
    setupSearch();
    initView(); // check URL on load
  } catch (err) {
    typesContainer.innerHTML = '<p>Failed to load data.</p>';
  }
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const brandsSearchInput = document.getElementById('brands-search-input');
  
  // Types search
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    filteredTypes = types.filter(type => 
      type.toLowerCase().includes(query)
    );
    renderTypes();
  });
  
  // Brands search
  brandsSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    filteredBrands = brands.filter(brand => 
      brand.toLowerCase().includes(query)
    );
    renderBrands();
  });
}

// Render types page
function renderTypes() {
  typesContainer.innerHTML = '';
  filteredTypes.forEach((type, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => showBrands(type);

    // Add icon for type
    const icon = document.createElement('div');
    icon.className = 'card-icon';
    
    // Use specific icon if available, otherwise use first letter
    const iconText = typeIcons[type] || type[0];
    icon.textContent = iconText;
    
    // Adjust font size based on whether it's an emoji or letter
    if (typeIcons[type]) {
      icon.style.fontSize = '2.5rem';
      icon.style.lineHeight = '1';
    } else {
      icon.style.fontSize = '2rem';
      icon.style.fontWeight = '600';
    }

    // Alternate colors for type icons
    if (index % 2 === 0) {
      icon.style.background = 'rgba(115,28,175,0.1)';
      icon.style.color = '#731caf';
    } else {
      icon.style.background = 'rgba(97,187,71,0.1)';
      icon.style.color = '#61bb47';
    }

    // Type name
    const name = document.createElement('div');
    name.className = 'card-text';
    name.textContent = type;

    card.appendChild(icon);
    card.appendChild(name);
    typesContainer.appendChild(card);
  });
}

// Render brands (separate function for search functionality)
function renderBrands() {
  const brandsCardsContainer = document.querySelector('.brands-cards-container');
  brandsCardsContainer.innerHTML = ''; // Clear existing content

  filteredBrands.forEach((brand, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => selectBrand(brand);

    // Create icon container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'card-icon';

    // Alternate colors for brand icons
    if (index % 2 === 0) {
      iconContainer.style.background = 'rgba(115,28,175,0.1)';
      iconContainer.style.color = '#731caf';
    } else {
      iconContainer.style.background = 'rgba(97,187,71,0.1)';
      iconContainer.style.color = '#61bb47';
    }

    // Try to load brand logo
    if (brandLogos[brand]) {
      console.log(`Loading logo for ${brand}: ${brandLogos[brand]}`);
      
      // Create and immediately append the image
      const logoImg = document.createElement('img');
      logoImg.src = brandLogos[brand];
      logoImg.alt = `${brand} logo`;
      logoImg.style.width = '45px';
      logoImg.style.height = '45px';
      logoImg.style.objectFit = 'contain';
      logoImg.style.display = 'block';
      logoImg.style.margin = '0 auto';
      
      // Set fallback first
      iconContainer.innerHTML = brand[0];
      iconContainer.style.fontSize = '2rem';
      iconContainer.style.fontWeight = '600';
      iconContainer.style.padding = '0';
      
      // Replace with logo when loaded
      logoImg.onload = function() {
        console.log(`Logo loaded successfully for ${brand}`);
        iconContainer.innerHTML = '';
        iconContainer.appendChild(logoImg);
        iconContainer.style.padding = '12px';
      };

      logoImg.onerror = function() {
        console.log(`Failed to load logo for ${brand}: ${brandLogos[brand]}`);
        // Keep the fallback letter if logo fails
      };

    } else {
      console.log(`No logo defined for ${brand}`);
      // Use first letter as fallback
      iconContainer.innerHTML = brand[0];
      iconContainer.style.fontSize = '2rem';
      iconContainer.style.fontWeight = '600';
      iconContainer.style.padding = '0';
    }

    // Brand name
    const name = document.createElement('div');
    name.className = 'card-text';
    name.textContent = brand;

    card.appendChild(iconContainer);
    card.appendChild(name);
    brandsCardsContainer.appendChild(card);
  });
}

// Render brands page
function showBrands(type) {
  // Update URL
  window.history.pushState({ type }, '', `?type=${encodeURIComponent(type)}`);

  // Setup brands view
  const brandsTitle = document.getElementById('brands-title');
  const brandsSearchInput = document.getElementById('brands-search-input');
  
  brandsTitle.textContent = `Brands for ${type}`;
  brandsSearchInput.value = ''; // Clear search
  filteredBrands = [...brands]; // Reset filter
  
  renderBrands();

  // Show brands, hide types
  typesContainer.style.display = 'none';
  document.getElementById('search-container').style.display = 'none';
  brandsContainer.style.display = 'block';

  // Back button
  document.getElementById('back-btn').onclick = () => {
    typesContainer.style.display = 'grid';
    document.getElementById('search-container').style.display = 'block';
    brandsContainer.style.display = 'none';
    window.history.pushState({}, '', window.location.pathname); // reset URL properly
  };
}

// Handle brand selection
function selectBrand(brand) {
  const params = new URLSearchParams(window.location.search);
  params.set('brand', brand.toLowerCase().replace(/\s+/g, ''));
  window.history.pushState({ brand }, '', `?${params.toString()}`);
  
  // You can add additional logic here for what happens when a brand is selected
  console.log(`Selected brand: ${brand}`);
}


// Check URL on page load
function initView() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const brand = params.get('brand');
  
  if (type) {
    showBrands(type);
    if (brand) {
      console.log(`Brand selected from URL: ${brand}`);
      // You can add logic here to highlight the selected brand or perform other actions
    }
  } else {
    typesContainer.style.display = 'grid';
    brandsContainer.style.display = 'none';
  }
}

// Browser back/forward
window.onpopstate = () => initView();

// Initialize
loadData();
