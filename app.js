// app.js - Restored for Gilgit Craft Corner

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // 2. Fetch and Render Products
    let allProducts = [];
    let cart = [];
    const productsGrid = document.getElementById('products-grid');
    const filterBar = document.getElementById('filter-bar');
    const emptyState = document.getElementById('empty-state');
    
    fetch('products.json')
        .then(res => res.json())
        .then(data => {
            allProducts = data;
            renderFilters();
            renderProducts(allProducts);
        })
        .catch(err => console.error('Error fetching products:', err));

    function renderFilters() {
        if (!filterBar) return;
        const categories = ['All', ...new Set(allProducts.map(p => p.category))];
        filterBar.innerHTML = categories.map(cat => `
            <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `).join('');

        filterBar.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const category = e.target.getAttribute('data-category');
                
                if (category === 'All') {
                    renderProducts(allProducts);
                } else {
                    renderProducts(allProducts.filter(p => p.category === category));
                }
            });
        });
    }

    function renderProducts(products) {
        if (!productsGrid) return;
        
        if (products.length === 0) {
            productsGrid.innerHTML = '';
            emptyState.removeAttribute('hidden');
            return;
        }
        
        emptyState.setAttribute('hidden', 'true');
        
        productsGrid.innerHTML = products.map(p => `
            <div class="product-card reveal active">
                <img src="${p.image}" alt="${p.name}" class="product-card__img" loading="lazy" />
                <div class="product-card__body">
                    <span class="product-card__category">${p.category}</span>
                    <h3 class="product-card__title">${p.name}</h3>
                    <p class="product-card__artisan">By ${p.artisan}</p>
                    <p class="product-card__price">PKR ${p.price.toLocaleString()}</p>
                    <div class="product-card__actions">
                        <button class="product-card__btn product-card__btn--add" data-id="${p.id}">Add to Cart</button>
                        <a href="https://wa.me/${p.phone}?text=${encodeURIComponent('Hi, I am interested in buying ' + p.name)}" class="product-card__btn product-card__btn--wa" target="_blank" rel="noopener">
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        // Attach Add to Cart events
        productsGrid.querySelectorAll('.product-card__btn--add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const product = allProducts.find(p => p.id === id);
                addToCart(product);
            });
        });
    }

    // 3. Search functionality
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length > 0) {
                clearBtn.removeAttribute('hidden');
            } else {
                clearBtn.setAttribute('hidden', 'true');
            }
            
            const filtered = allProducts.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query) ||
                p.artisan.toLowerCase().includes(query)
            );
            renderProducts(filtered);
            
            // Reset filters
            if (filterBar) {
                filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                filterBar.querySelector('[data-category="All"]').classList.add('active');
            }
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.setAttribute('hidden', 'true');
            renderProducts(allProducts);
        });
    }

    // 4. Cart Sidebar & Logic
    const cartTrigger = document.getElementById('cart-trigger');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartClose = document.getElementById('cart-close');
    const cartBody = document.getElementById('cart-body');
    const cartFooter = document.getElementById('cart-footer');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

    function toggleCart() {
        if(cartSidebar) cartSidebar.classList.toggle('active');
        if(cartOverlay) cartOverlay.classList.toggle('active');
    }

    if (cartTrigger) cartTrigger.addEventListener('click', toggleCart);
    if (cartClose) cartClose.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    function addToCart(product) {
        cart.push(product);
        updateCartUI();
        toggleCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartUI();
    }

    function updateCartUI() {
        if (!cartBody) return;
        
        if (cart.length === 0) {
            cartBody.innerHTML = '<p style="text-align: center; color: var(--clr-text-muted); margin-top: 50px;">Your cart is empty.</p>';
            if(cartFooter) cartFooter.setAttribute('hidden', 'true');
            if(cartCount) cartCount.setAttribute('hidden', 'true');
        } else {
            cartBody.innerHTML = cart.map((p, index) => `
                <div class="cart-item">
                    <img src="${p.image}" alt="${p.name}" class="cart-item__img" />
                    <div class="cart-item__info">
                        <div class="cart-item__title">${p.name}</div>
                        <div class="cart-item__price">PKR ${p.price.toLocaleString()}</div>
                        <button class="cart-item__remove" data-index="${index}">Remove</button>
                    </div>
                </div>
            `).join('');

            const total = cart.reduce((sum, p) => sum + p.price, 0);
            if(cartSubtotal) cartSubtotal.innerText = `PKR ${total.toLocaleString()}`;
            if(cartTotal) cartTotal.innerText = `PKR ${total.toLocaleString()}`;
            
            // Add Payment Method dropdown if not present
            let paymentSelect = document.getElementById('payment-method');
            if(!paymentSelect && cartFooter) {
                const selectHTML = `
                    <div style="margin-top: 15px; margin-bottom: 15px;">
                        <label for="payment-method" style="display: block; font-weight: 600; margin-bottom: 5px;">Payment Method</label>
                        <select id="payment-method" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-family: inherit; background: #fff;">
                            <option value="Cash on Delivery">Cash on Delivery</option>
                            <option value="EasyPaisa">EasyPaisa</option>
                            <option value="JazzCash">JazzCash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                    </div>
                `;
                const summaryRow = document.querySelector('.cart-summary__total');
                if(summaryRow) {
                    summaryRow.insertAdjacentHTML('afterend', selectHTML);
                }
            }
            
            if(cartFooter) cartFooter.removeAttribute('hidden');
            if(cartCount) {
                cartCount.innerText = cart.length;
                cartCount.removeAttribute('hidden');
            }

            cartBody.querySelectorAll('.cart-item__remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    removeFromCart(index);
                });
            });
        }
    }
    
    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', () => {
            const paymentSelect = document.getElementById('payment-method');
            const paymentMethod = paymentSelect ? paymentSelect.value : 'Cash on Delivery';
            
            const message = encodeURIComponent(`Hi! I would like to order the following items:\n` + cart.map(p => `- ${p.name} (PKR ${p.price})`).join('\n') + `\n\nTotal: PKR ${cart.reduce((s,p)=>s+p.price,0)}\nPayment Method: ${paymentMethod}`);
            window.open(`https://wa.me/923001234567?text=${message}`, '_blank');
        });
    }

    updateCartUI();

    // 5. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal, .reveal-zoom');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
});