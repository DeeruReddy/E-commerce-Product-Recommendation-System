
const express = require('express');
const path = require('path');
const fs = require('fs');
const natural = require('natural');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Unsplash API configuration - using a public access key for demo purposes
// In production, use environment variables for API keys
const UNSPLASH_ACCESS_KEY = 'Enter_Your_Unsplash_Access_Key_Here'; // Replace with your actual Unsplash API key

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static('./'));

// Serve images from your specific folder
app.use('/images', express.static('/Users/deerajreddy/Jain University/internship/3rd year/six_phrase/E-commerce-Product-Recommendation-System/images'));



// TF-IDF setup for content-based recommendations
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

// Sample products data (in a real application, this would come from a database)
const products = [
  // Electronics Category
  {
    id: 1,
    name: 'Smartphone X Pro',
    price: 699.99,
    category: 'electronics',
    image: '/images/smartphone-x-pro.jpg',
    description: 'Latest smartphone with advanced features, high-resolution camera, and 5G connectivity for ultra-fast browsing.',
    features: ['5G', 'high-resolution camera', 'long battery life', 'water resistant']
  },
  {
    id: 2,
    name: 'Laptop Pro Max',
    price: 1299.99,
    category: 'electronics',
    image: '/images/laptop-pro-max.jpg',
    description: 'Powerful laptop for professional use with high performance specs, ideal for creative professionals and developers.',
    features: ['fast processor', 'SSD storage', 'high-resolution display', 'backlit keyboard']
  },
  {
    id: 3,
    name: 'Wireless Noise-Cancelling Headphones',
    price: 149.99,
    category: 'electronics',
    image: '/images/wireless-noise-cancelling-headphones.jpg',
    description: 'Premium wireless headphones with advanced noise cancellation technology and crystal clear sound quality.',
    features: ['wireless', 'noise cancellation', 'long battery life', 'foldable design']
  },
  {
    id: 4,
    name: 'Smart TV 4K UHD',
    price: 549.99,
    category: 'electronics',
    image: '/images/smart-tv-4k-uhd.jpeg',
    description: 'Ultra high definition smart TV with built-in streaming apps and voice control for an immersive viewing experience.',
    features: ['4K resolution', 'smart features', 'voice control', 'HDR support']
  },
  
  // Clothing Category
  {
    id: 5,
    name: 'Mens Casual Button Down Shirt',
    price: 39.99,
    category: 'clothing',
    image: '/images/mens-casual-button-down-shirt.jpg',
    description: 'Comfortable casual shirt made from high-quality cotton, perfect for everyday wear or casual office settings.',
    features: ['cotton', 'button-down', 'breathable', 'machine washable']
  },
  {
    id: 6,
    name: 'Womens Cocktail Dress',
    price: 59.99,
    category: 'clothing',
    image: '/images/womens-cocktail-dress.jpg',
    description: 'Elegant dress for special occasions with modern design, flattering silhouette, and comfortable fit.',
    features: ['elegant', 'modern', 'special occasions', 'polyester blend']
  },
  {
    id: 7,
    name: 'Athletic Running Shoes',
    price: 89.99,
    category: 'clothing',
    image: '/images/athletic-running-shoes.jpeg',
    description: 'Comfortable running shoes with advanced cushioning technology designed for maximum performance and injury prevention.',
    features: ['cushioning', 'athletic', 'breathable', 'lightweight']
  },
  {
    id: 8,
    name: 'Slim Fit Jeans',
    price: 49.99,
    category: 'clothing',
    image: '/images/slim-fit-jeans.jpg',
    description: 'Classic slim fit jeans made from premium denim with just the right amount of stretch for comfort and durability.',
    features: ['denim', 'slim fit', 'stretch', 'multiple pockets']
  },
  
  // Home & Kitchen Category
  {
    id: 9,
    name: 'Programmable Coffee Maker',
    price: 79.99,
    category: 'home',
    image: '/images/programmable-coffee-maker.jpg',
    description: 'Automatic coffee maker with multiple brewing options, programmable timer, and keep-warm function for fresh coffee anytime.',
    features: ['programmable', 'multiple brewing options', 'timer', 'large capacity']
  },
  {
    id: 10,
    name: 'High-Power Blender',
    price: 49.99,
    category: 'home',
    image: '/images/high-power-blender.jpg',
    description: 'High-powered blender for smoothies, soups, and food processing with multiple speed settings and pulse function.',
    features: ['high-powered', 'multiple speeds', 'dishwasher safe', 'BPA-free']
  },
  {
    id: 11,
    name: 'Smart Toaster',
    price: 29.99,
    category: 'home',
    image: '/images/smart-toaster.jpg',
    description: 'Modern 2-slice toaster with adjustable browning control, defrost setting, and bagel function for perfect toast every time.',
    features: ['adjustable browning', '2-slice', 'auto shut-off', 'defrost setting']
  },
  {
    id: 12,
    name: 'Non-Stick Cookware Set',
    price: 119.99,
    category: 'home',
    image: '/images/non-stick-cookware-set.jpg',
    description: 'Complete non-stick cookware set including pots, pans, and utensils - perfect for everyday cooking and special occasions.',
    features: ['non-stick', 'dishwasher safe', 'even heating', 'stay-cool handles']
  },
  
  // Beauty Category
  {
    id: 13,
    name: 'Gentle Facial Cleanser',
    price: 19.99,
    category: 'beauty',
    image: '/images/gentle-facial-cleanser.jpg',
    description: 'Gentle facial cleanser for all skin types that removes makeup and impurities while maintaining natural moisture balance.',
    features: ['gentle', 'all skin types', 'hydrating', 'fragrance-free']
  },
  {
    id: 14,
    name: 'Anti-Aging Moisturizer',
    price: 24.99,
    category: 'beauty',
    image: '/images/anti-aging-moisturizer.jpg',
    description: 'Hydrating moisturizer with SPF protection, vitamin E, and collagen to reduce signs of aging and protect skin from UV damage.',
    features: ['SPF protection', 'hydrating', 'anti-aging', 'vitamin-enriched']
  },
  {
    id: 15,
    name: 'Luxury Perfume Collection',
    price: 69.99,
    category: 'beauty',
    image: '/images/luxury-perfume-collection.jpeg',
    description: 'Luxurious perfume with long-lasting fragrance featuring top notes of citrus, middle notes of floral, and base notes of musk.',
    features: ['long-lasting', 'luxury', 'floral notes', 'elegant bottle']
  },
  {
    id: 16,
    name: 'Professional Makeup Brush Set',
    price: 35.99,
    category: 'beauty',
    image: '/images/professional-makeup-brush-set.jpg',
    description: 'Complete set of professional makeup brushes for foundation, contouring, eyeshadow, and more - perfect for beginners and experts.',
    features: ['synthetic bristles', 'ergonomic handles', 'complete set', 'cruelty-free']
  }
];

