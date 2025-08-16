class StoreContainer {
  constructor() {
    this.currentPage = "Store selective";
    this.labelTool = document.querySelector("#tool");
    this.footerButtons = document.querySelectorAll(".text-center");
    this.storeSearch = document.getElementById('store-search');
    this.productCards = document.querySelectorAll('.product-card');
    this.followBtn = document.getElementById('followBtn');

    this.initFooterButtons();
    this.initSearch();
    this.initFollowButton();

    // product html (not inserted anywhere, preserved as-is)
    this.text = `
      <div class="product-card">
        <div class="product-image">
          <img src="test.jpg" alt="">
        </div>
        <div class="product-info">
          <div class="name">Smart 7 HD - 64GB, 2GB RAM</div>
          <div class="price">
            <span class="new-price">KES 300</span>
            <span class="old-price">KES 500</span>
          </div>
          <div id="addToCart">
            <span>★ ★ ★ ★ ☆</span>
            <i class="bi bi-cart-plus"></i>
          </div>
        </div>
      </div>
    `;
  }

  initFooterButtons() {
    this.footerButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.footerButtons.forEach((b) => b.classList.remove("red"));
        btn.classList.add("red");
      });
    });
  }

  initSearch() {
    this.storeSearch.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();

      this.productCards.forEach(card => {
        const productName = card.querySelector('.name').textContent.toLowerCase();
        const match = productName.includes(searchTerm);

        card.style.display = match || !searchTerm ? 'block' : 'none';
        this.labelTool.textContent = !searchTerm
          ? this.currentPage
          : match
          ? `Search (--${searchTerm}--) found`
          : `(--${searchTerm}--) not found`;
      });
    });
  }

  initFollowButton() {
    this.followBtn.addEventListener('click', function () {
      this.classList.toggle('following');
      this.textContent = this.classList.contains('following') ? 'Following ✓' : 'Follow';

      this.style.transform = 'scale(1.1)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
    });
  }
}

// Instantiate the class
new StoreContainer();