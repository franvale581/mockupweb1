const intro = document.getElementById('intro');
const enterBtn = document.getElementById('enterBtn');
const videoIntro = document.getElementById('intro-video');
const videoBackground = document.getElementById('background-video');
const main = document.getElementById('main');

function mostrarContenidoPrincipal() {
  intro.style.display = 'none';
  videoIntro.style.display = 'none';
  videoBackground.style.display = 'block';
  videoBackground.style.opacity = '1';
  videoBackground.playbackRate = 0.9;
  videoBackground.play().catch(err => console.warn("No se pudo reproducir el background-video:", err));
  main.classList.add('active');
  document.body.style.overflow = 'auto';
  iniciarApp();
}

window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('vieneDeInfo')) {
    // Si viene de info, no mostrar intro, limpiar flag y mostrar contenido principal
    sessionStorage.removeItem('vieneDeInfo');
    mostrarContenidoPrincipal();
  } else {
    // Aquí va tu lógica original para mostrar intro

    // Listener para el botón enter
    enterBtn.addEventListener('click', () => {
      intro.style.opacity = '0';

      setTimeout(() => {
        intro.style.display = 'none';
        videoIntro.style.opacity = '1';
        videoIntro.play();
      }, 0);

      setTimeout(() => {
        videoBackground.style.display = 'block';
        videoBackground.style.opacity = '1';
        videoBackground.playbackRate = 0.9;
        videoBackground.play().catch(err => console.warn("No se pudo reproducir el background-video:", err));
      }, 3000);
    });

    videoIntro.addEventListener('ended', () => {
      videoIntro.style.transition = 'opacity 1s ease';
      videoIntro.style.opacity = '0';

      setTimeout(() => {
        videoIntro.style.display = 'none';
        main.classList.add('active');
        document.body.style.overflow = 'auto';
        iniciarApp();
      }, 1000);
    });
  }
});

