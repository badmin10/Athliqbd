import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Sports ──────────────────────────────────
  const sports = [
    { name: "Badminton", slug: "badminton", sortOrder: 1, description: "Victor racquets, strings, shuttlecocks, and badminton gear" },
    { name: "Running", slug: "running", sortOrder: 2, description: "Running shoes, apparel, and accessories" },
  ];

  const sportRecords: Record<string, string> = {};
  for (const sport of sports) {
    const record = await prisma.sport.upsert({
      where: { slug: sport.slug },
      update: {},
      create: sport,
    });
    sportRecords[sport.slug] = record.id;
  }

  // ── Categories ──────────────────────────────
  const categories = [
    // Badminton
    { name: "Rackets", slug: "rackets", sportSlug: "badminton", sortOrder: 1, description: "Victor badminton racquets for every play style" },
    { name: "Strings", slug: "strings", sportSlug: "badminton", sortOrder: 2, description: "Badminton strings for power, control, and durability" },
    { name: "Shuttlecocks", slug: "shuttlecocks", sportSlug: "badminton", sortOrder: 3, description: "Feather and nylon shuttlecocks" },
    { name: "Bags", slug: "bags", sportSlug: "badminton", sortOrder: 4, description: "Racket bags and kit bags" },
    { name: "Grips", slug: "grips", sportSlug: "badminton", sortOrder: 5, description: "Overgrips and replacement grips" },
    { name: "Court Shoes", slug: "court-shoes", sportSlug: "badminton", sortOrder: 6, description: "Indoor court shoes for badminton" },
    // Running
    { name: "Running Shoes", slug: "running-shoes", sportSlug: "running", sortOrder: 1, description: "Road and daily-trainer running shoes" },
    { name: "Apparel", slug: "apparel", sportSlug: "running", sortOrder: 2, description: "Running shirts, shorts, and tights" },
    { name: "Accessories", slug: "accessories", sportSlug: "running", sortOrder: 3, description: "Socks, caps, hydration, and other running essentials" },
  ];

  const categoryRecords: Record<string, string> = {};
  for (const cat of categories) {
    const { sportSlug, ...catData } = cat;
    const sportId = sportRecords[sportSlug];
    const record = await prisma.category.upsert({
      where: { sportId_slug: { sportId, slug: cat.slug } },
      update: {},
      create: { ...catData, sportId },
    });
    categoryRecords[cat.slug] = record.id;
  }

  // ── Products ────────────────────────────────
  // Specs reflect real Victor series characteristics:
  // Thruster = power/head-heavy/stiff, Auraspeed = speed/even-to-head-light, Drive-X = all-round/even balance
  const products = [
    {
      name: "Victor Thruster K Ryuga II",
      slug: "victor-thruster-k-ryuga-ii",
      brand: "Victor",
      description:
        "A power-focused racket built for explosive smashes and aggressive attacking play. Head-heavy balance and a stiff shaft give you maximum smash power at the cost of some maneuverability — ideal for singles players and attacking doubles pairs.",
      price: 18500,
      compareAtPrice: 21000,
      stock: 8,
      sku: "VIC-TK-RYUGA2",
      weightGrip: "4U (Avg 80g) / G5",
      balancePoint: "Head Heavy",
      flexibility: "Stiff",
      stringTension: "20-28 lbs",
      material: "Carbon Fiber",
      categorySlug: "rackets",
      isFeatured: true,
    },
    {
      name: "Victor Auraspeed 90K Metallic",
      slug: "victor-auraspeed-90k-metallic",
      brand: "Victor",
      description:
        "The flagship of the Auraspeed series, designed for players who win with speed, timing, and clean shot execution. Even-to-head-light balance makes this racket whip through the air for fast net play and rapid direction changes.",
      price: 17000,
      compareAtPrice: null,
      stock: 6,
      sku: "VIC-ARS-90KM",
      weightGrip: "4U (Avg 80g) / G5",
      balancePoint: "Even",
      flexibility: "Medium",
      stringTension: "20-28 lbs",
      material: "Carbon Fiber",
      categorySlug: "rackets",
      isFeatured: true,
    },
    {
      name: "Victor Auraspeed 100X Ultra",
      slug: "victor-auraspeed-100x-ultra",
      brand: "Victor",
      description:
        "Built for lightning-fast response and superior maneuverability. A favorite among competitive club players who value speed above raw power — excels in fast-paced doubles and aggressive net play.",
      price: 16500,
      compareAtPrice: 18500,
      stock: 10,
      sku: "VIC-ARS-100XU",
      weightGrip: "4U (Avg 80g) / G5",
      balancePoint: "Even / Head Light",
      flexibility: "Medium-Flexible",
      stringTension: "20-27 lbs",
      material: "Carbon Fiber",
      categorySlug: "rackets",
      isFeatured: false,
    },
    {
      name: "Victor DriveX 10 Metallic",
      slug: "victor-drivex-10-metallic",
      brand: "Victor",
      description:
        "An all-around performer for club players and versatile athletes. The stable frame ensures accuracy in both attack and defense, while the moderate weight helps maintain stamina during long games.",
      price: 14500,
      compareAtPrice: null,
      stock: 12,
      sku: "VIC-DX-10M",
      weightGrip: "4U (Avg 82g) / G5",
      balancePoint: "Even",
      flexibility: "Medium",
      stringTension: "20-27 lbs",
      material: "Carbon Fiber / Metal-X Composite",
      categorySlug: "rackets",
      isFeatured: true,
    },
    {
      name: "Victor Jetspeed S 12 II",
      slug: "victor-jetspeed-s12-ii",
      brand: "Victor",
      description:
        "A versatile racket for players who blend offense and defense. Lightweight yet sturdy build with a flexible shaft for quick acceleration — excels in doubles, controlling net play and fast drives.",
      price: 13000,
      compareAtPrice: 15000,
      stock: 9,
      sku: "VIC-JS-S12II",
      weightGrip: "4U (Avg 80g) / G5",
      balancePoint: "Even",
      flexibility: "Flexible",
      stringTension: "19-26 lbs",
      material: "Ultra High Modulus Graphite",
      categorySlug: "rackets",
      isFeatured: false,
    },
    {
      name: "Victor Thruster Hammer Light",
      slug: "victor-thruster-hammer-light",
      brand: "Victor",
      description:
        "An ultra-light yet powerful racket for players who want easier swing speed without giving up the head-heavy attacking feel the Thruster series is known for.",
      price: 9500,
      compareAtPrice: null,
      stock: 15,
      sku: "VIC-TK-HMRL",
      weightGrip: "5U (Avg 75g) / G5",
      balancePoint: "Head Heavy",
      flexibility: "Medium",
      stringTension: "19-26 lbs",
      material: "Carbon Fiber",
      categorySlug: "rackets",
      isFeatured: false,
    },
    {
      name: "Victor VS-850 Badminton String",
      slug: "victor-vs-850-string",
      brand: "Victor",
      description:
        "A durable, all-round badminton string offering a good balance of repulsion and control. A reliable choice for everyday training and club play.",
      price: 650,
      compareAtPrice: null,
      stock: 50,
      sku: "VIC-VS850",
      categorySlug: "strings",
      isFeatured: false,
    },
    {
      name: "Victor VBS-68 Power String",
      slug: "victor-vbs-68-power",
      brand: "Victor",
      description:
        "A thinner gauge string built for players chasing extra power and repulsion on their smashes, at the cost of slightly reduced durability.",
      price: 850,
      compareAtPrice: null,
      stock: 40,
      sku: "VIC-VBS68",
      categorySlug: "strings",
      isFeatured: false,
    },
    {
      name: "Victor Gold Champion No. 1 Feather Shuttlecock (Tube of 12)",
      slug: "victor-gold-champion-shuttlecock",
      brand: "Victor",
      description:
        "Tournament-grade goose feather shuttlecocks offering consistent flight and durability for serious training and match play.",
      price: 2200,
      compareAtPrice: null,
      stock: 30,
      sku: "VIC-GCN1",
      categorySlug: "shuttlecocks",
      isFeatured: true,
    },
    {
      name: "Victor Champion No. 3 Nylon Shuttlecock (Tube of 6)",
      slug: "victor-champion-no3-nylon",
      brand: "Victor",
      description:
        "An affordable, hard-wearing nylon shuttlecock ideal for recreational play and beginners — built to handle frequent miss-hits without breaking.",
      price: 900,
      compareAtPrice: null,
      stock: 45,
      sku: "VIC-CN3",
      categorySlug: "shuttlecocks",
      isFeatured: false,
    },
    {
      name: "Victor BR9012 Racket Backpack",
      slug: "victor-br9012-backpack",
      brand: "Victor",
      description:
        "A spacious racket backpack with dedicated compartments for up to 3 racquets, shoes, and apparel — built for players who travel to matches and training.",
      price: 4500,
      compareAtPrice: 5200,
      stock: 14,
      sku: "VIC-BR9012",
      categorySlug: "bags",
      isFeatured: true,
    },
    {
      name: "Victor Overgrip (Pack of 3)",
      slug: "victor-overgrip-3pack",
      brand: "Victor",
      description:
        "Tacky, sweat-absorbent overgrip for a secure hold during intense rallies. Easy to apply, with a tack that lasts through multiple sessions.",
      price: 350,
      compareAtPrice: null,
      stock: 60,
      sku: "VIC-OG3",
      categorySlug: "grips",
      isFeatured: false,
    },
    {
      name: "Victor A311 Indoor Court Shoes",
      slug: "victor-a311-court-shoes",
      brand: "Victor",
      description:
        "Lightweight indoor court shoes with strong lateral support for the quick stops, lunges, and direction changes badminton demands.",
      price: 6500,
      compareAtPrice: null,
      stock: 10,
      sku: "VIC-A311",
      categorySlug: "court-shoes",
      isFeatured: false,
    },
  ];

  // Running products — brand varies per product since this is no longer
  // Victor-exclusive; running gear comes from mainstream running brands.
  const runningProducts = [
    {
      name: "ASICS Gel-Nimbus 26",
      slug: "asics-gel-nimbus-26",
      brand: "ASICS",
      description:
        "A plush, highly cushioned daily trainer built for long, easy road miles. Smooth heel-to-toe transition and a soft ride make this a reliable choice for everyday training and recovery runs.",
      price: 16500,
      compareAtPrice: null,
      stock: 12,
      sku: "ASC-GN26",
      shoeSizeRange: "EU 40-46",
      terrainType: "Road",
      cushioning: "High",
      dropHeight: "8mm",
      categorySlug: "running-shoes",
      isFeatured: true,
    },
    {
      name: "Nike Pegasus 41",
      slug: "nike-pegasus-41",
      brand: "Nike",
      description:
        "A versatile, responsive daily trainer suited to everything from easy jogs to faster tempo runs. A balanced, moderately cushioned ride that works well for beginners building up weekly mileage.",
      price: 14000,
      compareAtPrice: 15500,
      stock: 15,
      sku: "NK-PEG41",
      shoeSizeRange: "EU 39-45",
      terrainType: "Road",
      cushioning: "Medium",
      dropHeight: "10mm",
      categorySlug: "running-shoes",
      isFeatured: true,
    },
    {
      name: "Adidas Ultraboost Light",
      slug: "adidas-ultraboost-light",
      brand: "Adidas",
      description:
        "A lighter take on the long-running Ultraboost line, with energy-returning Boost midsole cushioning for road runs and all-day comfort.",
      price: 17500,
      compareAtPrice: null,
      stock: 8,
      sku: "ADI-UBL",
      shoeSizeRange: "EU 40-46",
      terrainType: "Road",
      cushioning: "High",
      dropHeight: "10mm",
      categorySlug: "running-shoes",
      isFeatured: false,
    },
    {
      name: "Hoka Clifton 9",
      slug: "hoka-clifton-9",
      brand: "Hoka",
      description:
        "A lightweight max-cushion road shoe with a smooth, rockered ride. A favorite among beginner-to-intermediate runners for its forgiving, low-impact feel on daily miles.",
      price: 15500,
      compareAtPrice: null,
      stock: 10,
      sku: "HOK-CLI9",
      shoeSizeRange: "EU 39-46",
      terrainType: "Road",
      cushioning: "High",
      dropHeight: "5mm",
      categorySlug: "running-shoes",
      isFeatured: false,
    },
    {
      name: "Performance Running Tee",
      slug: "performance-running-tee",
      brand: "Generic Sportswear",
      description:
        "A lightweight, moisture-wicking running shirt that stays breathable through hot, humid conditions — built for Bangladesh's climate.",
      price: 1200,
      compareAtPrice: null,
      stock: 30,
      sku: "RUN-TEE1",
      categorySlug: "apparel",
      isFeatured: false,
    },
    {
      name: "Running Shorts (5-inch)",
      slug: "running-shorts-5-inch",
      brand: "Generic Sportswear",
      description:
        "Quick-drying running shorts with a built-in liner and a zip pocket for keys or a card — comfortable for daily training runs.",
      price: 1400,
      compareAtPrice: null,
      stock: 25,
      sku: "RUN-SHRT1",
      categorySlug: "apparel",
      isFeatured: false,
    },
    {
      name: "Cushioned Running Socks (3-Pack)",
      slug: "cushioned-running-socks-3pack",
      brand: "Generic Sportswear",
      description:
        "Breathable, blister-resistant running socks with extra cushioning at the heel and forefoot.",
      price: 650,
      compareAtPrice: null,
      stock: 40,
      sku: "RUN-SOCK3",
      categorySlug: "accessories",
      isFeatured: false,
    },
  ];

  const allProducts = [...products, ...runningProducts];

  for (const p of allProducts) {
    const { categorySlug, ...productData } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productData,
        categoryId: categoryRecords[categorySlug],
      },
    });
  }

  // ── Payment methods ──────────────────────────
  // Manual/offline collection — no merchant agreement needed to start.
  // Add SSLCommerz or a card gateway later as another row, no code change.
  const paymentMethods = [
    {
      name: "Cash on Delivery",
      type: "cod",
      instructions: "Pay in cash when your order arrives.",
      requiresReference: false,
      isEnabled: true,
      sortOrder: 1,
    },
    {
      name: "bKash",
      type: "mobile_banking",
      instructions:
        "Send the total amount to 01XXXXXXXXX (Personal) using bKash, then enter the Transaction ID below.",
      requiresReference: true,
      isEnabled: true,
      sortOrder: 2,
    },
    {
      name: "Nagad",
      type: "mobile_banking",
      instructions:
        "Send the total amount to 01XXXXXXXXX (Personal) using Nagad, then enter the Transaction ID below.",
      requiresReference: true,
      isEnabled: true,
      sortOrder: 3,
    },
  ];

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: method.name },
      update: {},
      create: method,
    });
  }

  // ── Admin user ──────────────────────────────
  // Default login — CHANGE THIS PASSWORD after your first login.
  const adminEmail = "admin@athliqbd.com";
  const adminPassword = "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Az",
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
  });

  console.log("Seed complete.");
  console.log(`Admin login -> email: ${adminEmail}  password: ${adminPassword}`);
  console.log("IMPORTANT: change this password after your first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
