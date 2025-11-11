import InfiniteMovingCards from "./ui/inifinit-movingCards";


export default function Cards() {
  const testimonials = [
    {
      quote: "This app changed my life! 🚀",
      name: "Nitin Kirola",
      title: "Full Stack Developer",
    },
    {
      quote: "Absolutely love the smooth UI and design.",
      name: "Sarah Lee",
      title: "Product Designer",
    },
    {
      quote: "The best experience I’ve had using a dashboard.",
      name: "David Chen",
      title: "Project Manager",
    },
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-transparent">
      <h1 className="text-4xl font-bold mb-8">Testimonials</h1>
      <InfiniteMovingCards
        items={testimonials}
        direction="left"
        speed="normal"
        pauseOnHover={true}
        className="mb-16"
      />
    </main>
  );
}
