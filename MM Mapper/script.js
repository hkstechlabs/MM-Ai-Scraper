// API Configuration
const API_BASE_URL = 'https://anmlzspuvlfqkvonnmdz.supabase.co/rest/v1';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubWx6c3B1dmxmcWt2b25ubWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzkzNDYsImV4cCI6MjA4MjExNTM0Nn0.reh9tYmfSsv96XOfHhvlICVtMTfAfwnIlXXvL-Ds4FM';

// Dynamic competitors data (will be populated from API)
let competitors = [];
let mappings = []; // Store all mappings from API

let competitorsData = [
    {
        "Title": "Iphone 11 Pro Max - 64GB - Space Gray",
        "SKU": "13213123123",
        "CompetitorID": "1"
    },
    {
        "Title": "Iphone 12 Pro Max - 64GB - Space Gray",
        "SKU": "454354353453",
        "CompetitorID": "2"
    }
];

// MM Products data structure (will be populated from API)
let mmProducts = [];

let filteredProducts = [];
let paginatedProducts = [];
let nextProductId = 1;

// Pagination variables
let currentPage = 1;
let itemsPerPage = 20;
let totalPages = 1;

// DOM elements
let searchInput, searchBtn, addProductBtn, tableBody, modal, addProductForm;
let customAlert, customConfirm, successToast;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadData();
});

function initializeElements() {
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    addProductBtn = document.getElementById('addProductBtn');
    tableBody = document.getElementById('tableBody');
    modal = document.getElementById('addProductModal');
    addProductForm = document.getElementById('addProductForm');
    customAlert = document.getElementById('customAlert');
    customConfirm = document.getElementById('customConfirm');
    successToast = document.getElementById('successToast');
}

function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    searchBtn.addEventListener('click', handleSearch);
    
    // Add product modal
    addProductBtn.addEventListener('click', openModal);
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    
    // Add product form
    addProductForm.addEventListener('submit', handleAddProduct);
    
    // Custom alert event listeners
    document.getElementById('alertOkBtn').addEventListener('click', closeCustomAlert);
    document.getElementById('confirmOkBtn').addEventListener('click', handleConfirmOk);
    document.getElementById('confirmCancelBtn').addEventListener('click', closeCustomConfirm);
    document.getElementById('toastClose').addEventListener('click', hideToast);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
        if (event.target === customAlert) {
            closeCustomAlert();
        }
        if (event.target === customConfirm) {
            closeCustomConfirm();
        }
    });
}

