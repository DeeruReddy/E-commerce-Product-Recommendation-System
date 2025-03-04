
// Global variables
let products = [];
let cart = [];

// DOM elements
const featuredProductsEl = document.getElementById('featured-products');
const recommendedProductsEl = document.getElementById('recommended-products');
const productsGridEl = document.getElementById('products-grid');
const cartCountEl = document.getElementById('cart-count');
const cartIconEl = document.getElementById('cart-icon');
const cartModalEl = document.getElementById('cart-modal');
const closeModalEl = document.querySelector('.close');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtnEl = document.getElementById('checkout-btn');

// Category and sort filters
const categoryFilterEl = document.getElementById('category-filter');
const sortFilterEl = document.getElementById('sort-filter');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Load cart from local storage
  loadCart();
  
  // Check which page we're on
  if (window.location.pathname.includes('products.html')) {
    initProductsPage();
  } else {
    initHomePage();
  }
  
  // Initialize cart modal
  initCartModal();
});

// Initialize the home page
function initHomePage() {
  // Fetch all products
  fetchProducts().then(() => {
    // Display featured products
    if (featuredProductsEl) {
      displayFeaturedProducts();
    }
    
    // Get recommended products
    if (recommendedProductsEl) {
      getRecommendations();
    }
  });
}

// Initialize the products page
function initProductsPage() {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  const productIdParam = urlParams.get('id');
  
  // Set category filter if specified in URL
  if (categoryParam && categoryFilterEl) {
    categoryFilterEl.value = categoryParam;
  }
  
  // Fetch products and display them
  fetchProducts().then(() => {
    // If product ID is provided, show detailed product view
    if (productIdParam) {
      displayProductDetails(parseInt(productIdParam));
    } else {
      filterAndDisplayProducts();
    }
  });
  
  // Add event listeners for filters
  if (categoryFilterEl) {
    categoryFilterEl.addEventListener('change', filterAndDisplayProducts);
  }
  
  if (sortFilterEl) {
    sortFilterEl.addEventListener('change', filterAndDisplayProducts);
  }
}

