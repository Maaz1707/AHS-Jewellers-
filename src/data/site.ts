/**
 * SAMPLE business details. Every value here is placeholder content for the
 * presentation prototype and must be replaced with the client’s real details.
 */

export const site = {
  name: "AHS Jewellers",
  shortName: "AHS",
  descriptor: "Jewellers",
  foundedYear: 1987,
  tagline: "Gold, made to be handed down.",
  description:
    "AHS Jewellers is a family gold house in Jaipur. Bridal, diamond and everyday gold, hallmarked and made to last, in our own two-storey showroom.",
  url: "https://www.ahsjewellers.in",

  address: {
    line1: "AHS House, 14 Bhagwan Das Road",
    line2: "C-Scheme",
    city: "Jaipur",
    state: "Rajasthan",
    pin: "302001",
    /** Used for the map preview and directions link. */
    lat: 26.9056,
    lng: 75.8055,
  },

  phone: { display: "+91 98765 43210", href: "tel:+919876543210" },
  whatsapp: { display: "+91 98765 43210", number: "919876543210" },
  email: "care@ahsjewellers.in",

  hours: [
    { days: "Monday to Saturday", time: "11 am – 8:30 pm" },
    { days: "Sunday", time: "12 noon – 7 pm" },
  ],
  hoursNote: "Bridal salon on the first floor by appointment.",

  hallmark: {
    short: "Every gold piece is BIS hallmarked with its own six-digit HUID.",
    long: "Every gold piece we sell carries the BIS hallmark: the BIS mark, its purity grade and a unique six-digit HUID that you can check yourself on the BIS CARE app.",
  },

  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
  },

  legal: "Prices shown are indicative and move with the day’s gold rate. Business details on this site are sample content.",
} as const;

/**
 * SAMPLE savings scheme terms. Every figure on /savings-scheme, the calculator,
 * the member area and the admin panel reads from here.
 */
export const schemeTerms = {
  name: "AHS Gold Savings Scheme",
  /** Monthly instalments the member pays. */
  instalments: 11,
  /** The house adds this many instalments' worth as the bonus. */
  bonusInstalments: 1,
  /** Month in which the total is redeemed in jewellery. */
  redeemMonth: 12,
  minMonthly: 2000,
  maxMonthly: 100000,
  step: 500,
  /** Days after a due date before an instalment counts as overdue. */
  graceDays: 5,
  /** Days after maturity within which the balance should be redeemed. */
  redeemWithinDays: 60,
} as const;

/**
 * SAMPLE online shopping terms. Only pieces marked `online` in products.ts can
 * be bought on the site; everything else is enquiry-led.
 */
export const commerceTerms = {
  /** Insured delivery charge, waived from `freeDeliveryFrom`. */
  insuredDeliveryFee: 500,
  freeDeliveryFrom: 25000,
  /** Most of one piece in a single order. */
  maxQty: 5,
  /** Highest order value accepted online; above this we ask the customer to visit. */
  onlineLimit: 500000,
  /** Days a showroom pickup order is held for collection. */
  pickupHoldDays: 7,
} as const;

/**
 * SAMPLE digital gold terms. The vault partner is deliberately unnamed: the
 * client adds their licensed partner’s details before going live.
 */
export const digitalGoldTerms = {
  minRupees: 100,
  maxRupees: 200000,
  gst: 0.03,
  fineness: "24K, 999.9 fine",
  /** Smallest balance that can be turned into jewellery or coins at the counter. */
  minRedeemGrams: 0.5,
} as const;

/**
 * SAMPLE old gold exchange and buyback terms, as a share of the gold’s value at
 * today’s rate for its tested purity. Shown on /exchange and in the FAQ.
 */
export const exchangeTerms = {
  ours: { exchange: 1, buyback: 0.98 },
  other: { exchange: 0.98, buyback: 0.96 },
} as const;

/**
 * SAMPLE family story for /our-story. Written for the prototype; replace with
 * the family’s own account, names and dates.
 */
export const story = {
  headline: "Three generations on one road in Jaipur",
  lede:
    "AHS began as a single glass counter and a workbench behind it. The counter became a showroom; the workbench became a workshop of eleven karigars. The family is still at both.",
  family: [
    "Our grandfather opened the shop in 1987 with one counter, one scale and a promise he repeated to every customer: you will know exactly what you are paying for. Gold was weighed in front of you, the rate was written on a slate by the door, and nothing left the shop that he would not have given his own daughters.",
    "His son grew the workshop upstairs and brought the bridal work that families now travel for: kundan and polki set by hand, meenakari in the old Jaipur colours. His granddaughter runs the salon on the first floor today and still keeps the drawings for every wedding set the house has made.",
    "We are not the biggest jewellers in the city, and we have never tried to be. We would rather make fewer pieces, made properly, for families who come back.",
  ],
  timeline: [
    {
      year: "1987",
      title: "One counter, one scale",
      body: "The first shop opens in a narrow lane off Johari Bazaar. The gold rate is chalked on a slate by the door each morning.",
      image: "jaipurStreet",
    },
    {
      year: "1994",
      title: "The workshop upstairs",
      body: "Four karigars join, and the house begins making its own pieces rather than buying them in. The first bridal sets follow within a year.",
      image: "craftBench",
    },
    {
      year: "2006",
      title: "The second generation",
      body: "Kundan, polki and meenakari become the heart of the bridal work. Families start returning for daughters and granddaughters.",
      image: "bridalPolkiEmerald",
    },
    {
      year: "2019",
      title: "A building of our own",
      body: "The house moves to Bhagwan Das Road: everyday gold on the ground floor, a quieter bridal salon upstairs.",
      image: "jaipurFacade",
    },
    {
      year: "2021",
      title: "Every piece, its own number",
      body: "Six-digit HUID hallmarking arrives across India. Every gold piece we sell is traceable from that day on.",
      image: "dailyCoinPendant",
    },
    {
      year: "Today",
      title: "The third generation",
      body: "Eleven karigars, two floors and the same slate by the door, now a screen, with the morning rate on it.",
      image: "showroomGround",
    },
  ],
  values: [
    {
      title: "Weighed in front of you",
      body: "Every piece is weighed at the counter, and the rate, weight, making and GST are written out before you decide. Nothing is rounded in our favour.",
    },
    {
      title: "Made, not bought in",
      body: "Most of what you see was made upstairs by people we know by name. When we buy a piece in, we tell you who made it.",
    },
    {
      title: "Purity you can check",
      body: "BIS hallmark and HUID on every gold piece, and a free purity test on any gold you bring in, whether you bought it here or not.",
    },
    {
      title: "Here for the long run",
      body: "Free cleaning for life, fair exchange at the day’s rate, and the drawings for every bridal set we have made, kept for the next generation.",
    },
  ],
} as const;

export const whatsappLink = (message?: string) =>
  `https://wa.me/${site.whatsapp.number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const directionsLink = () =>
  `https://www.google.com/maps/dir/?api=1&destination=${site.address.lat},${site.address.lng}`;

export const fullAddress = () =>
  `${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.pin}`;