// API Functions
async function loadData() {
    try {
        showToast('Loading data...', 'info');
        
        // Load competitors, variants, and mappings in parallel
        const [competitorsResponse, variantsResponse, mappingsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/competitors`, {
                headers: {
                    'apiKey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }),
            fetch(`${API_BASE_URL}/variants`, {
                headers: {
                    'apiKey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }),
            fetch(`${API_BASE_URL}/mappings`, {
                headers: {
                    'apiKey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            })
        ]);
        
        if (!competitorsResponse.ok || !variantsResponse.ok || !mappingsResponse.ok) {
            throw new Error('Failed to fetch data from API');
        }
        
        const competitorsData = await competitorsResponse.json();
        const variantsData = await variantsResponse.json();
        const mappingsData = await mappingsResponse.json();
        
        console.log('Loaded mappings:', mappingsData);
        
        // Store mappings globally
        mappings = mappingsData;
        
        // Transform competitors data
        competitors = competitorsData.map(competitor => ({
            id: competitor.id.toString(),
            name: competitor.title
        }));
        
        // Transform variants data to MM products
        mmProducts = variantsData.map(variant => {
            // Find mapping for this variant
            const variantMapping = mappingsData.find(mapping => 
                mapping.variant === variant.id || 
                mapping.mm === variant.product_id ||
                mapping.mm === variant.title
            );
            
            const product = {
                id: variant.id,
                title: variant.title,
                mmSku: variant.product_id || variant.sku || `MM-${variant.id}`,
                sku: variant.sku,
                price: variant.price,
                storage: variant.storage,
                condition: variant.condition,
                colour: variant.colour,
                competitorMappings: {},
                mappingId: variantMapping?.id || null // Store mapping ID for updates
            };
            
            // Populate competitor mappings from API data
            if (variantMapping) {
                // Map the API fields to competitor IDs
                competitors.forEach(competitor => {
                    const competitorName = competitor.name.toLowerCase();
                    if (variantMapping[competitorName] !== undefined) {
                        product.competitorMappings[competitor.id] = variantMapping[competitorName] || "";
                    } else if (variantMapping[competitorName.replace(/\s+/g, '')] !== undefined) {
                        // Try without spaces (e.g., "green gadgets" -> "greengadgets")
                        product.competitorMappings[competitor.id] = variantMapping[competitorName.replace(/\s+/g, '')] || "";
                    } else {
                        product.competitorMappings[competitor.id] = "";
                    }
                });
            } else {
                // Initialize empty mappings if no mapping found
                competitors.forEach(competitor => {
                    product.competitorMappings[competitor.id] = "";
                });
            }
            
            return product;
        });
        
        // Set next ID for new products
        nextProductId = mmProducts.length > 0 ? Math.max(...mmProducts.map(p => p.id)) + 1 : 1;
        
        // Initialize filtered products
        filteredProducts = [...mmProducts];
        
        // Initialize pagination
        currentPage = 1;
        updatePagination();
        
        // Render the table with dynamic data
        renderTable();
        
        showToast(`Loaded ${competitors.length} competitors, ${mmProducts.length} products, and ${mappingsData.length} mappings!`, 'success');
        
    } catch (error) {
        console.error('Error loading data:', error);
        showCustomAlert('Failed to load data from API. Using fallback data.', 'warning');
        
        // Fallback to static data
        competitors = [
            { id: "1", name: "Reebelo" },
            { id: "2", name: "Green Gadgets" }
        ];
        
        mmProducts = [
            {
                id: 1,
                title: "iPhone 11 Pro Max - 64GB - Space Gray",
                mmSku: "MM-IP11PM-64-SG",
                competitorMappings: {}
            },
            {
                id: 2,
                title: "iPhone 12 Pro Max - 64GB - Space Gray", 
                mmSku: "MM-IP12PM-64-SG",
                competitorMappings: {}
            },
            {
                id: 3,
                title: "iPhone 13 Pro - 128GB - Gold",
                mmSku: "MM-IP13P-128-GD",
                competitorMappings: {}
            }
        ];
        
        nextProductId = 4;
        
        initializeCompetitorMappings();
        filteredProducts = [...mmProducts];
        currentPage = 1;
        updatePagination();
        renderTable();
    }
}

async function loadCompetitors() {
    // This function is now part of loadData() but keeping for backward compatibility
    return loadData();
}

function initializeCompetitorMappings() {
    // Initialize competitor mappings for all products
    mmProducts.forEach(product => {
        product.competitorMappings = {};
        competitors.forEach(competitor => {
            if (!product.competitorMappings[competitor.id]) {
                product.competitorMappings[competitor.id] = "";
            }
        });
    });
}

// API function to create a new variant
async function createVariant(variantData) {
    try {
        console.log('Sending variant data:', variantData);
        
        const response = await fetch(`${API_BASE_URL}/variants`, {
            method: 'POST',
            headers: {
                'apiKey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(variantData)
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 201) {
            // Success - 201 Created
            try {
                const responseText = await response.text();
                console.log('Raw response text:', responseText);
                
                // Check if response has content
                if (!responseText || responseText.trim() === '') {
                    console.log('Empty response body, item created successfully');
                    return { success: true, id: Date.now() }; // Return a mock response
                }
                
                // Try to parse JSON
                const createdVariant = JSON.parse(responseText);
                console.log('Parsed variant:', createdVariant);
                return createdVariant;
                
            } catch (parseError) {
                console.log('JSON parse error, but item was created (201 status):', parseError);
                // Return a success indicator since the API returned 201
                return { success: true, id: Date.now() };
            }
        } else {
            // Handle error responses
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            
            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || errorData.hint || `HTTP error! status: ${response.status}`);
            } catch (parseError) {
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
        }
        
    } catch (error) {
        console.error('Error creating variant:', error);
        throw error;
    }
}

// API function to create or update a mapping
async function saveMapping(mappingData, mappingId = null) {
    try {
        const method = mappingId ? 'PATCH' : 'POST';
        const url = mappingId ? `${API_BASE_URL}/mappings?id=eq.${mappingId}` : `${API_BASE_URL}/mappings`;
        
        console.log(`${method}ing mapping:`, mappingData, 'to URL:', url);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'apiKey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mappingData)
        });
        
        console.log('Mapping response status:', response.status);
        
        if (response.status === 201 || response.status === 204) {
            // Success - 201 Created or 204 No Content (for updates)
            try {
                const responseText = await response.text();
                if (responseText && responseText.trim() !== '') {
                    return JSON.parse(responseText);
                }
                return { success: true };
            } catch (parseError) {
                console.log('Mapping saved successfully (no response body)');
                return { success: true };
            }
        } else {
            const errorText = await response.text();
            console.error('Mapping API Error:', errorText);
            throw new Error(`Failed to save mapping: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error saving mapping:', error);
        throw error;
    }
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...mmProducts];
    } else {
        // Search across all products, not just current page
        filteredProducts = mmProducts.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.mmSku.toLowerCase().includes(searchTerm) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
            (product.storage && product.storage.toLowerCase().includes(searchTerm)) ||
            (product.condition && product.condition.toLowerCase().includes(searchTerm)) ||
            (product.colour && product.colour.toLowerCase().includes(searchTerm))
        );
    }
    
    // Reset to first page when searching
    currentPage = 1;
    updatePagination();
    renderTable();
}