// 2. App logic
function iniciarApp() {
  // Referencias
  const menuToggle = document.getElementById('menuToggle');
  const barsMenu = document.getElementById('navMenu');
  const cartIcon = document.querySelector('.cart-icon');
  const cartMenu = document.querySelector('.cart');
  const overlay = document.getElementById('overlay');
  const navbarLinks = document.querySelectorAll('.navbar-link');
  const productsCart = document.querySelector('.cart-container');
  const total = document.querySelector('.total');
  const buyBtn = document.querySelector('.btn-buy');
  const deleteBtn = document.querySelector('.btn-delete');
  const cartBubble = document.querySelector('.cart-bubble');
  const closeCartBtn = document.querySelector('.cart-close-btn');
  const closeMenuBtn = document.querySelector('.menu-close-btn');
  const productsContainer = document.querySelector(".products-container");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Funciones
  const toggleMenu = () => {
    barsMenu.classList.toggle("open");
    if (cartMenu.classList.contains("open-cart")) {
      cartMenu.classList.remove("open-cart");
      overlay.classList.remove("show-overlay");
      return;
    }
    overlay.classList.toggle("show-overlay");
  };

  const toggleCart = () => {
    cartMenu.classList.toggle("open-cart");
    if (barsMenu.classList.contains("open")) {
      barsMenu.classList.remove("open");
      overlay.classList.remove("show-overlay");
      return;
    }
    overlay.classList.toggle("show-overlay");
  };

  const closeOnScroll = () => {
    if (!barsMenu.classList.contains("open") && !cartMenu.classList.contains("open-cart")) return;
    barsMenu.classList.remove("open");
    cartMenu.classList.remove("open-cart");
    overlay.classList.remove("show-overlay");
  };

  const closeOnClick = (e) => {
    if (!e.target.classList.contains("navbar-link")) return;
    barsMenu.classList.remove("open");
    overlay.classList.remove("show-overlay");
  };

  const closeOnOverlayClick = () => {
    barsMenu.classList.remove("open");
    cartMenu.classList.remove("open-cart");
    overlay.classList.remove("show-overlay");
  };

  const renderProducts = () => {
    if (!productsContainer || typeof gorras === "undefined") return;
    productsContainer.innerHTML = gorras.map(({ id, name, brand, price, img }) => `
      <div class="product">
        <img src="${img}" alt="product" class="product-img">
        <div class="product-text-container">
          <h3 class="product-name">${name}</h3>
          <h2 class="created-by-product">${brand}</h2>
          <p class="product-price">$${price.toFixed(2)}</p>
        </div>
        <button class="btn-add" data-id="${id}">Añadir</button>
        <button class="btn-info" data-id="${id}">Info</button>
      </div>
    `).join("");
  };

  const saveCart = () => localStorage.setItem("cart", JSON.stringify(cart));

  const renderCart = () => {
    if (!cart.length) {
      productsCart.innerHTML = `<p class="empty-msg">No hay productos en el carrito</p>`;
      return;
    }
    productsCart.innerHTML = cart.map(createCartProductTemplate).join("");
  };

  const createCartProductTemplate = ({ id, name, price, img, quantity }) => `
    <div class="cart-item">
      <img src="${img}" alt="gorra" />
      <div class="item-info">
        <h3 class="item-title">${name}</h3>
        <p class="item-bid">Precio</p>
        <span class="item-price">$ ${price}</span>
      </div>
      <div class="item-handler">
        <span class="quantity-handler down" data-id="${id}">-</span>
        <span class="item-quantity">${quantity}</span>
        <span class="quantity-handler up" data-id="${id}">+</span>
      </div>
    </div>
  `;

  const showCartTotal = () => {
    total.innerHTML = `$ ${getCartTotal().toFixed(2)}`;
  };

  const getCartTotal = () => {
    return cart.reduce((acc, cur) => acc + Number(getEffectivePrice(cur)) * cur.quantity, 0);
  };

  const getEffectivePrice = (product) => {
    if (product.id === 1 && product.quantity >= 2 && product.price == 55) {
      return 49.99;
    }
    return product.price;
  };

  const showAddModal = () => {
    const modal = document.querySelector('.add-modal');
    if (!modal) return;
    modal.classList.add('active-modal');
    setTimeout(() => modal.classList.remove('active-modal'), 2000);
  };

  const addProduct = (product) => {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCartState();
    showAddModal();
  };

  const addUnitToProduct = (product) => {
    cart = cart.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
  };

  const substractProductUnit = (product) => {
    cart = cart.map(p => p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p);
  };

  const removeProductFromCart = (product) => {
    cart = cart.filter(p => p.id !== product.id);
  };

  const handleQuantity = (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    const product = cart.find(p => p.id.toString() === id);
    if (!product) return;

    if (e.target.classList.contains("down")) {
      if (product.quantity === 1) {
        if (window.confirm("¿Desea Eliminar el producto del carrito?")) {
          removeProductFromCart(product);
        }
      } else {
        substractProductUnit(product);
      }
    } else if (e.target.classList.contains("up")) {
      addUnitToProduct(product);
    }
    updateCartState();
  };

  const resetCartItems = () => {
    cart = [];
    updateCartState();
  };

  const getTotal = () => getCartTotal();

  const createWhatsappMessage = () => {
    const phoneNumber = "11111111111";
    const total = getTotal();
    const message = cart.map(
      (item) => `- *${item.quantity} x ${item.name} ($${getEffectivePrice(item)})*`
    ).join("\n");

    const finalMessage = `Hola, quisiera comprar los siguientes productos:\n${message}\n*Total: $${total.toFixed(2)}.*`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;
  };

  const completeBuy = () => {
    if (!cart.length) return;
    const whatsappURL = createWhatsappMessage();
    window.open(whatsappURL, "_blank");
  };

  const deleteCart = () => {
    if (!cart.length) return;
    resetCartItems();
  };

  const disableBtn = (btn) => {
    if (btn) btn.classList.toggle("disabled", !cart.length);
  };

  const renderCartBubble = () => {
    cartBubble.textContent = cart.reduce((acc, cur) => acc + cur.quantity, 0);
  };

  const updateCartState = () => {
    saveCart();
    renderCart();
    showCartTotal();
    renderCartBubble();
    disableBtn(buyBtn);
    disableBtn(deleteBtn);
  };

  const handleProductClick = (e) => {
    if (e.target.classList.contains("btn-info")) {
      const id = Number(e.target.dataset.id);
      localStorage.setItem("selectedProductId", id);
      window.location.href = "info.html";
    }
    if (e.target.classList.contains("btn-add")) {
      const id = Number(e.target.dataset.id);
      const product = gorras.find(p => p.id === id);
      if (product) addProduct(product);
    }
  };

  // Listeners
  if (menuToggle) menuToggle.addEventListener("click", toggleMenu);
  if (cartIcon) cartIcon.addEventListener("click", toggleCart);
  if (window) window.addEventListener("scroll", closeOnScroll);
  navbarLinks.forEach(link => link.addEventListener("click", closeOnClick));
  if (overlay) overlay.addEventListener("click", closeOnOverlayClick);
  if (productsContainer) productsContainer.addEventListener("click", handleProductClick);
  if (productsCart) productsCart.addEventListener("click", handleQuantity);
  if (buyBtn) buyBtn.addEventListener("click", completeBuy);
  if (deleteBtn) deleteBtn.addEventListener("click", deleteCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", () => {
    cartMenu.classList.remove("open-cart");
    overlay.classList.remove("show-overlay");
  });
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", () => {
    barsMenu.classList.remove("open");
    overlay.classList.remove("show-overlay");
  });

  // Inicialización
  renderProducts();
  renderCart();
  showCartTotal();
  renderCartBubble();
  disableBtn(buyBtn);
  disableBtn(deleteBtn);
}