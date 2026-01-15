/************ SUPABASE CONFIG ************/
const SUPABASE_URL = "https://anmlzspuvlfqkvonnmdz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubWx6c3B1dmxmcWt2b25ubWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzkzNDYsImV4cCI6MjA4MjExNTM0Nn0.reh9tYmfSsv96XOfHhvlICVtMTfAfwnIlXXvL-Ds4FM";
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubWx6c3B1dmxmcWt2b25ubWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzkzNDYsImV4cCI6MjA4MjExNTM0Nn0.reh9tYmfSsv96XOfHhvlICVtMTfAfwnIlXXvL-Ds4FM';
/************ EXISTING CONFIG ************/
const apiUrl = 'https://portal.mobilemonster.com.au/version-live/api/1.1/wf/types_vendor_json';
const typesContainer = document.getElementById('types-container');
const brandsContainer = document.getElementById('brands-container');
const productsContainer = document.getElementById('products-container');

/************ BRAND LOGOS ************/
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

/************ TYPE ICONS ************/
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
  "Keyboard": "⌨️",
  "Desktop": "🖥️",
  "Watch": "⌚",
  "Headphones": "🎧",
  "Speaker": "🔊"
};

let types = [];
let brands = [];
let filteredTypes = [];
let filteredBrands = [];

/************ LOAD TYPES & BRANDS ************/
async function loadData() {
  const res = await fetch(apiUrl);
  const data = await res.json();

  types = data.Type.sort();
  brands = data.Brand.sort();

  filteredTypes = [...types];
  filteredBrands = [...brands];

  renderTypes();
  setupSearch();
  initView();
}

/************ SEARCH ************/
function setupSearch() {
  document.getElementById('search-input').addEventListener('input', e => {
    filteredTypes = types.filter(t => t.toLowerCase().includes(e.target.value.toLowerCase()));
    renderTypes();
  });

  document.getElementById('brands-search-input').addEventListener('input', e => {
    filteredBrands = brands.filter(b => b.toLowerCase().includes(e.target.value.toLowerCase()));
    renderBrands();
  });
}

/************ TYPES ************/
function renderTypes() {
  typesContainer.innerHTML = '';
  filteredTypes.forEach((type, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => showBrands(type);

    const icon = document.createElement('div');
    icon.className = 'card-icon';
    icon.textContent = typeIcons[type] || type[0];

    const name = document.createElement('div');
    name.className = 'card-text';
    name.textContent = type;

    card.append(icon, name);
    typesContainer.appendChild(card);
  });
}

/************ BRANDS ************/
function renderBrands() {
  const container = document.querySelector('.brands-cards-container');
  container.innerHTML = '';

  filteredBrands.forEach(brand => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => selectBrand(brand);

    const icon = document.createElement('div');
    icon.className = 'card-icon';
    icon.textContent = brand[0];

    if (brandLogos[brand]) {
      const img = document.createElement('img');
      img.src = brandLogos[brand];
      img.onload = () => {
        icon.innerHTML = '';
        icon.appendChild(img);
      };
    }

    const name = document.createElement('div');
    name.className = 'card-text';
    name.textContent = brand;

    card.append(icon, name);
    container.appendChild(card);
  });
}

/************ SHOW BRANDS ************/
function showBrands(type) {
  history.pushState({ type }, '', `?type=${encodeURIComponent(type)}`);

  document.getElementById('brands-title').textContent = `Brands for ${type}`;
  filteredBrands = [...brands];
  renderBrands();

  typesContainer.style.display = 'none';
  document.getElementById('search-container').style.display = 'none';
  brandsContainer.style.display = 'block';
}

/************ BRAND CLICK → PRODUCTS ************/
function selectBrand(brand) {
  brand = brand.replace(/:\d+$/, "");

  const params = new URLSearchParams(window.location.search);
  params.set('brand', brand);
  history.pushState({}, '', `?${params.toString()}`);

  const type = params.get('type'); // get selected type
  loadProducts(brand, type);
}