function updatePagination() {
    totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get products for current page
    paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Update pagination info
    const totalItems = filteredProducts.length;
    const startItem = totalItems > 0 ? startIndex + 1 : 0;
    const endItem = Math.min(endIndex, totalItems);
    
    document.getElementById('paginationInfo').textContent = 
        `Showing ${startItem} - ${endItem} of ${totalItems} items`;
    
    // Update pagination controls
    updatePaginationControls();
}

function updatePaginationControls() {
    const firstPageBtn = document.getElementById('firstPageBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const lastPageBtn = document.getElementById('lastPageBtn');
    const pageNumbers = document.getElementById('pageNumbers');
    
    // Enable/disable navigation buttons
    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    lastPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generate page numbers
    pageNumbers.innerHTML = '';
    
    if (totalPages <= 7) {
        // Show all pages if 7 or fewer
        for (let i = 1; i <= totalPages; i++) {
            createPageNumber(i);
        }
    } else {
        // Show smart pagination for more than 7 pages
        if (currentPage <= 4) {
            // Show first 5 pages + ... + last page
            for (let i = 1; i <= 5; i++) {
                createPageNumber(i);
            }
            createEllipsis();
            createPageNumber(totalPages);
        } else if (currentPage >= totalPages - 3) {
            // Show first page + ... + last 5 pages
            createPageNumber(1);
            createEllipsis();
            for (let i = totalPages - 4; i <= totalPages; i++) {
                createPageNumber(i);
            }
        } else {
            // Show first + ... + current-1, current, current+1 + ... + last
            createPageNumber(1);
            createEllipsis();
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                createPageNumber(i);
            }
            createEllipsis();
            createPageNumber(totalPages);
        }
    }
}

function createPageNumber(pageNum) {
    const pageNumbers = document.getElementById('pageNumbers');
    const pageBtn = document.createElement('div');
    pageBtn.className = `page-number ${pageNum === currentPage ? 'active' : ''}`;
    pageBtn.textContent = pageNum;
    pageBtn.onclick = () => goToPage(pageNum);
    pageNumbers.appendChild(pageBtn);
}

function createEllipsis() {
    const pageNumbers = document.getElementById('pageNumbers');
    const ellipsis = document.createElement('div');
    ellipsis.className = 'page-number';
    ellipsis.textContent = '...';
    ellipsis.style.cursor = 'default';
    ellipsis.onclick = null;
    pageNumbers.appendChild(ellipsis);
}

function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) {
        return;
    }
    
    currentPage = pageNum;
    updatePagination();
    renderTable();
    
    // Scroll to top of table
    document.getElementById('mappingTable').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

