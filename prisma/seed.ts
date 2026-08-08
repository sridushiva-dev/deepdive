import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CURATED_MAPS = [
  {
    title: "How the Internet Works",
    titleHi: "इंटरनेट कैसे काम करता है",
    description: "From cables to clicks — understand the global network.",
    descriptionHi: "केबल से क्लिक तक — वैश्विक नेटवर्क को समझें।",
    estimatedMinutes: 60,
    tree: {
      id: "root",
      label: "The Internet",
      summary: "A global network of interconnected computers.",
      body: "The internet is not a single entity but a network of networks. Data travels as packets across routers, switches, and undersea cables spanning the planet.",
      children: [
        { id: "packets", label: "Data Packets", summary: "How information is split and sent.", body: "Every email, video, and webpage is broken into small packets. Each packet has a header with destination info and travels independently across the network." },
        { id: "ip", label: "IP Addresses", summary: "Unique identifiers for devices.", body: "IPv4 uses 32-bit addresses like 192.168.1.1. IPv6 expands this vastly. DNS translates human names like google.com into IP addresses." },
        { id: "http", label: "HTTP & Web", summary: "The language of the web.", body: "HTTP is the protocol browsers use to request pages. HTTPS adds encryption via TLS. REST APIs power modern apps." },
        { id: "dns", label: "DNS", summary: "The internet's phone book.", body: "Domain Name System resolves names to IPs hierarchically: root → TLD → domain → record." },
        { id: "routing", label: "Routing", summary: "How packets find their path.", body: "BGP and OSPF protocols help routers decide the best path. Redundancy means no single cable failure breaks the internet." },
      ],
    },
  },
  {
    title: "Introduction to Machine Learning",
    titleHi: "मशीन लर्निंग का परिचय",
    description: "Teach machines to learn from data — concepts, models, and intuition.",
    descriptionHi: "मशीनों को डेटा से सीखने के लिए प्रशिक्षित करें।",
    estimatedMinutes: 65,
    tree: {
      id: "root",
      label: "Machine Learning",
      summary: "Algorithms that improve through experience.",
      body: "ML is a subset of AI where systems learn patterns from data rather than explicit rules. Three paradigms: supervised, unsupervised, and reinforcement learning.",
      children: [
        { id: "supervised", label: "Supervised Learning", summary: "Learning from labeled examples.", body: "Classification predicts categories; regression predicts numbers. Training minimizes loss on labeled datasets." },
        { id: "neural", label: "Neural Networks", summary: "Layers of connected neurons.", body: "Deep learning stacks layers that transform data. Backpropagation adjusts weights to reduce error." },
        { id: "training", label: "Training & Overfitting", summary: "Fitting vs generalizing.", body: "Train/validation/test splits prevent overfitting. Regularization and dropout help models generalize." },
        { id: "unsupervised", label: "Unsupervised Learning", summary: "Finding structure without labels.", body: "Clustering groups similar data. Dimensionality reduction compresses features while preserving structure." },
      ],
    },
  },
  {
    title: "Indian Independence Movement",
    titleHi: "भारतीय स्वतंत्रता आंदोलन",
    description: "From colonial rule to freedom — key events and leaders.",
    descriptionHi: "औपनिवेशिक शासन से स्वतंत्रता तक।",
    estimatedMinutes: 60,
    tree: {
      id: "root",
      label: "Indian Independence",
      summary: "A decades-long struggle for self-rule.",
      body: "India's independence movement combined mass mobilization, civil disobedience, and political negotiation spanning from the 1857 revolt to 1947.",
      children: [
        { id: "1857", label: "Revolt of 1857", summary: "The first war of independence.", body: "Sepoy mutiny against East India Company rule marked early resistance, though it failed to end colonial control." },
        { id: "congress", label: "Indian National Congress", summary: "Political platform for independence.", body: "Founded 1885, INC became the primary vehicle for nationalist demands, evolving from moderate to radical approaches." },
        { id: "gandhi", label: "Gandhi's Methods", summary: "Non-violence and satyagraha.", body: "Civil disobedience, Salt March, and Quit India mobilized millions through non-violent resistance." },
        { id: "partition", label: "Partition of 1947", summary: "Freedom and division.", body: "Independence came with partition into India and Pakistan, causing massive migration and lasting geopolitical impact." },
      ],
    },
  },
  {
    title: "Climate & Monsoons",
    titleHi: "जलवायु और मानसून",
    description: "Why seasons breathe — atmospheric science for curious minds.",
    descriptionHi: "मौसम क्यों बदलते हैं — वायुमंडलीय विज्ञान।",
    estimatedMinutes: 55,
    tree: {
      id: "root",
      label: "Climate Systems",
      summary: "How Earth's atmosphere circulates energy.",
      body: "Climate is long-term weather patterns driven by solar radiation, ocean currents, and atmospheric chemistry.",
      children: [
        { id: "monsoon", label: "Indian Monsoon", summary: "Seasonal wind reversal.", body: "Summer heating of the Indian subcontinent draws moist air from oceans, bringing life-giving rains to agriculture." },
        { id: "el-nino", label: "El Niño", summary: "Pacific temperature oscillation.", body: "Warmer eastern Pacific disrupts global weather patterns, affecting monsoons and crop yields worldwide." },
        { id: "greenhouse", label: "Greenhouse Effect", summary: "Trapping heat in atmosphere.", body: "CO2 and methane trap infrared radiation. Human emissions intensify warming beyond natural cycles." },
      ],
    },
  },
  {
    title: "Personal Finance Basics",
    titleHi: "व्यक्तिगत वित्त की मूल बातें",
    description: "Money, savings, investing — build financial literacy.",
    descriptionHi: "पैसा, बचत, निवेश — वित्तीय साक्षरता।",
    estimatedMinutes: 60,
    tree: {
      id: "root",
      label: "Personal Finance",
      summary: "Managing money for life goals.",
      body: "Financial literacy covers earning, saving, investing, and protecting wealth over your lifetime.",
      children: [
        { id: "budget", label: "Budgeting", summary: "Track income and expenses.", body: "The 50/30/20 rule: needs, wants, savings. Emergency funds cover 3-6 months of expenses." },
        { id: "investing", label: "Investing", summary: "Growing wealth over time.", body: "Stocks, bonds, mutual funds, and index funds each carry different risk-return profiles. Compounding is powerful." },
        { id: "tax", label: "Taxes in India", summary: "Income tax basics.", body: "Old vs new tax regimes, Section 80C deductions, and TDS affect how much you keep from earnings." },
      ],
    },
  },
  {
    title: "The Human Brain & Memory",
    titleHi: "मानव मस्तिष्क और स्मृति",
    description: "How neurons create mind, memory, and learning.",
    descriptionHi: "न्यूरॉन्स कैसे मन और स्मृति बनाते हैं।",
    estimatedMinutes: 60,
    tree: {
      id: "root",
      label: "Brain & Memory",
      summary: "86 billion neurons wiring consciousness.",
      body: "The brain is the most complex object we know. Memory involves encoding, storage, and retrieval across neural networks.",
      children: [
        { id: "neurons", label: "Neurons", summary: "Brain's building blocks.", body: "Synapses strengthen with use — Hebbian learning: neurons that fire together wire together." },
        { id: "memory-types", label: "Memory Types", summary: "Working, episodic, procedural.", body: "Short-term holds ~7 items. Long-term consolidates during sleep. Muscle memory lives in cerebellum." },
        { id: "learning", label: "How We Learn", summary: "Neuroplasticity.", body: "Brains rewire throughout life. Practice, sleep, and novelty all enhance learning and retention." },
      ],
    },
  },
  {
    title: "Space Exploration",
    titleHi: "अंतरिक्ष अन्वेषण",
    description: "From Earth orbit to Mars — humanity's cosmic journey.",
    descriptionHi: "पृथ्वी की कक्षा से मंगल तक।",
    estimatedMinutes: 65,
    tree: {
      id: "root",
      label: "Space Exploration",
      summary: "Humanity reaching beyond Earth.",
      body: "Space exploration combines physics, engineering, and sheer ambition to study and travel beyond our planet.",
      children: [
        { id: "orbit", label: "Orbital Mechanics", summary: "Staying in space.", body: "Objects in orbit are falling but moving fast enough horizontally to miss Earth. Escape velocity is ~11.2 km/s." },
        { id: "iss", label: "International Space Station", summary: "Living in LEO.", body: "ISS orbits at 400km, hosting continuous human presence since 2000 for research in microgravity." },
        { id: "mars", label: "Mars Missions", summary: "The red planet.", body: "Rovers like Perseverance search for past life. Human Mars missions face radiation and fuel challenges." },
      ],
    },
  },
  {
    title: "Python for Beginners",
    titleHi: "शुरुआती के लिए Python",
    description: "Your first programming language — readable, powerful, everywhere.",
    descriptionHi: "आपकी पहली प्रोग्रामिंग भाषा।",
    estimatedMinutes: 70,
    tree: {
      id: "root",
      label: "Python Programming",
      summary: "Readable code that powers the world.",
      body: "Python's syntax emphasizes readability. It's the top language for AI, web development, automation, and data science.",
      children: [
        { id: "basics", label: "Variables & Types", summary: "Storing data.", body: "int, float, str, bool, list, dict, tuple — Python's core types handle most everyday programming." },
        { id: "control", label: "Control Flow", summary: "if, for, while.", body: "Conditionals branch logic. Loops repeat work. List comprehensions offer elegant transformations." },
        { id: "functions", label: "Functions", summary: "Reusable code blocks.", body: "def, lambda, *args, **kwargs — functions are how you abstract and organize programs." },
        { id: "modules", label: "Modules & Packages", summary: "Ecosystem power.", body: "pip installs libraries. import brings them in. The standard library covers files, dates, math, and more." },
      ],
    },
  },
  {
    title: "Art History: Major Movements",
    titleHi: "कला इतिहास: प्रमुख आंदोलन",
    description: "Renaissance to modernism — how art shaped culture.",
    descriptionHi: "पुनर्जागरण से आधुनिकतावाद तक।",
    estimatedMinutes: 55,
    tree: {
      id: "root",
      label: "Art Movements",
      summary: "Visual culture through centuries.",
      body: "Art movements reflect and shape society — from religious iconography to abstract expression of inner worlds.",
      children: [
        { id: "renaissance", label: "Renaissance", summary: "Rebirth of classical ideals.", body: "Perspective, humanism, and masters like Leonardo and Michelangelo transformed European art 1400-1600." },
        { id: "impressionism", label: "Impressionism", summary: "Light and moment.", body: "Monet, Renoir captured fleeting light with visible brushstrokes, rejecting academic realism." },
        { id: "modernism", label: "Modernism", summary: "Breaking tradition.", body: "Cubism, surrealism, abstract art questioned representation itself in the 20th century." },
      ],
    },
  },
  {
    title: "Mental Models for Thinking",
    titleHi: "सोचने के मानसिक मॉडल",
    description: "Frameworks to think clearer and decide better.",
    descriptionHi: "स्पष्ट सोच और बेहतर निर्णय के लिए।",
    estimatedMinutes: 60,
    tree: {
      id: "root",
      label: "Mental Models",
      summary: "Lenses for clearer thinking.",
      body: "Mental models are simplified representations of how the world works. Building a latticework of models improves decisions.",
      children: [
        { id: "first-principles", label: "First Principles", summary: "Reason from fundamentals.", body: "Break problems to basic truths and rebuild. Elon Musk uses this to innovate beyond analogy." },
        { id: "probabilistic", label: "Probabilistic Thinking", summary: "Embrace uncertainty.", body: "Bayesian updating: revise beliefs with new evidence. Expected value guides decisions under uncertainty." },
        { id: "inversion", label: "Inversion", summary: "Think backwards.", body: "Instead of how to succeed, ask what causes failure and avoid those paths. Munger's key technique." },
        { id: "systems", label: "Systems Thinking", summary: "See interconnections.", body: "Feedback loops, emergent behavior, and leverage points — systems thinking reveals hidden dynamics." },
      ],
    },
  },
];

async function main() {
  console.log("Seeding curated maps...");

  for (const map of CURATED_MAPS) {
    await prisma.curatedMap.upsert({
      where: { id: map.title.toLowerCase().replace(/\s+/g, "-").slice(0, 30) },
      create: {
        id: map.title.toLowerCase().replace(/\s+/g, "-").slice(0, 30),
        title: map.title,
        titleHi: map.titleHi,
        description: map.description,
        descriptionHi: map.descriptionHi,
        treeJson: JSON.stringify(map.tree),
        estimatedMinutes: map.estimatedMinutes,
        published: true,
      },
      update: {
        title: map.title,
        titleHi: map.titleHi,
        description: map.description,
        descriptionHi: map.descriptionHi,
        treeJson: JSON.stringify(map.tree),
        estimatedMinutes: map.estimatedMinutes,
        published: true,
      },
    });
  }

  console.log(`Seeded ${CURATED_MAPS.length} curated maps.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