// Display product details and similar products
function displayProductDetails(productId) {
  if (!productsGridEl) return;
  
  // Find the product
  const product = products.find(p => p.id === productId);
  if (!product) {
    productsGridEl.innerHTML = '<p class="no-products">Product not found.</p>';
    return;
  }
  
  // Display product details
  productsGridEl.innerHTML = `
    <div class="product-details">
      <div class="product-details-image">
        <img src="${product.image ? product.image : '/images/default.jpg'}"> 
        alt="${product.name}" 
        onerror="this.onerror=null; this.src='/images/default.jpg';">

      </div>
      <div class="product-details-info">
        <h2>${product.name}</h2>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <p class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
        <p class="product-description">${product.description}</p>
        ${product.features ? `
          <div class="product-features">
            <h3>Features</h3>
            <ul>
              ${product.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    </div>
    <div class="similar-products">
      <h3>Similar Products</h3>
      <div class="products" id="similar-products">
        <div class="loading">Loading similar products...</div>
      </div>
    </div>
  `;
  
  // Add event listener for add to cart button
  const addToCartBtn = productsGridEl.querySelector('.add-to-cart');
  addToCartBtn.addEventListener('click', () => {
    addToCart(product);
  });
  
  // Fetch and display similar products
  fetchSimilarProducts(productId);
}

// Fetch similar products using TF-IDF recommendations
async function fetchSimilarProducts(productId) {
  const similarProductsEl = document.getElementById('similar-products');
  if (!similarProductsEl) return;
  
  // Show loading indicator
  similarProductsEl.innerHTML = '<div class="loading">Finding similar products for you...</div>';
  
  try {
    // If we can't connect to the recommendation API, fall back to category-based recommendations
    let data;
    try {
      const response = await fetch(`/api/recommend?productId=${productId}`);
      data = await response.json();
    } catch (fetchError) {
      console.error('Error fetching similar products:', fetchError);
      
      // Fallback to same-category products
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error('Product not found');
      
      const sameCategoryProducts = products.filter(p => 
        p.id !== productId && p.category === product.category
      ).slice(0, 4);
      
      data = {
        success: true,
        sourceProduct: { name: product.name },
        recommendations: sameCategoryProducts
      };
    }
    
    if (!data.success || !data.recommendations || data.recommendations.length === 0) {
      // Try to find products in the same category as fallback
      const product = products.find(p => p.id === productId);
      if (product) {
        const sameCategoryProducts = products.filter(p => 
          p.id !== productId && p.category === product.category
        ).slice(0, 4);
        
        if (sameCategoryProducts.length > 0) {
          data = {
            success: true,
            sourceProduct: { name: product.name },
            recommendations: sameCategoryProducts
          };
        } else {
          similarProductsEl.innerHTML = '<p>No similar products found.</p>';
          return;
        }
      } else {
        similarProductsEl.innerHTML = '<p>No similar products found.</p>';
        return;
      }
    }
    
    similarProductsEl.innerHTML = '';
    
    // Add recommendation header with source product
    const recommendationHeader = document.createElement('div');
    recommendationHeader.className = 'recommendation-header';
    recommendationHeader.innerHTML = '<h4>Based on your interest in ' + 
      (data.sourceProduct ? data.sourceProduct.name : 'this product') + '</h4>';
    similarProductsEl.appendChild(recommendationHeader);
    
    // Create a container for the recommended products
    const productsContainer = document.createElement('div');
    productsContainer.className = 'recommended-products-container';
    
    // Add each recommended product
    data.recommendations.forEach(product => {
      productsContainer.appendChild(createProductElement(product));
    });
    
    similarProductsEl.appendChild(productsContainer);
  } catch (error) {
    console.error('Error processing similar products:', error);
    similarProductsEl.innerHTML = '<p>Failed to load similar products. Please try again later.</p>';
  }
}

// Initialize cart modal
function initCartModal() {
  // Open cart modal when cart icon is clicked
  if (cartIconEl) {
    cartIconEl.addEventListener('click', (e) => {
      e.preventDefault();
      displayCart();
      cartModalEl.style.display = 'block';
    });
  }
  
  // Close cart modal when close button is clicked
  if (closeModalEl) {
    closeModalEl.addEventListener('click', () => {
      cartModalEl.style.display = 'none';
    });
  }
  
  // Close cart modal when clicking outside the modal
  window.addEventListener('click', (e) => {
    if (e.target === cartModalEl) {
      cartModalEl.style.display = 'none';
    }
  });
  
  // Checkout button functionality
  if (checkoutBtnEl) {
    checkoutBtnEl.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      
      alert('Thank you for your purchase! Your order has been placed.');
      cart = [];
      saveCart();
      updateCartCount();
      cartModalEl.style.display = 'none';
    });
  }
}

// Fetch products from API
async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    products = await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Fallback to sample data if API fails
    products = getSampleProducts();
  }
}

// Get sample products (fallback if API fails)
function getSampleProducts() {
  return [
    {
      id: 1,
      name: 'Smartphone X',
      price: 699.99,
      category: 'electronics',
      image: 'https://via.placeholder.com/300?text=Smartphone',
      description: 'Latest smartphone with advanced features and high-resolution camera.'
    },
    {
      id: 2,
      name: 'Laptop Pro',
      price: 1299.99,
      category: 'electronics',
      image: 'https://via.placeholder.com/300?text=Laptop',
      description: 'Powerful laptop for professional use with high performance specs.'
    },
    {
      id: 3,
      name: 'Wireless Headphones',
      price: 149.99,
      category: 'electronics',
      image: 'https://via.placeholder.com/300?text=Headphones',
      description: 'Premium wireless headphones with noise cancellation technology.'
    },
    {
      id: 4,
      name: 'Men\'s Casual Shirt',
      price: 39.99,
      category: 'clothing',
      image: 'https://via.placeholder.com/300?text=Shirt',
      description: 'Comfortable casual shirt made from high-quality cotton.'
    },
    {
      id: 5,
      name: 'Women\'s Dress',
      price: 59.99,
      category: 'clothing',
      image: 'https://via.placeholder.com/300?text=Dress',
      description: 'Elegant dress for special occasions with modern design.'
    },
    {
      id: 6,
      name: 'Running Shoes',
      price: 89.99,
      category: 'clothing',
      image: 'https://via.placeholder.com/300?text=Shoes',
      description: 'Comfortable running shoes with advanced cushioning technology.'
    },
    {
      id: 7,
      name: 'Coffee Maker',
      price: 79.99,
      category: 'home',
      image: 'https://via.placeholder.com/300?text=Coffee+Maker',
      description: 'Automatic coffee maker with multiple brewing options.'
    },
    {
      id: 8,
      name: 'Blender',
      price: 49.99,
      category: 'home',
      image: 'https://via.placeholder.com/300?text=Blender',
      description: 'High-powered blender for smoothies and food processing.'
    },
    {
      id: 9,
      name: 'Toaster',
      price: 29.99,
      category: 'home',
      image: 'https://via.placeholder.com/300?text=Toaster',
      description: '2-slice toaster with adjustable browning control.'
    },
    {
      id: 10,
      name: 'Facial Cleanser',
      price: 19.99,
      category: 'beauty',
      image: 'https://via.placeholder.com/300?text=Cleanser',
      description: 'Gentle facial cleanser for all skin types.'
    },
    {
      id: 11,
      name: 'Moisturizer',
      price: 24.99,
      category: 'beauty',
      image: 'https://via.placeholder.com/300?text=Moisturizer',
      description: 'Hydrating moisturizer with SPF protection.'
    },
    {
      id: 12,
      name: 'Perfume',
      price: 69.99,
      category: 'beauty',
      image: 'https://via.placeholder.com/300?text=Perfume',
      description: 'Luxurious perfume with long-lasting fragrance.'
    }
  ];
}

// Display featured products on home page
function displayFeaturedProducts() {
  if (!featuredProductsEl) return;
  
  // Get 4 random products as featured
  const featured = getRandomItems(products, 4);
  
  featuredProductsEl.innerHTML = '';
  
  featured.forEach(product => {
    featuredProductsEl.appendChild(createProductElement(product));
  });
}

// Get recommendations from API
async function getRecommendations() {
  if (!recommendedProductsEl) return;
  
  try {
    const response = await fetch('/api/recommendations');
    const recommendations = await response.json();
    
    displayRecommendedProducts(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    
    // Fallback to random products if API fails
    const recommended = getRandomItems(products, 4);
    displayRecommendedProducts(recommended);
  }
}

// Display recommended products
function displayRecommendedProducts(recommendedProducts) {
  if (!recommendedProductsEl) return;
  
  recommendedProductsEl.innerHTML = '';
  
  if (recommendedProducts.length === 0) {
    recommendedProductsEl.innerHTML = '<p>No recommendations available at this time.</p>';
    return;
  }
  
  recommendedProducts.forEach(product => {
    recommendedProductsEl.appendChild(createProductElement(product));
  });
}

// Filter and display products on products page
function filterAndDisplayProducts() {
  if (!productsGridEl) return;
  
  // Get filter values
  const categoryFilter = categoryFilterEl ? categoryFilterEl.value : 'all';
  const sortFilter = sortFilterEl ? sortFilterEl.value : 'default';
  
  // Filter products by category
  let filteredProducts = products;
  if (categoryFilter !== 'all') {
    filteredProducts = products.filter(product => product.category === categoryFilter);
  }
  
  // Sort products
  switch (sortFilter) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }
  
  // Display filtered and sorted products
  productsGridEl.innerHTML = '';
  
  if (filteredProducts.length === 0) {
    productsGridEl.innerHTML = '<p class="no-products">No products found matching the selected criteria.</p>';
    return;
  }
  
  filteredProducts.forEach(product => {
    productsGridEl.appendChild(createProductElement(product));
  });
}

// Create product element
function createProductElement(product) {
  const productEl = document.createElement('div');
  productEl.className = 'product';
  
  // Ensure product has an image, use placeholder as fallback
  const productImage = product.image || `https://via.placeholder.com/600x400?text=${encodeURIComponent(product.name)}`;
  
  productEl.innerHTML = `
    <div class="product-img">
      <a href="products.html?id=${product.id}">
        <img src="${productImage}" alt="${product.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=${encodeURIComponent(product.name)}';">
      </a>
    </div>
    <div class="product-info">
      <a href="products.html?id=${product.id}" class="product-link">
        <h3>${product.name}</h3>
      </a>
      <p class="product-price">$${product.price.toFixed(2)}</p>
      <p class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
      <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
    </div>
  `;
  
  // Add event listener for add to cart button
  const addToCartBtn = productEl.querySelector('.add-to-cart');
  addToCartBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent navigating to product page when clicking the button
    addToCart(product);
  });
  
  return productEl;
}

