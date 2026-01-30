import InfiniteMovingCards from "./ui/inifinit-movingCards";


export default function Cards() {
  const testimonials = [
    {
      quote:
        "This app changed my life! 🚀 It helped me organize my workflow, manage projects seamlessly, and improve my team’s productivity like never before.",
      name: "Nitin Kirola",
      title: "Full Stack Developer",
    },
    {
     quote: "An excellent initiative that brings top schools under one roof. The exhibition provided clarity, transparency, and valuable interactions with school representatives.",
name: "Sumit",
title: "Technology Consultant",
    },
    {
      quote:
        "Absolutely love the smooth UI and minimal design. Every feature feels polished and well-thought-out, making daily collaboration simple and enjoyable.",
      name: "Sarah Lee",
      title: "Product Designer",
    },
    {
      quote:
        "The best experience I’ve had using a dashboard! The real-time updates and analytics give me complete control over project timelines and progress.",
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
        className="mb-6 py-2"
      />
    </main>
  );
}
