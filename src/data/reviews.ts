import type { ImageKey } from "./media";

/**
 * SAMPLE customer stories, written for the prototype. Replace with real,
 * attributed reviews (with the customer’s permission) before launch.
 * `quote` is the short line used on the home page; `story` is the longer
 * account used on /reviews.
 */
export type Review = {
  quote: string;
  story: string;
  name: string;
  city: string;
  occasion: string;
  year: number;
  image?: ImageKey;
};

export const reviews: Review[] = [
  {
    quote:
      "My mother bought her wedding set here and so did I. They still had the drawing for hers, and made mine to sit with it.",
    story:
      "We came in with my mother’s 1996 rani haar and a photograph of her wedding. Upstairs they brought out the original drawing, the same karigar’s notes in the margin. My set was made to be worn alongside hers, so on the day we wore them together. Three fittings, no pressure, and tea every time.",
    name: "Aditi S.",
    city: "Jaipur",
    occasion: "Bridal trousseau",
    year: 2025,
    image: "bridePortraitIvory",
  },
  {
    quote:
      "They weighed our old bangles in front of us, explained every figure, and the new pair came back exactly as promised.",
    story:
      "We had six old bangles from three different shops and no idea what they were worth. They tested each one on the counter, wrote the purity and weight on a card, and valued them at that morning’s rate. The new kada pair was ready in twelve days, to the gram they quoted.",
    name: "Rakesh and Meena A.",
    city: "Ajmer",
    occasion: "Old gold exchange",
    year: 2025,
    image: "kadaGokhru",
  },
  {
    quote:
      "I came in for a chain and left two hours later having learnt more about gold than in thirty years of buying it. No pressure at all.",
    story:
      "I only wanted a plain chain. The young man at the counter showed me how to read the hallmark, why a box chain holds a pendant better than a rope, and how making charges are worked out. I bought the chain, and came back the next month for my daughter’s.",
    name: "Farah K.",
    city: "Jaipur",
    occasion: "Daily wear",
    year: 2024,
    image: "dailyBoxChain",
  },
  {
    quote: "The engagement ring was ready in nine days, certificate and all. Upstairs felt like a private room, not a shop.",
    story:
      "I knew nothing about diamonds. They sat me down with three stones under a loupe, explained the grading report line by line and let me take photographs home to think. The ring was ready in nine days, and she has not taken it off since.",
    name: "Karan M.",
    city: "Gurugram",
    occasion: "Engagement ring",
    year: 2026,
    image: "diaHaloRing",
  },
  {
    quote:
      "Eleven months of the scheme and a beautiful kada at the end of it. They called a week before to help me choose.",
    story:
      "I started the scheme when my son was born, just a small amount each month. A week before it matured they called to ask what I had in mind, and had four kadas waiting when I arrived. The twelfth month really was on them.",
    name: "Sunita R.",
    city: "Jaipur",
    occasion: "Savings scheme",
    year: 2025,
    image: "bangleNakshi",
  },
  {
    quote: "We buy our Dhanteras coins here every year. Sealed, hallmarked, and they always remember the family.",
    story:
      "It is the first stop of Dhanteras for us, before the sweets. Coins for each grandchild, sealed in their cards. They know every name by now and ask after the ones who have moved abroad.",
    name: "The Agarwal family",
    city: "Jaipur",
    occasion: "Gifting",
    year: 2024,
    image: "giftCoins",
  },
  {
    quote: "They restrung my grandmother’s necklace and gave it back looking as it must have done in 1960.",
    story:
      "The necklace had sat in a bank locker for twenty years, the thread rotten and two stones loose. They reset the stones in pure gold foil, restrung it on silk and cleaned it without polishing away the age. I wore it to my cousin’s wedding and three aunts cried.",
    name: "Priyanka J.",
    city: "Udaipur",
    occasion: "Restoration",
    year: 2026,
    image: "templeFlatlay",
  },
  {
    quote: "Our daughter chose her own first earrings here. They let a seven-year-old take her time.",
    story:
      "She tried every pair of studs on the counter, twice. Nobody hurried her. When she chose, they wrapped them in the ivory box and gave her a little card with the weight written on it, which she still keeps.",
    name: "Neha and Vikram T.",
    city: "Jaipur",
    occasion: "First earrings",
    year: 2025,
    image: "giftStuds",
  },
];