// Add product to cart
function addToCart(product) {
  // Check if product is already in cart
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  // Save cart to local storage
  saveCart();
  
  // Update cart count
  updateCartCount();
  
  // Show confirmation
  showAddToCartConfirmation(product.name);
}

// Display cart items in modal
function displayCart() {
  if (!cartItemsEl || !cartTotalEl) return;
  
  cartItemsEl.innerHTML = '';
  
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
    cartTotalEl.textContent = '0.00';
    return;
  }
  
  let total = 0;
  
  cart.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
      </div>
      <div class="cart-item-actions">
        <button class="decrease-qty" data-id="${item.id}">-</button>
        <span class="item-qty">${item.quantity}</span>
        <button class="increase-qty" data-id="${item.id}">+</button>
        <button class="remove-item" data-id="${item.id}">×</button>
      </div>
    `;
    
    cartItemsEl.appendChild(itemEl);
    
    // Add event listeners for cart item actions
    const decreaseBtn = itemEl.querySelector('.decrease-qty');
    decreaseBtn.addEventListener('click', () => {
      updateItemQuantity(item.id, -1);
    });
    
    const increaseBtn = itemEl.querySelector('.increase-qty');
    increaseBtn.addEventListener('click', () => {
      updateItemQuantity(item.id, 1);
    });
    
    const removeBtn = itemEl.querySelector('.remove-item');
    removeBtn.addEventListener('click', () => {
      removeFromCart(item.id);
    });
  });
  
  cartTotalEl.textContent = total.toFixed(2);
}

// Update item quantity in cart
function updateItemQuantity(itemId, change) {
  const item = cart.find(item => item.id === itemId);
  
  if (!item) return;
  
  item.quantity += change;
  
  if (item.quantity <= 0) {
    removeFromCart(itemId);
  } else {
    saveCart();
    updateCartCount();
    displayCart();
  }
}

// Remove item from cart
function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveCart();
  updateCartCount();
  displayCart();
}

// Update cart count
function updateCartCount() {
  if (!cartCountEl) return;
  
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCountEl.textContent = count;
}

// Save cart to local storage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from local storage
function loadCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
}

// Show add to cart confirmation
function showAddToCartConfirmation(productName) {
  // Create confirmation element
  const confirmationEl = document.createElement('div');
  confirmationEl.className = 'add-to-cart-confirmation';
  confirmationEl.textContent = `${productName} added to cart!`;
  
  // Add to body
  document.body.appendChild(confirmationEl);
  
  // Remove after 2 seconds
  setTimeout(() => {
    confirmationEl.remove();
  }, 2000);
}

// Helper function to get random items from array
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