/************ BRAND TO ID MAPPING ************/
const brandIds = {
  "Apple": 1,
  "Samsung": 2,
  "Google": 3,
  "Motorola": 4,
  "Huawei": 5,
  "HTC": 6,
  "LG": 7,
  "OnePlus": 8,
  "Oppo": 9,
  "Sony": 10,
  "Asus": 11,
  "BlackBerry": 12,
  "Microsoft": 13,
  "Nokia": 14,
  "Nintendo": 15,
  "Nothing": 16,
  "Xiaomi": 17,
  "Segway Electric Scooter": 18
};
/************ TYPE TO ID MAPPING ************/
const typeIds = {
  "AirPod": 1,
  "Electric Scooter": 2,
  "Headset": 3,
  "Keyboard": 4,
  "Laptop": 5,
  "Nintendo": 6,
  "Pencil": 7,
  "Phone": 8,
  "PlayStation": 9,
  "Smart Watch": 10,
  "Tablet": 11,
  "Xbox": 12,
};


/************ LOAD PRODUCTS FROM SUPABASE WITH VARIANTS ************/
async function loadProducts(brand, type) {
  const brandId = brandIds[brand];
  const typeId = typeIds[type];

  if (!brandId || !typeId) {
    productsContainer.style.display = 'block';
    productsContainer.innerHTML = '<p>No products found</p>';
    return;
  }

  typesContainer.style.display = 'none';
  brandsContainer.style.display = 'none';
  productsContainer.style.display = 'block';
  document.getElementById('products-title').textContent = `Products by ${brand}`;
  const list = document.getElementById('products-list');
  list.innerHTML = 'Loading...';

  try {
    /* 1️⃣ PRODUCTS */
    const productsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/products?brand=eq.${brandId}&type=eq.${typeId}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        }
      }
    );

    const products = await productsRes.json();
    console.log('Selected brand:', brand, 'Selected type:', type);
console.log('Brand ID:', brandIds[brand], 'Type ID:', typeIds[type]);
console.log('Products from Supabase:', products);


    if (!products.length) {
      list.innerHTML = '<p>No products found</p>';
      return;
    }

    /* 2️⃣ PRODUCTS → VARIANTS → MAPPINGS */
    const productsWithVariants = await Promise.all(
      products.map(async product => {
        try {
          const productId = product.id;

          const variantsRes = await fetch(
            `${SUPABASE_URL}/rest/v1/variants?product=eq.${productId}&select=*`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
              }
            }
          );

          const variants = await variantsRes.json();

          /* 🔹 mapping IDs collect */
          const mappingIds = variants
            .map(v => v.mapping)
            .filter(Boolean);

          let mappingMap = {};

          /* 🔹 mappings fetch */

          if (mappingIds.length) {
            const mappingsRes = await fetch(
         `${SUPABASE_URL}/rest/v1/mappings?id=in.(${mappingIds.join(',')})&select=*`,
         {
            headers: {
            apikey: SUPABASE_KEY,
           Authorization: `Bearer ${SUPABASE_KEY}`,
            }
          }
       );

            const mappings = await mappingsRes.json();
           mappings.forEach(m => {
           console.log("MAPPING ROW 👉", m); // 🔴 DEBUG (VERY IMPORTANT)

             mappingMap[m.id] = {
             mm: m.mm || null,
             reebelo: m.reebelo || m.Reebelo || m.reebelo_sku || null,
            greenGadgets: m.green_gadgets || m["green gadgets"] || null
           };
         });
        }

          /* 🔹 MM inject into variants */
          variants.forEach(v => {
          const map = mappingMap[v.mapping];

          v.mappings = map || {
          mm: null,
          reebelo: null,
         greenGadgets: null
          };
       });


          product.variants = variants;
        } catch (err) {
          console.error('Variant error:', err);
          product.variants = [];
        }

        return product;
      })
    );

    /* 3️⃣ STORE & RENDER */
    window.currentProducts = productsWithVariants; // Store for sorting
    setupSorting(); // Setup sort event listener
    renderProducts(productsWithVariants);

  } catch (err) {
    console.error('Error loading products:', err);
    list.innerHTML = '<p>Error loading products</p>';
  }
}

/************ SETUP SORTING ************/
function setupSorting() {
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', (e) => {
    const sortBy = e.target.value;
    const sortedProducts = sortProducts(window.currentProducts, sortBy);
    renderProducts(sortedProducts);
  });
}