function renderTable() {
    // First, render the table header dynamically
    renderTableHeader();
    
    tableBody.innerHTML = '';
    
    if (paginatedProducts.length === 0) {
        const colSpan = 3 + competitors.length;
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colSpan}" class="no-results">
                    ${filteredProducts.length === 0 ? 
                        'No products found. Try adjusting your search or add a new product.' : 
                        'No items on this page.'}
                </td>
            </tr>
        `;
        return;
    }
    
    paginatedProducts.forEach(product => {
        const row = createProductRow(product);
        tableBody.appendChild(row);
    });
}

function renderTableHeader() {
    const table = document.getElementById('mappingTable');
    const thead = table.querySelector('thead');
    
    // Build header HTML dynamically
    let headerHTML = `
        <tr>
            <th>MM Product Title</th>
            <th>MM SKU</th>
    `;
    
    // Add competitor columns dynamically
    competitors.forEach(competitor => {
        headerHTML += `<th>${competitor.name} SKU</th>`;
    });
    
    headerHTML += `
            <th>Actions</th>
        </tr>
    `;
    
    thead.innerHTML = headerHTML;
}

function createProductRow(product) {
    const row = document.createElement('tr');
    row.setAttribute('data-product-id', product.id);
    
    // Build competitor input columns dynamically
    let competitorInputs = '';
    competitors.forEach(competitor => {
        competitorInputs += `
            <td>
                <input type="text" 
                       class="competitor-input" 
                       data-competitor-id="${competitor.id}" 
                       data-product-id="${product.id}"
                       data-original-value="${product.competitorMappings[competitor.id] || ''}"
                       value="${product.competitorMappings[competitor.id] || ''}" 
                       placeholder="Enter ${competitor.name} SKU"
                       oninput="checkForChanges(${product.id})">
            </td>
        `;
    });
    
    // Build product title with additional info
    let productTitle = product.title;
    if (product.storage || product.condition || product.colour) {
        let details = [];
        if (product.storage) details.push(product.storage);
        if (product.condition) details.push(product.condition);
        if (product.colour) details.push(product.colour);
        if (details.length > 0) {
            productTitle += ` <span class="product-details">(${details.join(', ')})</span>`;
        }
    }
    
    row.innerHTML = `
        <td class="product-title">${productTitle}</td>
        <td>
            <input type="text" 
                   class="mm-sku-input" 
                   data-product-id="${product.sku}"
                   data-original-value="${product.sku}"
                   value="${product.sku}" 
                   placeholder="MM SKU"
                   oninput="checkForChanges(${product.sku})">
        </td>
        ${competitorInputs}
        <td>
            <button class="save-btn" 
                    id="save-btn-${product.id}"
                    onclick="saveProductMappings(${product.id})" 
                    disabled>Save</button>
        </td>
    `;

    console.log(product)
    
    return row;
}

function checkForChanges(productId) {
    const row = document.querySelector(`tr[data-product-id="${productId}"]`);
    const saveBtn = document.getElementById(`save-btn-${productId}`);
    
    if (!row || !saveBtn) return;
    
    let hasChanges = false;
    
    // Check MM SKU input for changes
    const mmSkuInput = row.querySelector('.mm-sku-input');
    if (mmSkuInput) {
        const originalValue = mmSkuInput.getAttribute('data-original-value') || '';
        const currentValue = mmSkuInput.value.trim();
        if (originalValue !== currentValue) {
            hasChanges = true;
        }
    }
    
    // Check competitor inputs for changes
    const competitorInputs = row.querySelectorAll('.competitor-input');
    competitorInputs.forEach(input => {
        const originalValue = input.getAttribute('data-original-value') || '';
        const currentValue = input.value.trim();
        if (originalValue !== currentValue) {
            hasChanges = true;
        }
    });
    
    // Enable/disable save button based on changes
    saveBtn.disabled = !hasChanges;
    
    // Add visual feedback
    if (hasChanges) {
        saveBtn.classList.add('has-changes');
    } else {
        saveBtn.classList.remove('has-changes');
    }
}

async function saveProductMappings(productId) {
    const product = mmProducts.find(p => p.id === productId);
    if (!product) return;
    
    const row = document.querySelector(`tr[data-product-id="${productId}"]`);
    const competitorInputs = row.querySelectorAll('.competitor-input');
    const mmSkuInput = row.querySelector('.mm-sku-input');
    const saveBtn = document.getElementById(`save-btn-${productId}`);
    
    // Show loading state
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    try {
        // Update MM SKU if changed
        const newMmSku = mmSkuInput.value.trim();
        if (newMmSku !== product.mmSku) {
            product.mmSku = newMmSku;
        }
        
        // Update local competitor mappings
        competitorInputs.forEach(input => {
            const competitorId = input.getAttribute('data-competitor-id');
            const value = input.value.trim();
            product.competitorMappings[competitorId] = value;
        });
        
        // Prepare mapping data for API
        const mappingData = {
            mm: product.mmSku,
            variant: product.id
        };
        
        // Add competitor mappings using exact field names from API
        competitors.forEach(competitor => {
            const competitorName = competitor.name.toLowerCase();
            const value = product.competitorMappings[competitor.id];
            
            // Use exact field names as they appear in the API
            if (competitorName === 'reebelo') {
                mappingData.reebelo = value || null;
            } else if (competitorName === 'green gadgets') {
                mappingData['green gadgets'] = value || null;
            } else {
                // Fallback for other competitors
                mappingData[competitorName] = value || null;
            }
        });
        
        console.log('Saving mapping data:', mappingData);
        
        // Determine if this is an update or create
        const isUpdate = product.mappingId !== null && product.mappingId !== undefined;
        
        if (isUpdate) {
            // Update existing mapping
            await saveMapping(mappingData, product.mappingId);
        } else {
            // Create new mapping
            const result = await saveMapping(mappingData);
            // Store the mapping ID for future updates
            if (result && result.id) {
                product.mappingId = result.id;
            }
        }
        
        // Update original values to reflect saved state
        mmSkuInput.setAttribute('data-original-value', newMmSku);
        competitorInputs.forEach(input => {
            input.setAttribute('data-original-value', input.value.trim());
        });
        
        // Reset save button state
        saveBtn.disabled = true;
        saveBtn.classList.remove('has-changes');
        
        // Show success toast
        showToast('Mappings saved successfully!', 'success');
        
        console.log('Saved mappings for product:', product);
        
    } catch (error) {
        console.error('Error saving mappings:', error);
        showCustomAlert(`Failed to save mappings: ${error.message}`, 'error');
    } finally {
        // Reset button text
        saveBtn.textContent = originalText;
        // Re-check for changes to set proper button state
        checkForChanges(productId);
    }
}

let confirmCallback = null;

function deleteProduct(productId) {
    const product = mmProducts.find(p => p.id === productId);
    if (!product) return;
    
    showCustomConfirm(
        `Are you sure you want to delete "${product.title}"? This action cannot be undone.`,
        () => {
            mmProducts = mmProducts.filter(p => p.id !== productId);
            handleSearch(); // Refresh the filtered view
            showToast('Product deleted successfully!', 'success');
            console.log('Deleted product with ID:', productId);
        }
    );
}

function openModal() {
    modal.style.display = 'block';
    document.getElementById('productTitle').focus();
}

function closeModal() {
    modal.style.display = 'none';
    addProductForm.reset();
}

async function handleAddProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value.trim();
    const title = document.getElementById('productTitle').value.trim();
    const sku = document.getElementById('productSKU').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const storage = document.getElementById('productStorage').value.trim();
    const condition = document.getElementById('productCondition').value.trim();
    const colour = document.getElementById('productColour').value.trim();
    
    // Validate required fields
    if (!productId || !title || !sku || !price || !storage || !condition || !colour) {
        showCustomAlert('Please fill in all required fields.', 'warning');
        return;
    }
    
    // Validate price is a valid number
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
        showCustomAlert('Please enter a valid price.', 'warning');
        return;
    }
    
    // Check for duplicate Product ID
    if (mmProducts.some(p => p.mmSku === productId)) {
        showCustomAlert('A product with this Product ID already exists.', 'error');
        return;
    }
    
    // Check for duplicate SKU
    if (mmProducts.some(p => p.sku === sku)) {
        showCustomAlert('A product with this SKU already exists.', 'error');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating...';
        submitBtn.disabled = true;
        
        // Prepare data for API - ensure all fields are strings except price
        const variantData = {
            product_id: productId.toString(),
            title: title.toString(),
            sku: sku.toString(),
            price: priceNum, // Keep as number
            storage: storage.toString(),
            condition: condition.toString(),
            colour: colour.toString()
        };
        
        console.log('Attempting to create variant with data:', variantData);
        
        // Create variant via API
        const createdVariant = await createVariant(variantData);
        
        // Handle different response formats
        let variantResponse;
        if (Array.isArray(createdVariant)) {
            variantResponse = createdVariant[0];
        } else if (createdVariant && typeof createdVariant === 'object') {
            variantResponse = createdVariant;
        } else {
            // Fallback if no proper response but creation was successful
            variantResponse = { success: true };
        }
        
        // Create local product object
        const newProduct = {
            id: variantResponse?.id || nextProductId++,
            title: title,
            mmSku: productId, // Use product_id as MM SKU for display
            sku: sku,
            price: priceNum,
            storage: storage,
            condition: condition,
            colour: colour,
            competitorMappings: {}
        };
        
        // Initialize competitor mappings for new product
        competitors.forEach(competitor => {
            newProduct.competitorMappings[competitor.id] = "";
        });
        
        // Add to local array
        mmProducts.push(newProduct);
        
        // Update next ID
        if (variantResponse?.id) {
            nextProductId = Math.max(nextProductId, variantResponse.id + 1);
        }
        
        // Refresh the view with pagination
        handleSearch(); // This will update filteredProducts and pagination
        closeModal();
        showToast('Product created successfully in database!', 'success');
        
        console.log('Created new product locally:', newProduct);
        
    } catch (error) {
        console.error('Error creating product:', error);
        showCustomAlert(`Failed to create product: ${error.message}`, 'error');
    } finally {
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Add Product';
            submitBtn.disabled = false;
        }
    }
}

// Utility functions for data export/import (for future use)
function exportData() {
    const data = {
        competitors: competitors,
        mmProducts: mmProducts,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'mm-sku-mappings.json';
    link.click();
}

function importData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        if (data.mmProducts && Array.isArray(data.mmProducts)) {
            mmProducts = data.mmProducts;
            nextProductId = Math.max(...mmProducts.map(p => p.id)) + 1;
            handleSearch();
            showToast('Data imported successfully!', 'success');
            console.log('Data imported successfully');
        }
    } catch (error) {
        console.error('Error importing data:', error);
        showCustomAlert('Error importing data. Please check the file format.', 'error');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + K to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
    
    // Ctrl/Cmd + N to add new product
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        openModal();
    }
    
    // Escape to close modal
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// Custom Alert Functions
function showCustomAlert(message, type = 'info') {
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');
    
    // Set content
    alertMessage.textContent = message;
    
    // Set type-specific content
    switch (type) {
        case 'error':
            alertTitle.textContent = 'Error';
            alertIcon.textContent = '❌';
            customAlert.className = 'modal alert-modal error show';
            break;
        case 'warning':
            alertTitle.textContent = 'Warning';
            alertIcon.textContent = '⚠️';
            customAlert.className = 'modal alert-modal warning show';
            break;
        case 'success':
            alertTitle.textContent = 'Success';
            alertIcon.textContent = '✅';
            customAlert.className = 'modal alert-modal success show';
            break;
        default:
            alertTitle.textContent = 'Information';
            alertIcon.textContent = 'ℹ️';
            customAlert.className = 'modal alert-modal show';
    }
    
    customAlert.style.display = 'block';
    
    // Focus the OK button
    setTimeout(() => {
        document.getElementById('alertOkBtn').focus();
    }, 100);
}

function closeCustomAlert() {
    customAlert.style.display = 'none';
    customAlert.className = 'modal alert-modal';
}

function showCustomConfirm(message, callback) {
    const confirmMessage = document.getElementById('confirmMessage');
    confirmMessage.textContent = message;
    
    confirmCallback = callback;
    customConfirm.style.display = 'block';
    customConfirm.className = 'modal confirm-modal show';
    
    // Focus the cancel button by default
    setTimeout(() => {
        document.getElementById('confirmCancelBtn').focus();
    }, 100);
}

function closeCustomConfirm() {
    customConfirm.style.display = 'none';
    customConfirm.className = 'modal confirm-modal';
    confirmCallback = null;
}

function handleConfirmOk() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeCustomConfirm();
}

function showToast(message, type = 'success') {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    
    // Set toast type
    successToast.className = `toast ${type}-toast`;
    
    // Show toast
    successToast.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        hideToast();
    }, 3000);
}

function hideToast() {
    successToast.classList.remove('show');
}

// Enhanced keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + K to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
    
    // Ctrl/Cmd + N to add new product
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        openModal();
    }
    
    // Escape to close modals
    if (event.key === 'Escape') {
        if (modal.style.display === 'block') {
            closeModal();
        } else if (customAlert.style.display === 'block') {
            closeCustomAlert();
        } else if (customConfirm.style.display === 'block') {
            closeCustomConfirm();
        }
    }
    
    // Enter to confirm in alert/confirm modals
    if (event.key === 'Enter') {
        if (customAlert.style.display === 'block') {
            closeCustomAlert();
        } else if (customConfirm.style.display === 'block') {
            handleConfirmOk();
        }
    }
});