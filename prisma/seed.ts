import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";
import slugify from "slugify";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

function slug(text: string): string {
  return slugify(text, { lower: true, strict: true });
}

// Price helper: 1 sum = 100 tiyins
function sum(value: number): number {
  return value * 100;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();
  await prisma.color.deleteMany();
  await prisma.size.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.pickupPoint.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.giftCertificate.deleteMany();
  await prisma.address.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // ==================== ADMIN USER ====================
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@clickfashion.uz",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // ==================== COLORS ====================
  const colorsData = [
    { name: "Чёрный", nameUz: "Qora", nameEn: "Black", hexCode: "#000000", position: 1 },
    { name: "Белый", nameUz: "Oq", nameEn: "White", hexCode: "#FFFFFF", position: 2 },
    { name: "Серый", nameUz: "Kulrang", nameEn: "Grey", hexCode: "#808080", position: 3 },
    { name: "Бежевый", nameUz: "Sariq-jigarrang", nameEn: "Beige", hexCode: "#D4B896", position: 4 },
    { name: "Синий", nameUz: "Ko'k", nameEn: "Blue", hexCode: "#1E3A5F", position: 5 },
    { name: "Красный", nameUz: "Qizil", nameEn: "Red", hexCode: "#C41E3A", position: 6 },
    { name: "Зелёный", nameUz: "Yashil", nameEn: "Green", hexCode: "#2D5A27", position: 7 },
    { name: "Коричневый", nameUz: "Jigarrang", nameEn: "Brown", hexCode: "#6B4226", position: 8 },
    { name: "Розовый", nameUz: "Pushti", nameEn: "Pink", hexCode: "#E8A0BF", position: 9 },
    { name: "Хаки", nameUz: "Xaki", nameEn: "Khaki", hexCode: "#8B7D6B", position: 10 },
  ];

  const colors: Record<string, string> = {};
  for (const c of colorsData) {
    const created = await prisma.color.create({ data: c });
    colors[c.nameEn!] = created.id;
  }
  console.log("✅ Colors created:", Object.keys(colors).length);

  // ==================== SIZES ====================
  const sizesData = [
    { name: "XS", position: 1 },
    { name: "S", position: 2 },
    { name: "M", position: 3 },
    { name: "L", position: 4 },
    { name: "XL", position: 5 },
    { name: "XXL", position: 6 },
  ];

  const sizes: Record<string, string> = {};
  for (const s of sizesData) {
    const created = await prisma.size.create({ data: s });
    sizes[s.name] = created.id;
  }
  console.log("✅ Sizes created:", Object.keys(sizes).length);

  // ==================== CATEGORIES ====================
  interface CatInput {
    gender: "MEN" | "WOMEN";
    position: number;
    translations: { ru: string; uz: string; en: string };
  }

  const categoriesData: CatInput[] = [
    { gender: "WOMEN", position: 1, translations: { ru: "Платья", uz: "Ko'ylaklar", en: "Dresses" } },
    { gender: "WOMEN", position: 2, translations: { ru: "Блузки", uz: "Bluzlar", en: "Blouses" } },
    { gender: "WOMEN", position: 3, translations: { ru: "Юбки", uz: "Yubkalar", en: "Skirts" } },
    { gender: "WOMEN", position: 4, translations: { ru: "Брюки", uz: "Shimlar", en: "Trousers" } },
    { gender: "WOMEN", position: 5, translations: { ru: "Пальто и куртки", uz: "Palto va kurtkalar", en: "Coats & Jackets" } },
    { gender: "WOMEN", position: 6, translations: { ru: "Трикотаж", uz: "Trikotaj", en: "Knitwear" } },
    { gender: "MEN", position: 1, translations: { ru: "Рубашки", uz: "Ko'ylaklar", en: "Shirts" } },
    { gender: "MEN", position: 2, translations: { ru: "Футболки", uz: "Futbolkalar", en: "T-Shirts" } },
    { gender: "MEN", position: 3, translations: { ru: "Брюки", uz: "Shimlar", en: "Trousers" } },
    { gender: "MEN", position: 4, translations: { ru: "Пиджаки", uz: "Pidjaklar", en: "Blazers" } },
    { gender: "MEN", position: 5, translations: { ru: "Верхняя одежда", uz: "Ustki kiyim", en: "Outerwear" } },
    { gender: "MEN", position: 6, translations: { ru: "Трикотаж", uz: "Trikotaj", en: "Knitwear" } },
  ];

  const cats: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.create({
      data: {
        gender: c.gender,
        position: c.position,
        translations: {
          create: [
            { locale: "ru", name: c.translations.ru, slug: slug(c.translations.ru) + "-" + c.gender.toLowerCase() },
            { locale: "uz", name: c.translations.uz, slug: slug(c.translations.uz) + "-" + c.gender.toLowerCase() },
            { locale: "en", name: c.translations.en, slug: slug(c.translations.en) + "-" + c.gender.toLowerCase() },
          ],
        },
      },
    });
    cats[c.translations.en + "-" + c.gender] = cat.id;
  }
  console.log("✅ Categories created:", Object.keys(cats).length);

  // ==================== PRODUCTS ====================
  interface ProdInput {
    sku: string;
    gender: "MEN" | "WOMEN";
    lineType?: "MAIN" | "MERCH" | "COLLAB" | "PREMIUM";
    allowPromo?: boolean;
    basePrice: number;
    salePrice?: number;
    isNew?: boolean;
    isFeatured?: boolean;
    categoryKey: string;
    colorKeys: string[];
    sizeKeys: string[];
    translations: {
      ru: { name: string; description: string };
      uz: { name: string; description: string };
      en: { name: string; description: string };
    };
    images: string[];
  }

  const productsData: ProdInput[] = [
    // WOMEN - Dresses
    {
      sku: "W-DR-001",
      gender: "WOMEN",
      basePrice: sum(899000),
      isNew: true,
      categoryKey: "Dresses-WOMEN",
      colorKeys: ["Black", "Beige"],
      sizeKeys: ["XS", "S", "M", "L"],
      translations: {
        ru: { name: "Платье-миди с поясом", description: "Элегантное платье-миди из мягкой вискозы с поясом на талии. Идеально для офиса и вечерних мероприятий." },
        uz: { name: "Kamarli midi ko'ylak", description: "Yumshoq viskozadan tayyorlangan nafis midi ko'ylak. Ofis va kechki tadbirlar uchun ideal." },
        en: { name: "Belted Midi Dress", description: "Elegant midi dress in soft viscose with a waist belt. Perfect for office and evening events." },
      },
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "W-DR-002",
      gender: "WOMEN",
      lineType: "PREMIUM",
      basePrice: sum(1290000),
      salePrice: sum(899000),
      isFeatured: true,
      categoryKey: "Dresses-WOMEN",
      colorKeys: ["Red", "Black"],
      sizeKeys: ["S", "M", "L", "XL"],
      translations: {
        ru: { name: "Вечернее платье Premium", description: "Роскошное вечернее платье из шёлковой ткани. Линия Premium." },
        uz: { name: "Premium kechki ko'ylak", description: "Ipak matosidan tayyorlangan hashamatli kechki ko'ylak. Premium liniyasi." },
        en: { name: "Premium Evening Dress", description: "Luxurious evening dress in silk fabric. Premium line." },
      },
      images: [
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "W-DR-003",
      gender: "WOMEN",
      basePrice: sum(599000),
      isNew: true,
      categoryKey: "Dresses-WOMEN",
      colorKeys: ["White", "Pink"],
      sizeKeys: ["XS", "S", "M", "L"],
      translations: {
        ru: { name: "Летнее платье с цветочным принтом", description: "Лёгкое летнее платье из хлопка с цветочным принтом." },
        uz: { name: "Gullli yozgi ko'ylak", description: "Gul naqshli yengil paxta ko'ylak." },
        en: { name: "Floral Summer Dress", description: "Lightweight cotton summer dress with floral print." },
      },
      images: [
        "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // WOMEN - Blouses
    {
      sku: "W-BL-001",
      gender: "WOMEN",
      basePrice: sum(449000),
      categoryKey: "Blouses-WOMEN",
      colorKeys: ["White", "Beige", "Blue"],
      sizeKeys: ["XS", "S", "M", "L", "XL"],
      translations: {
        ru: { name: "Блуза из шёлка", description: "Воздушная блуза из натурального шёлка. Классический крой." },
        uz: { name: "Ipak bluza", description: "Tabiiy ipakdan havo bluza. Klassik andoza." },
        en: { name: "Silk Blouse", description: "Airy blouse in natural silk. Classic cut." },
      },
      images: [
        "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "W-BL-002",
      gender: "WOMEN",
      basePrice: sum(379000),
      salePrice: sum(299000),
      categoryKey: "Blouses-WOMEN",
      colorKeys: ["Black", "Grey"],
      sizeKeys: ["S", "M", "L"],
      translations: {
        ru: { name: "Блуза с бантом", description: "Стильная блуза с декоративным бантом на воротнике." },
        uz: { name: "Bantli bluza", description: "Yoqasida dekorativ bantli zamonaviy bluza." },
        en: { name: "Bow-Tie Blouse", description: "Stylish blouse with decorative bow tie at the collar." },
      },
      images: [
        "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // WOMEN - Trousers
    {
      sku: "W-TR-001",
      gender: "WOMEN",
      basePrice: sum(549000),
      isFeatured: true,
      categoryKey: "Trousers-WOMEN",
      colorKeys: ["Black", "Beige", "Khaki"],
      sizeKeys: ["XS", "S", "M", "L", "XL"],
      translations: {
        ru: { name: "Широкие брюки палаццо", description: "Элегантные широкие брюки с высокой посадкой." },
        uz: { name: "Keng palazzo shimlar", description: "Baland bellik nafis keng shimlar." },
        en: { name: "Wide Palazzo Trousers", description: "Elegant wide-leg trousers with high waist." },
      },
      images: [
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // WOMEN - Coats
    {
      sku: "W-CT-001",
      gender: "WOMEN",
      lineType: "PREMIUM",
      basePrice: sum(1890000),
      isNew: true,
      categoryKey: "Coats & Jackets-WOMEN",
      colorKeys: ["Beige", "Black", "Brown"],
      sizeKeys: ["S", "M", "L"],
      translations: {
        ru: { name: "Шерстяное пальто оверсайз", description: "Роскошное пальто из итальянской шерсти. Свободный крой." },
        uz: { name: "Oversize junli palto", description: "Italiya junidan hashamatli palto. Erkin andoza." },
        en: { name: "Oversized Wool Coat", description: "Luxurious coat in Italian wool. Relaxed fit." },
      },
      images: [
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "W-CT-002",
      gender: "WOMEN",
      basePrice: sum(990000),
      salePrice: sum(690000),
      categoryKey: "Coats & Jackets-WOMEN",
      colorKeys: ["Black", "Khaki"],
      sizeKeys: ["S", "M", "L", "XL"],
      translations: {
        ru: { name: "Тренч классический", description: "Классический тренч из водоотталкивающей ткани." },
        uz: { name: "Klassik trench", description: "Suv o'tkazmaydigan matosidan klassik trench." },
        en: { name: "Classic Trench Coat", description: "Classic trench coat in water-repellent fabric." },
      },
      images: [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // WOMEN - Knitwear
    {
      sku: "W-KN-001",
      gender: "WOMEN",
      basePrice: sum(479000),
      categoryKey: "Knitwear-WOMEN",
      colorKeys: ["Beige", "Grey", "White"],
      sizeKeys: ["S", "M", "L"],
      translations: {
        ru: { name: "Кашемировый свитер", description: "Мягкий свитер из кашемировой смеси." },
        uz: { name: "Kashmir sviter", description: "Kashmir aralashmasidan yumshoq sviter." },
        en: { name: "Cashmere Sweater", description: "Soft sweater in cashmere blend." },
      },
      images: [
        "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // WOMEN - Skirts
    {
      sku: "W-SK-001",
      gender: "WOMEN",
      basePrice: sum(399000),
      isNew: true,
      categoryKey: "Skirts-WOMEN",
      colorKeys: ["Black", "Beige"],
      sizeKeys: ["XS", "S", "M", "L"],
      translations: {
        ru: { name: "Юбка-карандаш", description: "Классическая юбка-карандаш длиной до колена." },
        uz: { name: "Qalam yubka", description: "Tizzagacha uzunlikdagi klassik qalam yubka." },
        en: { name: "Pencil Skirt", description: "Classic knee-length pencil skirt." },
      },
      images: [
        "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "W-SK-002",
      gender: "WOMEN",
      basePrice: sum(499000),
      categoryKey: "Skirts-WOMEN",
      colorKeys: ["Green", "Black"],
      sizeKeys: ["XS", "S", "M", "L"],
      translations: {
        ru: { name: "Плиссированная юбка-миди", description: "Женственная плиссированная юбка из сатина." },
        uz: { name: "Plisseli midi yubka", description: "Satindan ayollarcha plisseli yubka." },
        en: { name: "Pleated Midi Skirt", description: "Feminine pleated skirt in satin fabric." },
      },
      images: [
        "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // WOMEN - COLLAB
    {
      sku: "W-CL-001",
      gender: "WOMEN",
      lineType: "COLLAB",
      basePrice: sum(1590000),
      isNew: true,
      isFeatured: true,
      allowPromo: false,
      categoryKey: "Dresses-WOMEN",
      colorKeys: ["Black"],
      sizeKeys: ["S", "M", "L"],
      translations: {
        ru: { name: "Платье x Designer Collab", description: "Эксклюзивная коллаборация. Лимитированная серия." },
        uz: { name: "Ko'ylak x Designer Collab", description: "Eksklyuziv hamkorlik. Cheklangan seriya." },
        en: { name: "Dress x Designer Collab", description: "Exclusive collaboration. Limited edition." },
      },
      images: [
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1502716119720-b23a1e3b7d5e?w=600&h=800&fit=crop&crop=top",
      ],
    },

    // ==================== MEN ====================
    // MEN - Shirts
    {
      sku: "M-SH-001",
      gender: "MEN",
      basePrice: sum(399000),
      isFeatured: true,
      categoryKey: "Shirts-MEN",
      colorKeys: ["White", "Blue", "Grey"],
      sizeKeys: ["S", "M", "L", "XL", "XXL"],
      translations: {
        ru: { name: "Рубашка хлопковая классическая", description: "Классическая рубашка из 100% хлопка. Идеальна для делового стиля." },
        uz: { name: "Klassik paxta ko'ylak", description: "100% paxtadan klassik ko'ylak. Ishbilarmonlik uslubi uchun ideal." },
        en: { name: "Classic Cotton Shirt", description: "Classic shirt in 100% cotton. Perfect for business style." },
      },
      images: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "M-SH-002",
      gender: "MEN",
      basePrice: sum(449000),
      isNew: true,
      categoryKey: "Shirts-MEN",
      colorKeys: ["Black", "Beige"],
      sizeKeys: ["S", "M", "L", "XL"],
      translations: {
        ru: { name: "Льняная рубашка", description: "Лёгкая рубашка из натурального льна. Идеально для лета." },
        uz: { name: "Zig'ir ko'ylak", description: "Tabiiy zig'irdan yengil ko'ylak. Yoz uchun ideal." },
        en: { name: "Linen Shirt", description: "Lightweight shirt in natural linen. Perfect for summer." },
      },
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // MEN - T-Shirts
    {
      sku: "M-TS-001",
      gender: "MEN",
      basePrice: sum(249000),
      categoryKey: "T-Shirts-MEN",
      colorKeys: ["Black", "White", "Grey", "Blue"],
      sizeKeys: ["S", "M", "L", "XL", "XXL"],
      translations: {
        ru: { name: "Базовая футболка", description: "Базовая футболка из органического хлопка." },
        uz: { name: "Asosiy futbolka", description: "Organik paxtadan asosiy futbolka." },
        en: { name: "Essential T-Shirt", description: "Essential t-shirt in organic cotton." },
      },
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "M-TS-002",
      gender: "MEN",
      lineType: "MERCH",
      basePrice: sum(349000),
      isNew: true,
      categoryKey: "T-Shirts-MEN",
      colorKeys: ["Black", "White"],
      sizeKeys: ["S", "M", "L", "XL"],
      translations: {
        ru: { name: "Футболка с принтом Click", description: "Мерч Click Fashion. Оверсайз крой, плотный хлопок." },
        uz: { name: "Click printli futbolka", description: "Click Fashion merch. Oversize andoza, zich paxta." },
        en: { name: "Click Print T-Shirt", description: "Click Fashion merch. Oversized fit, heavy cotton." },
      },
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // MEN - Trousers
    {
      sku: "M-TR-001",
      gender: "MEN",
      basePrice: sum(549000),
      isFeatured: true,
      categoryKey: "Trousers-MEN",
      colorKeys: ["Black", "Grey", "Beige"],
      sizeKeys: ["S", "M", "L", "XL", "XXL"],
      translations: {
        ru: { name: "Классические брюки", description: "Брюки прямого кроя из костюмной ткани." },
        uz: { name: "Klassik shimlar", description: "Kostyum matosidan to'g'ri andozali shimlar." },
        en: { name: "Classic Trousers", description: "Straight-cut trousers in suiting fabric." },
      },
      images: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "M-TR-002",
      gender: "MEN",
      basePrice: sum(499000),
      salePrice: sum(349000),
      categoryKey: "Trousers-MEN",
      colorKeys: ["Khaki", "Black"],
      sizeKeys: ["S", "M", "L", "XL"],
      translations: {
        ru: { name: "Чиносы хлопковые", description: "Удобные чиносы из эластичного хлопка." },
        uz: { name: "Paxta chinoslar", description: "Elastik paxtadan qulay chinoslar." },
        en: { name: "Cotton Chinos", description: "Comfortable chinos in stretch cotton." },
      },
      images: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // MEN - Blazers
    {
      sku: "M-BZ-001",
      gender: "MEN",
      lineType: "PREMIUM",
      basePrice: sum(1490000),
      isFeatured: true,
      categoryKey: "Blazers-MEN",
      colorKeys: ["Black", "Blue"],
      sizeKeys: ["S", "M", "L", "XL"],
      translations: {
        ru: { name: "Пиджак Premium из шерсти", description: "Итальянская шерсть, полуприлегающий силуэт." },
        uz: { name: "Premium junli pidjak", description: "Italiya juni, yarim yopishgan siluet." },
        en: { name: "Premium Wool Blazer", description: "Italian wool, semi-fitted silhouette." },
      },
      images: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "M-BZ-002",
      gender: "MEN",
      basePrice: sum(790000),
      salePrice: sum(590000),
      categoryKey: "Blazers-MEN",
      colorKeys: ["Beige", "Grey"],
      sizeKeys: ["M", "L", "XL"],
      translations: {
        ru: { name: "Льняной пиджак", description: "Лёгкий пиджак из натурального льна для летнего сезона." },
        uz: { name: "Zig'ir pidjak", description: "Yozgi mavsumda tabiiy zig'irdan yengil pidjak." },
        en: { name: "Linen Blazer", description: "Lightweight blazer in natural linen for the summer season." },
      },
      images: [
        "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // MEN - Outerwear
    {
      sku: "M-OW-001",
      gender: "MEN",
      basePrice: sum(1290000),
      isNew: true,
      categoryKey: "Outerwear-MEN",
      colorKeys: ["Black", "Brown", "Khaki"],
      sizeKeys: ["S", "M", "L", "XL"],
      translations: {
        ru: { name: "Кожаная куртка", description: "Куртка из натуральной кожи. Классический байкерский стиль." },
        uz: { name: "Teri kurtka", description: "Tabiiy teridan kurtka. Klassik bayker uslubi." },
        en: { name: "Leather Jacket", description: "Jacket in genuine leather. Classic biker style." },
      },
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop&crop=top",
        "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "M-OW-002",
      gender: "MEN",
      basePrice: sum(1690000),
      categoryKey: "Outerwear-MEN",
      colorKeys: ["Black", "Grey"],
      sizeKeys: ["M", "L", "XL", "XXL"],
      translations: {
        ru: { name: "Пуховик зимний", description: "Тёплый пуховик с натуральным наполнителем." },
        uz: { name: "Qishki puhovik", description: "Tabiiy to'ldiruvchili issiq puhovik." },
        en: { name: "Winter Down Jacket", description: "Warm down jacket with natural filling." },
      },
      images: [
        "https://images.unsplash.com/photo-1544923246-77307dd270b0?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // MEN - Knitwear
    {
      sku: "M-KN-001",
      gender: "MEN",
      basePrice: sum(459000),
      categoryKey: "Knitwear-MEN",
      colorKeys: ["Grey", "Black", "Blue"],
      sizeKeys: ["S", "M", "L", "XL"],
      translations: {
        ru: { name: "Свитер с круглым вырезом", description: "Мериносовая шерсть, классический крой." },
        uz: { name: "Yumaloq yoqali sviter", description: "Merinos juni, klassik andoza." },
        en: { name: "Crew Neck Sweater", description: "Merino wool, classic fit." },
      },
      images: [
        "https://images.unsplash.com/photo-1614975059251-992f11792571?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "M-KN-002",
      gender: "MEN",
      basePrice: sum(529000),
      salePrice: sum(399000),
      isNew: true,
      categoryKey: "Knitwear-MEN",
      colorKeys: ["Beige", "Brown"],
      sizeKeys: ["M", "L", "XL"],
      translations: {
        ru: { name: "Кардиган на пуговицах", description: "Уютный кардиган из мягкой шерсти." },
        uz: { name: "Tugmali kardigan", description: "Yumshoq jundan qulay kardigan." },
        en: { name: "Button Cardigan", description: "Cozy cardigan in soft wool." },
      },
      images: [
        "https://images.unsplash.com/photo-1638643391904-9b551ba91ecc?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // WOMEN - extra
    {
      sku: "W-BL-003",
      gender: "WOMEN",
      basePrice: sum(359000),
      isNew: true,
      categoryKey: "Blouses-WOMEN",
      colorKeys: ["Pink", "White"],
      sizeKeys: ["XS", "S", "M", "L"],
      translations: {
        ru: { name: "Блуза с рукавами-фонариками", description: "Романтичная блуза с объёмными рукавами." },
        uz: { name: "Fonarik yengli bluza", description: "Katta hajmli yengli romantik bluza." },
        en: { name: "Puff Sleeve Blouse", description: "Romantic blouse with voluminous puff sleeves." },
      },
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "W-KN-002",
      gender: "WOMEN",
      basePrice: sum(599000),
      salePrice: sum(449000),
      categoryKey: "Knitwear-WOMEN",
      colorKeys: ["Pink", "Beige"],
      sizeKeys: ["S", "M", "L"],
      translations: {
        ru: { name: "Кардиган удлинённый", description: "Мягкий кардиган длиной до колена из ангоры." },
        uz: { name: "Uzaytirilgan kardigan", description: "Angoradan tizzagacha uzunlikdagi yumshoq kardigan." },
        en: { name: "Long Cardigan", description: "Soft knee-length cardigan in angora." },
      },
      images: [
        "https://images.unsplash.com/photo-1434389677669-e08b4cda3007?w=600&h=800&fit=crop&crop=top",
      ],
    },
    // MEN extra
    {
      sku: "M-TS-003",
      gender: "MEN",
      basePrice: sum(299000),
      categoryKey: "T-Shirts-MEN",
      colorKeys: ["Black", "White", "Green"],
      sizeKeys: ["S", "M", "L", "XL"],
      translations: {
        ru: { name: "Футболка поло", description: "Классическое поло из хлопка пике." },
        uz: { name: "Polo futbolka", description: "Piqe paxtasidan klassik polo." },
        en: { name: "Polo Shirt", description: "Classic polo in pique cotton." },
      },
      images: [
        "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=800&fit=crop&crop=top",
      ],
    },
    {
      sku: "M-SH-003",
      gender: "MEN",
      basePrice: sum(479000),
      salePrice: sum(379000),
      categoryKey: "Shirts-MEN",
      colorKeys: ["Blue", "White"],
      sizeKeys: ["S", "M", "L", "XL"],
      translations: {
        ru: { name: "Рубашка в полоску", description: "Рубашка из хлопка в тонкую полоску." },
        uz: { name: "Chiziqli ko'ylak", description: "Ingichka chiziqli paxtadan ko'ylak." },
        en: { name: "Striped Shirt", description: "Cotton shirt with thin stripes." },
      },
      images: [
        "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&h=800&fit=crop&crop=top",
      ],
    },
  ];

  let productCount = 0;
  for (const p of productsData) {
    const categoryId = cats[p.categoryKey];
    if (!categoryId) {
      console.warn(`⚠️ Category not found: ${p.categoryKey}`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        gender: p.gender,
        lineType: p.lineType || "MAIN",
        allowPromo: p.allowPromo !== undefined ? p.allowPromo : true,
        basePrice: p.basePrice,
        salePrice: p.salePrice || null,
        isNew: p.isNew || false,
        isFeatured: p.isFeatured || false,
        categoryId,
        translations: {
          create: [
            {
              locale: "ru",
              name: p.translations.ru.name,
              slug: slug(p.translations.ru.name),
              description: p.translations.ru.description,
              craftDetails: "Состав: хлопок 95%, эластан 5%. Машинная стирка при 30°C.",
              metaTitle: p.translations.ru.name + " | Click Fashion",
              metaDescription: p.translations.ru.description,
            },
            {
              locale: "uz",
              name: p.translations.uz.name,
              slug: slug(p.translations.uz.name),
              description: p.translations.uz.description,
              craftDetails: "Tarkibi: paxta 95%, elastan 5%. Mashinada 30°C da yuvish.",
              metaTitle: p.translations.uz.name + " | Click Fashion",
              metaDescription: p.translations.uz.description,
            },
            {
              locale: "en",
              name: p.translations.en.name,
              slug: slug(p.translations.en.name),
              description: p.translations.en.description,
              craftDetails: "Composition: cotton 95%, elastane 5%. Machine wash at 30°C.",
              metaTitle: p.translations.en.name + " | Click Fashion",
              metaDescription: p.translations.en.description,
            },
          ],
        },
        images: {
          create: p.images.map((url, i) => ({
            url,
            alt: p.translations.en.name,
            position: i,
          })),
        },
      },
    });

    // Create variants (color x size)
    let variantIdx = 0;
    for (const colorKey of p.colorKeys) {
      for (const sizeKey of p.sizeKeys) {
        const colorId = colors[colorKey];
        const sizeId = sizes[sizeKey];
        if (!colorId || !sizeId) continue;

        variantIdx++;
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            colorId,
            sizeId,
            stock: Math.floor(Math.random() * 15) + 3,
            sku: `${p.sku}-${colorKey.substring(0, 3).toUpperCase()}-${sizeKey}-${variantIdx}`,
          },
        });
      }
    }

    productCount++;
  }
  console.log(`✅ Products created: ${productCount}`);

  // ==================== PICKUP POINTS ====================
  const pickupPoints = [
    {
      name: "Click Office Tashkent",
      nameUz: "Click Ofisi Toshkent",
      nameEn: "Click Office Tashkent",
      address: "ул. Мирабад, 15, Ташкент",
      addressUz: "Mirobod ko'chasi, 15, Toshkent",
      addressEn: "15 Mirabad St., Tashkent",
      lat: 41.311081,
      lng: 69.279737,
      phone: "+998712001234",
    },
    {
      name: "Tashkent City Mall",
      nameUz: "Toshkent City Mall",
      nameEn: "Tashkent City Mall",
      address: "ул. Буюк Ипак Йули, 100, Ташкент",
      addressUz: "Buyuk Ipak Yo'li ko'chasi, 100, Toshkent",
      addressEn: "100 Great Silk Road St., Tashkent",
      lat: 41.338280,
      lng: 69.334694,
      phone: "+998712005678",
    },
    {
      name: "Самарканд Магазин",
      nameUz: "Samarqand Do'koni",
      nameEn: "Samarkand Store",
      address: "ул. Регистан, 25, Самарканд",
      addressUz: "Registon ko'chasi, 25, Samarqand",
      addressEn: "25 Registan St., Samarkand",
      lat: 39.654833,
      lng: 66.975556,
      phone: "+998662301234",
    },
  ];

  for (const pp of pickupPoints) {
    await prisma.pickupPoint.create({ data: pp });
  }
  console.log("✅ Pickup points created:", pickupPoints.length);

  // ==================== PROMO CODES ====================
  await prisma.promoCode.create({
    data: {
      code: "WELCOME10",
      discountType: "PERCENT",
      discountValue: 10,
      maxDiscount: sum(200000),
      maxUsages: 1000,
      isActive: true,
    },
  });
  await prisma.promoCode.create({
    data: {
      code: "SUMMER50K",
      discountType: "FIXED",
      discountValue: sum(50000),
      minOrderTotal: sum(300000),
      maxUsages: 500,
      isActive: true,
    },
  });
  console.log("✅ Promo codes created: 2");

  // ==================== GIFT CERTIFICATES ====================
  await prisma.giftCertificate.create({
    data: {
      code: "GIFT-100K",
      initialAmount: sum(100000),
      balance: sum(100000),
      isActive: true,
    },
  });
  await prisma.giftCertificate.create({
    data: {
      code: "GIFT-500K",
      initialAmount: sum(500000),
      balance: sum(500000),
      isActive: true,
    },
  });
  console.log("✅ Gift certificates created: 2");

  // ==================== HERO SLIDES ====================
  await prisma.heroSlide.create({
    data: {
      title: "Новая коллекция",
      titleUz: "Yangi kolleksiya",
      titleEn: "New Collection",
      subtitle: "Весна-Лето 2025",
      subtitleUz: "Bahor-Yoz 2025",
      subtitleEn: "Spring-Summer 2025",
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&h=600&fit=crop",
      linkUrl: "/catalog/women?sort=newest",
      position: 1,
    },
  });
  await prisma.heroSlide.create({
    data: {
      title: "Premium Line",
      titleUz: "Premium liniyasi",
      titleEn: "Premium Line",
      subtitle: "Итальянские ткани, безупречный крой",
      subtitleUz: "Italiya matolari, benuqson andoza",
      subtitleEn: "Italian fabrics, impeccable cut",
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=600&fit=crop",
      linkUrl: "/catalog/women",
      position: 2,
    },
  });
  console.log("✅ Hero slides created: 2");

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