/************ SORT PRODUCTS ************/
function sortProducts(products, sortBy) {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'variants-count':
      return sorted.sort((a, b) => (a.variants?.length || 0) - (b.variants?.length || 0));
    case 'variants-count-desc':
      return sorted.sort((a, b) => (b.variants?.length || 0) - (a.variants?.length || 0));
    case 'id':
      return sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
    case 'id-desc':
      return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/************ RENDER PRODUCTS WITH VARIANTS (Editable & Save button in same row) ************/
function renderProducts(products) {
  const list = document.getElementById('products-list');
  list.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    /* ---------- Product Header ---------- */
    const header = document.createElement('div');
    header.className = 'product-header';

    const info = document.createElement('div');
    info.className = 'product-info';

    const icon = document.createElement('div');
    icon.className = 'product-icon';
    icon.textContent = product.name[0];

    const name = document.createElement('div');
    name.className = 'product-name';
    name.innerHTML = `
      <div class="product-title">${product.name}</div>
      <div class="product-meta">${product.variants?.length || 0} variants</div>
    `;

    info.append(icon, name);

    const expand = document.createElement('div');
    expand.className = 'expand-icon';
    expand.textContent = '▾';
    expand.dataset.expanded = 'false';

    header.append(info, expand);
    card.appendChild(header);

    /* ---------- Variants Container ---------- */
    const variantsContainer = document.createElement('div');
    variantsContainer.style.display = 'none';

    if (product.variants?.length) {
      product.variants.forEach(v => {
        const variantBox = document.createElement('div');
        variantBox.className = 'variant-box';
        variantBox.style.marginBottom = '12px';

        /* ---------- Title Row with Save Button ---------- */
const titleRow = document.createElement('div');
titleRow.className = 'title-row'; // ✅ assign class for CSS


        const vTitle = document.createElement('div');
        vTitle.className = 'variant-title';
        vTitle.textContent = v.title;

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.disabled = true;
        saveBtn.style.padding = '4px 10px';
        saveBtn.style.borderRadius = '4px';
        saveBtn.style.border = 'none';
        saveBtn.style.cursor = 'not-allowed';
        saveBtn.style.backgroundColor = '#ccc';
        saveBtn.style.color = '#fff';
        saveBtn.style.transition = 'background 0.2s';

        titleRow.append(vTitle, saveBtn);
        variantBox.appendChild(titleRow);

        /* ---------- Mapping Table with Inputs ---------- */
        const mappingTable = document.createElement('table');
        mappingTable.className = 'mapping-table';

        const tbody = document.createElement('tbody');

        const rowsData = [
          { label: 'MM', value: v.mappings.mm || '' },
          { label: 'Reebelo', value: v.mappings.reebelo || '' },
          { label: 'Green Gadgets', value: v.mappings.greenGadgets || '' },
        ];

        rowsData.forEach(row => {
          const tr = document.createElement('tr');
          const th = document.createElement('th');
          th.textContent = row.label;

          const td = document.createElement('td');
          const input = document.createElement('input');
          input.type = 'text';
          input.value = row.value;
          input.dataset.variantId = v.id;
          input.dataset.mappingKey = row.label.toLowerCase().replace(' ', '');
          input.className = 'mapping-input';
          input.style.width = '100%';
          input.style.padding = '4px';
          td.appendChild(input);
          tr.append(th, td);
          tbody.appendChild(tr);
        });

        mappingTable.appendChild(tbody);
        variantBox.appendChild(mappingTable);

        /* ---------- Enable Save on Input Change ---------- */
        const inputs = variantBox.querySelectorAll('.mapping-input');
        inputs.forEach(input => {
          input.addEventListener('input', () => {
            saveBtn.disabled = false;
            saveBtn.style.cursor = 'pointer';
            saveBtn.style.backgroundColor = '#731caf';
          });
        });

       /* ---------- Save Button Click (Fixed for Supabase) ---------- */
        saveBtn.onclick = async () => {
        const payload = {};

    inputs.forEach(inp => {
    // Handle 'Green Gadgets' separately
    let key = inp.dataset.mappingKey;
    if (key === 'greengadgets') key = 'green gadgets';
    payload[key] = inp.value;
  });

  if (!v.mapping) {
    alert('Error: mapping ID missing!');
    return;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/mappings?id=eq.${v.mapping}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      saveBtn.disabled = true;
      saveBtn.style.cursor = 'not-allowed';
      saveBtn.style.backgroundColor = '#ccc';
      alert('Mapping saved successfully!');
    } else {
      const errText = await res.text();
      console.error('Supabase PATCH error:', errText);
      alert('Failed to save mapping. Check console.');
    }

  } catch (err) {
    console.error('Save error:', err);
    alert('Failed to save mapping.');
  }
};



        variantsContainer.appendChild(variantBox);
      });
    } else {
      variantsContainer.innerHTML = '<p>No variants</p>';
    }

    card.appendChild(variantsContainer);

    /* ---------- Toggle Variants ---------- */
    header.onclick = () => {
      const open = expand.dataset.expanded === 'true';
      expand.textContent = open ? '▾' : '▴';
      expand.dataset.expanded = (!open).toString();
      variantsContainer.style.display = open ? 'none' : 'block';
    };

    list.appendChild(card);
  });
}