// User interactions data (would normally be stored in a database)
// This simulates user behavior data for the recommendation system
let userInteractions = [];

// Simple in-memory cache for recommendations
const recommendationCache = new Map();

// API endpoints
// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

// Get products by category
app.get('/api/categories/:category', (req, res) => {
  const category = req.params.category;
  const filteredProducts = products.filter(p => p.category === category);
  
  res.json(filteredProducts);
});

// Record product view (for recommendation system)
app.post('/api/products/:id/view', express.json(), (req, res) => {
  const productId = parseInt(req.params.id);
  const userId = req.body.userId || 'anonymous';
  
  // Record the interaction
  userInteractions.push({
    userId,
    productId,
    type: 'view',
    timestamp: Date.now()
  });
  
  // Clear cache for this user
  recommendationCache.delete(userId);
  
  res.status(200).json({ success: true });
});

// Get recommendations
app.get('/api/recommendations', (req, res) => {
  const userId = req.query.userId || 'anonymous';
  
  // Check cache first
  if (recommendationCache.has(userId)) {
    return res.json(recommendationCache.get(userId));
  }
  
  // Get recommendations based on simple collaborative filtering
  const recommendations = getRecommendations(userId);
  
  // Cache the recommendations
  recommendationCache.set(userId, recommendations);
  
  res.json(recommendations);
});

// Get recommendations for a specific product (similar products)
app.get('/api/products/:id/similar', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const similarProducts = getSimilarProducts(product);
  res.json(similarProducts);
});

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Create TF-IDF documents from product descriptions
function prepareTfIdfDocuments() {
  console.log('Preparing TF-IDF documents for content-based filtering...');
  
  try {
    // Clear any existing documents
    tfidf = new natural.TfIdf();
    
    products.forEach(product => {
      // Combine name, description and features for better recommendations
      // Add category twice to give it more weight in the TF-IDF calculation
      let content = `${product.name} ${product.category} ${product.category} ${product.description}`;
      
      if (product.features) {
        // Join features and repeat important ones to give them more weight
        content += ` ${product.features.join(' ')} ${product.features.join(' ')}`;
      }
      
      // Add document to TF-IDF
      tfidf.addDocument(content.toLowerCase());
    });
    
    // Output some statistics about the TF-IDF model
    const productIndex = 0; // Example: first product
    console.log(`TF-IDF terms for product "${products[productIndex].name}":`);
    const terms = tfidf.listTerms(productIndex).slice(0, 5);
    terms.forEach(term => {
      console.log(`- ${term.term}: ${term.tfidf}`);
    });
    
    console.log('TF-IDF documents prepared successfully.');
  } catch (error) {
    console.error('Error preparing TF-IDF documents:', error);
  }
}

