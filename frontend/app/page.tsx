
import { Hero } from "@/components/hero";

export default function Home() {
  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`)
  return (
    <>
      <Hero />
      
    </>
  );
}