/************ PRODUCTS BACK ************/
const backBtn = document.getElementById('products-back-btn');
backBtn.style.display = 'inline-block';
backBtn.style.padding = '8px 16px';
backBtn.style.backgroundColor = '#731caf';
backBtn.style.color = '#fff';
backBtn.style.border = 'none';
backBtn.style.borderRadius = '6px';
backBtn.style.cursor = 'pointer';
backBtn.style.fontSize = '14px';
backBtn.style.marginBottom = '20px';
backBtn.style.transition = 'background 0.2s';

backBtn.onmouseover = () => backBtn.style.backgroundColor = '#1caf6aff';
backBtn.onmouseout = () => backBtn.style.backgroundColor = '#731caf';

const productsBackBtn = document.getElementById('products-back-btn');
productsBackBtn.onclick = () => {
  // Remove brand from URL, keep type
  const params = new URLSearchParams(window.location.search);
  params.delete('brand');
  history.pushState({}, '', `?${params.toString()}`);

  // Re-render the page based on updated URL
  renderViewFromURL();
};





const brandsBackBtn = document.getElementById('back-btn');
brandsBackBtn.onclick = () => {
  // Remove type and brand from URL
  const params = new URLSearchParams(window.location.search);
  params.delete('type');
  params.delete('brand');
  history.pushState({}, '', `?${params.toString()}`);

  // Re-render the page based on updated URL
  renderViewFromURL();
};

/************ INIT APP WITH ZERO FLASH ************/
async function initApp() {
  // Show loading state
  typesContainer.style.display = 'none';
  brandsContainer.style.display = 'none';
  productsContainer.style.display = 'none';
  document.getElementById('search-container').style.display = 'none';
  const list = document.getElementById('products-list');
  if (list) list.innerHTML = 'Loading...';

  // 1️⃣ Load all data
  await loadData();  // fetch types & brands

  // 2️⃣ Render page based on URL
  await renderViewFromURL();
}

/************ RENDER VIEW FROM URL ************/
async function renderViewFromURL() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const brand = params.get('brand');

  // Hide everything first
  typesContainer.style.display = 'none';
  brandsContainer.style.display = 'none';
  productsContainer.style.display = 'none';
  document.getElementById('search-container').style.display = 'none';

  if (type && brand) {
    // Product page
    await loadProducts(brand, type);
    return;
  }

  if (type) {
    // Brands page
    showBrands(type);
    return;
  }

  // Default types page
  filteredTypes = [...types];
  renderTypes();
  typesContainer.style.display = 'grid';
  document.getElementById('search-container').style.display = 'block';
}

/************ OVERRIDE showBrands TO HIDE DOM PROPERLY ************/
function showBrands(type) {
  history.replaceState({ type }, '', `?type=${encodeURIComponent(type)}`);

  document.getElementById('brands-title').textContent = `Brands for ${type}`;
  filteredBrands = [...brands];

  // Hide other containers
  typesContainer.style.display = 'none';
  document.getElementById('search-container').style.display = 'none';
  productsContainer.style.display = 'none';

  renderBrands();
  brandsContainer.style.display = 'block';
}

/************ HANDLE BACK/FORWARD ************/
window.onpopstate = () => {
  renderViewFromURL();
};

/************ LOAD DATA (remove initView inside loadData) ************/
async function loadData() {
  const res = await fetch(apiUrl);
  const data = await res.json();

  types = data.Type.sort();
  brands = data.Brand.sort();

  filteredTypes = [...types];
  filteredBrands = [...brands];

  renderTypes();
  setupSearch();
}

// finally init app
initApp();