// Content-based recommendation endpoint
app.get('/api/recommend', (req, res) => {
  const productId = parseInt(req.query.productId);
  
  if (!productId) {
    return res.status(400).json({ 
      success: false,
      error: 'Product ID is required',
      recommendations: []
    });
  }
  
  try {
    const recommendations = getContentBasedRecommendations(productId);
    
    // Return detailed response with the source product and recommendations
    const sourceProduct = products.find(p => p.id === productId);
    
    return res.json({
      success: true,
      sourceProduct: sourceProduct ? {
        id: sourceProduct.id,
        name: sourceProduct.name,
        category: sourceProduct.category,
        image: sourceProduct.image // Include image URL
      } : null,
      recommendations: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error in recommendation API:', error);
    // Even on error, return a valid response structure with empty recommendations
    return res.json({ 
      success: false,
      error: 'Failed to generate recommendations',
      message: error.message,
      recommendations: getSameCategoryProducts(productId, 4)
    });
  }
});

// Get products in the same category (fallback method)
function getSameCategoryProducts(productId, count = 4) {
  const product = products.find(p => p.id === productId);
  if (!product) return [];
  
  return products
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, count)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      image: p.image || `https://via.placeholder.com/600x400?text=${encodeURIComponent(p.name)}`,
      description: p.description
    }));
}

// Start the server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  // Initialize TF-IDF documents
  prepareTfIdfDocuments();
  // Ensure all products have image URLs
  await ensureProductImages();
});

// Recommendation System Functions

// Get content-based recommendations using TF-IDF
function getContentBasedRecommendations(productId, count = 4) {
  // Find the product
  const product = products.find(p => p.id === productId);
  if (!product) {
    console.log(`Product with ID ${productId} not found`);
    return [];
  }
  
  // Get the index of the product in our TF-IDF documents
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    console.log(`Product index for ID ${productId} not found`);
    return [];
  }
  
  // Calculate similarity scores
  const similarities = [];
  const productDocument = productIndex;
  
  try {
    // Generate a vector for each product and calculate cosine similarity
    for (let i = 0; i < products.length; i++) {
      // Skip the target product itself
      if (i === productIndex) continue;
      
      // Skip products that don't share the same category (optional - for better recommendations)
      // Comment this out if you want cross-category recommendations
      // if (products[i].category !== product.category) continue;
      
      // Calculate similarity using TF-IDF
      let similarity = 0;
      let dotProduct = 0;
      let magnitude1 = 0;
      let magnitude2 = 0;
      
      const terms = tfidf.listTerms(productDocument);
      
      // Calculate dot product and magnitudes for cosine similarity
      for (const term of terms) {
        // Get TF-IDF score for the term in both documents
        const score1 = term.tfidf;
        const score2 = tfidf.tfidf(term.term, i);
        
        // Add to dot product
        dotProduct += score1 * score2;
        
        // Add to magnitudes
        magnitude1 += Math.pow(score1, 2);
      }
      
      // Get all terms from document i
      const terms2 = tfidf.listTerms(i);
      for (const term of terms2) {
        magnitude2 += Math.pow(term.tfidf, 2);
      }
      
      // Calculate cosine similarity if magnitudes are not zero
      if (magnitude1 > 0 && magnitude2 > 0) {
        similarity = dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
      }
      
      // Add category boost (same category gets 0.2 additional score)
      if (products[i].category === product.category) {
        similarity += 0.2;
      }
      
      similarities.push({
        id: products[i].id,
        score: similarity
      });
    }
    
    // Sort by similarity score (descending)
    similarities.sort((a, b) => b.score - a.score);
    
    // Get top 'count' recommendations
    const topRecommendations = similarities.slice(0, count);
    
    // Return the products with relevant info for the API
    return topRecommendations.map(sim => {
      const recommendedProduct = products.find(p => p.id === sim.id);
      return {
        id: recommendedProduct.id,
        name: recommendedProduct.name,
        price: recommendedProduct.price,
        category: recommendedProduct.category,
        image: recommendedProduct.image,
        description: recommendedProduct.description,
        similarityScore: sim.score.toFixed(4)
      };
    });
  } catch (error) {
    console.error('Error in recommendation algorithm:', error);
    
    // Fallback to category-based recommendations if TF-IDF fails
    const sameCategoryProducts = products.filter(p => 
      p.id !== productId && p.category === product.category
    ).slice(0, count);
    
    return sameCategoryProducts;
  }
}

