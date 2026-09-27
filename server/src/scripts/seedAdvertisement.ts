import prisma from "../config/prisma";

async function seedAdvertisements() {
  const advertisements = [
    {
      advertiser: "TechWitter",
      title: "Share what you're building",
      description:
        "Showcase your projects, ideas and technical knowledge to the community.",
      imageUrl: null,
      targetUrl: "http://localhost:5173/explore",
      ctaText: "Explore TechWitter",
      isActive: true,
    },
    {
      advertiser: "Developer Community",
      title: "Connect with other developers",
      description:
        "Discover developers, follow interesting creators and join the conversation.",
      imageUrl: null,
      targetUrl: "http://localhost:5173/explore",
      ctaText: "Discover people",
      isActive: true,
    },
  ];

  for (const advertisement of advertisements) {
    await prisma.advertisement.create({
      data: advertisement,
    });
  }

  console.log("Advertisements seeded successfully.");
}

seedAdvertisements()
  .catch((error) => {
    console.error("Failed to seed advertisements:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
