import ProductCard, { type Product } from "@/components/shared/ProductCard";
import Carousel from "@/components/shared/Carousel";

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  return (
    <section className="mx-auto max-w-360 px-10 py-4">
      <Carousel>
        <div className="flex gap-4 px-2 py-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
