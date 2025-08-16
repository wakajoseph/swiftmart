let slidesData = [
  {
    image: "test.jpg",
    id: 1,
  },
  {
    image: "test.jpg",
    id: 2,
  },
  {
    image: "test.jpg",
    id:3
  },
  {
    image: "test.jpg",
    id: 4,
  },
  {
    image: "test.jpg",
    id: 5,
  }
]; 


class Carousel {
  constructor({
    mainContainerSelector,
    carouselSelector,
    data,
    slideInterval = 3000
  }) {
    this.mainContainer = document.querySelector(mainContainerSelector);
    this.carousel = document.querySelector(carouselSelector);
    this.dotContainer = document.querySelector(".slideDots");
    this.carouselWid;
    this.data = data;
    this.slideInterval = slideInterval;
    this.currentIndex = 0;
    this.intervalId = null;
    this.slideDotElements = [];

    this.width = this.mainContainer.getBoundingClientRect().width;

    // Bind methods
    this.boundMouseEnter = this.stopAutoSlide.bind(this);
    this.boundMouseLeave = this.startAutoSlide.bind(this);
    this.boundTouchStart = this.stopAutoSlide.bind(this);
    this.boundTouchEnd = this.startAutoSlide.bind(this);

    this.init();
  }

  init() {
    this.createSlides();
    this.startAutoSlide();
    this.setupEventListeners();
    this.updateCarouselPosition();
  }

  createSlides() {
    this.carousel.innerHTML = '';
    this.dotContainer.innerHTML = '';
    this.slideDotElements = [];
    
    this.carouselWid = `${Math.max(0, Math.floor((this?.data?.length || 0) * (this?.width || 0)))}px`;
    
    this.carousel.style.width = this.carouselWid;
    console.log(this.carouselWid)

    this.data.forEach((item, index) => {
      const dot = document.createElement('div');
      dot.className = 'slideDot';
      dot.dataset.index = index;
      this.dotContainer.appendChild(dot);
      this.slideDotElements.push(dot);

      dot.addEventListener('click', () => this.goToSlide(index));

      const slide = this.createSlideElement(item);
      this.carousel.appendChild(slide);
    });

    this.updateDotIndicators();
  }

  createSlideElement(item) {
    const slide = document.createElement('div');
    slide.className = 'flex-container';
    slide.style.width =`${this.width}px`;
    let img = document.createElement('img');    
    img.src = item.image;
    img.alt=item.name;
    img.loading= "lazy";
    img.style.width =`${this.width}px`;
    img.style.display;
    img.style.height = 'auto';
    slide.appendChild(img); 
    slide.addEventListener('click', ()=> this.navigateToSlide(item.id))    
    return slide;
  }
  
  navigateToSlide(id) {
     console.log("Clicked slide with id:", id);
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => this.nextSlide(), this.slideInterval);
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.data.length;
    this.updateCarouselPosition();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.data.length) % this.data.length;
    this.updateCarouselPosition();
  }

  goToSlide(index) {
    if (index >= 0 && index < this.data.length) {
      this.currentIndex = index;
      this.updateCarouselPosition();
      this.resetAutoSlide();
    }
  }

  resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  updateCarouselPosition() {
    const translateValue = -this.currentIndex * this.width;
    this.carousel.style.transform = `translateX(${translateValue}px)`;
    this.updateDotIndicators();
    
  }

  updateDotIndicators() {
    this.slideDotElements.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  setupEventListeners() {
    this.carousel.addEventListener('mouseenter', this.boundMouseEnter);
    this.carousel.addEventListener('mouseleave', this.boundMouseLeave);
    this.carousel.addEventListener('touchstart', this.boundTouchStart);
    this.carousel.addEventListener('touchend', this.boundTouchEnd);
  }

  destroy() {
    this.stopAutoSlide();

    this.carousel.removeEventListener('mouseenter', this.boundMouseEnter);
    this.carousel.removeEventListener('mouseleave', this.boundMouseLeave);
    this.carousel.removeEventListener('touchstart', this.boundTouchStart);
    this.carousel.removeEventListener('touchend', this.boundTouchEnd);

    this.slideDotElements.forEach((dot, index) => {
      dot.replaceWith(dot.cloneNode(true));
    });
  }
}
// Usage example:

function startCarousel() {
     new Carousel({
       mainContainerSelector: '.main-container',
       carouselSelector: '.carousel',
       data: slidesData,
       slideInterval: 5000,
       
    });    
}
