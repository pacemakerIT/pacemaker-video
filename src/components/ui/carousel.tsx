import * as React from 'react';
import useEmblaCarousel, {
  type UseEmblaCarouselType
} from 'embla-carousel-react';
import { cn } from '@/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>[0];

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: UseCarouselParameters;
  setApi?: (api: CarouselApi) => void;
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ opts, setApi, className, children, ...props }, ref) => {
    const [carouselRef, emblaApi] = useEmblaCarousel({
      ...opts,
      loop: true
    });

    React.useEffect(() => {
      if (emblaApi && setApi) {
        setApi(emblaApi);
      }
    }, [emblaApi, setApi]);

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <div
          ref={carouselRef}
          className="overflow-hidden"
          role="region"
          aria-roledescription="carousel"
        >
          <div className="flex">{children}</div>
        </div>
      </div>
    );
  }
);
Carousel.displayName = 'Carousel';

export { Carousel, type CarouselApi };
