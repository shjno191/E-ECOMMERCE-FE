import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBanners, type Banner } from '@/services/bannerService';
import { useNavigate } from 'react-router-dom';

export const HeroSlider = () => {
  const [slides, setSlides] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const data = await getBanners();
        // Filter only active banners and sort by displayOrder
        const activeBanners = data
          .filter(banner => banner.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        setSlides(activeBanners);
      } catch (error) {
        console.error('Error loading hero slides:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSlides();
  }, []);

  // Auto play slides
  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false); // Stop auto play when user manually changes slide
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const handleButtonClick = (link: string) => {
    // Check if we're on the same page (Products page)
    const currentPath = window.location.pathname;
    const linkPath = new URL(link, window.location.origin).pathname;
    
    if (currentPath === linkPath || (currentPath === '/' && linkPath === '/products')) {
      // Scroll to products section if on same page
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        const navbarHeight = 64; // Height of navbar
        const targetPosition = productsSection.offsetTop - navbarHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // Navigate to different page
      navigate(link);
    }
  };

  if (loading) {
    return (
      <section className="w-full h-[500px] md:h-[700px] lg:h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-primary-foreground">
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-white/20 rounded w-64"></div>
            <div className="h-6 bg-white/20 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative w-full h-[500px] md:h-[700px] lg:h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 translate-x-0'
                : index < currentSlide
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.backgroundColor} opacity-75`}></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="w-full px-4 md:px-8 lg:px-16">
                <div className="max-w-4xl text-white mx-auto lg:mx-0 lg:ml-[10%]">
                  <h2 className="text-sm md:text-base font-semibold uppercase tracking-wider mb-2 opacity-90 animate-fade-in-up">
                    {slide.subtitle}
                  </h2>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 md:mb-6 animate-fade-in-up animation-delay-100 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-xl lg:text-2xl mb-8 opacity-90 max-w-2xl animate-fade-in-up animation-delay-200">
                    {slide.description}
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => handleButtonClick(slide.buttonLink)}
                    className="animate-fade-in-up animation-delay-300 text-base md:text-lg px-8 py-6 md:px-10 md:py-7 hover:scale-105 transition-transform shadow-lg"
                  >
                    {slide.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 md:p-4 rounded-full transition-all hover:scale-110 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 md:p-4 rounded-full transition-all hover:scale-110 z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentSlide
                ? 'w-10 md:w-12 bg-white'
                : 'w-2 md:w-3 bg-white/50 hover:bg-white/70'
            } h-2 md:h-3 rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter
      <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-10">
        {currentSlide + 1} / {slides.length}
      </div> */}
    </section>
  );
};