// Get recommendations for a user
function getRecommendations(userId) {
  // Get user's interactions
  const userViews = userInteractions.filter(interaction => 
    interaction.userId === userId && interaction.type === 'view'
  );
  
  // If user has no interactions, return random products
  if (userViews.length === 0) {
    return getRandomProducts(4);
  }
  
  // Get products the user has viewed
  const viewedProductIds = userViews.map(view => view.productId);
  const viewedProducts = products.filter(product => viewedProductIds.includes(product.id));
  
  // Get categories the user is interested in
  const interestedCategories = {};
  viewedProducts.forEach(product => {
    if (!interestedCategories[product.category]) {
      interestedCategories[product.category] = 0;
    }
    interestedCategories[product.category]++;
  });
  
  // Sort categories by interest level
  const sortedCategories = Object.entries(interestedCategories)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Get recommended products from those categories, excluding already viewed products
  const recommendedProducts = [];
  
  // First try to get products from the user's most interested categories
  for (const category of sortedCategories) {
    const categoryProducts = products.filter(product => 
      product.category === category && !viewedProductIds.includes(product.id)
    );
    
    recommendedProducts.push(...categoryProducts);
    
    if (recommendedProducts.length >= 4) {
      break;
    }
  }
  
  // If we don't have enough recommendations, add random products
  if (recommendedProducts.length < 4) {
    const remainingNeeded = 4 - recommendedProducts.length;
    const randomProducts = getRandomProducts(remainingNeeded, viewedProductIds.concat(recommendedProducts.map(p => p.id)));
    recommendedProducts.push(...randomProducts);
  }
  
  // Return at most 4 recommendations
  return recommendedProducts.slice(0, 4);
}

// Get similar products based on category and features
function getSimilarProducts(product) {
  const similarProducts = [];
  
  // Find products in the same category
  const sameCategory = products.filter(p => 
    p.id !== product.id && p.category === product.category
  );
  
  // Sort by feature similarity if available
  if (product.features && sameCategory.length > 0) {
    sameCategory.forEach(p => {
      let similarityScore = 0;
      
      if (p.features) {
        // Count matching features
        for (const feature of product.features) {
          if (p.features.some(f => f.toLowerCase().includes(feature.toLowerCase()) || 
              feature.toLowerCase().includes(f.toLowerCase()))) {
            similarityScore++;
          }
        }
      }
      
      similarProducts.push({
        ...p,
        similarityScore
      });
    });
    
    // Sort by similarity score (descending)
    similarProducts.sort((a, b) => b.similarityScore - a.similarityScore);
    
    // Remove the similarity score property before returning
    return similarProducts.slice(0, 4).map(p => {
      const { similarityScore, ...rest } = p;
      return rest;
    });
  }
  
  // If no features, just return same category products
  return sameCategory.slice(0, 4);
}

// Fetch image from Unsplash based on product category and name
async function fetchUnsplashImage(query) {
  return new Promise((resolve) => {
    // Default fallback image if the fetch fails
    const fallbackImage = `https://via.placeholder.com/600x400?text=${encodeURIComponent(query)}`;
    
    // If no API key is set, use fallback
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'Enter_Your_Unsplash_Access_Key_Here') {
      console.log('No Unsplash API key provided, using fallback image');
      return resolve(fallbackImage);
    }
    
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`;
    
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.log(`Unsplash API error: Status ${res.statusCode}`);
        return resolve(fallbackImage);
      }
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const imageData = JSON.parse(data);
          // Use the regular sized image
          if (imageData && imageData.urls && imageData.urls.regular) {
            return resolve(imageData.urls.regular);
          }
          return resolve(fallbackImage);
        } catch (e) {
          console.error('Error parsing Unsplash response:', e);
          return resolve(fallbackImage);
        }
      });
    }).on('error', (err) => {
      console.error('Error fetching from Unsplash:', err);
      return resolve(fallbackImage);
    });
  });
}

// Get product image URL based on product details
async function getProductImageUrl(product) {
  // If product already has a valid image URL, use it
  if (product.image && !product.image.includes('via.placeholder.com')) {
    return product.image;
  }
  
  // Try to fetch from Unsplash based on product details
  const searchQuery = `${product.category} ${product.name}`;
  try {
    const imageUrl = await fetchUnsplashImage(searchQuery);
    return imageUrl;
  } catch (error) {
    console.error('Error getting product image:', error);
    // Fallback to a placeholder with the product name
    return `https://via.placeholder.com/600x400?text=${encodeURIComponent(product.name)}`;
  }
}

// Ensure all products have image URLs
async function ensureProductImages() {
  console.log('Ensuring all products have image URLs...');
  for (const product of products) {
    if (!product.image || product.image.includes('via.placeholder.com')) {
      product.image = await getProductImageUrl(product);
    }
  }
  console.log('Product images updated.');
}

// Get random products
function getRandomProducts(count, excludeIds = []) {
  const availableProducts = products.filter(product => !excludeIds.includes(product.id));
  
  // Shuffle available products
  const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
  
  // Return the specified count
  return shuffled.slice(0, count);
}
