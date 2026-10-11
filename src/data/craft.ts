import type { ImageKey, VideoKey } from "./media";

export type CraftStep = {
  number: string;
  title: string;
  body: string;
  video: VideoKey;
  /** Longer account for the /craft page. */
  detail: string;
  /** Macro photograph shown beside the film on /craft. */
  macro: ImageKey;
  /** Typical time at this step for a bridal piece (sample). */
  time: string;
  /** Who does the work. */
  hands: string;
};

export const craftSteps: CraftStep[] = [
  {
    number: "01",
    title: "Design",
    body: "Every piece begins as a drawing at our design table, then a wax model carved by hand. Families often bring an old piece to work from.",
    video: "craftDesign",
    detail:
      "A piece begins at the design table, often with a family’s old jewellery laid beside the sketchbook. The drawing is refined until it sits right on the person who will wear it, then carved in wax or built up in fine wire so the proportions can be held and tried.",
    macro: "craftPiercing",
    time: "3 to 5 days",
    hands: "Our designer and the family",
  },
  {
    number: "02",
    title: "Casting",
    body: "Gold is weighed, alloyed to its karat and melted in the crucible. Poured into the mould, it takes the shape the wax left behind.",
    video: "craftCasting",
    detail:
      "Fine gold is weighed and alloyed with silver and copper to exactly 22K or 18K. It is melted in a crucible and poured into a plaster mould made from the wax. Every casting is weighed again when it cools, so the gold in your piece is accounted for to the milligram.",
    macro: "craftTorch",
    time: "1 day",
    hands: "The casting karigar",
  },
  {
    number: "03",
    title: "Setting",
    body: "Our setters place each stone by hand under magnification. Kundan is set in pure gold foil; diamonds are held in claws raised from the metal.",
    video: "craftSetting",
    detail:
      "Stones are set by hand under magnification. For kundan, the setter beds each stone in pure 24K gold foil, pressed and burnished until it holds. Diamonds sit in claws or channels raised from the metal itself, checked from every side before the next stone goes in.",
    macro: "craftLamp",
    time: "4 to 12 days",
    hands: "The setter",
  },
  {
    number: "04",
    title: "Finishing",
    body: "Filed, polished and polished again. Edges that touch the skin are rounded so a piece can be worn all evening without being noticed.",
    video: "craftFinishing",
    detail:
      "Filing removes every mark of the earlier steps. Then comes polishing, first with coarse compounds and finally with rouge, until the surface takes the light evenly. Edges that touch the skin are rounded by hand so a piece can be worn all evening without being noticed.",
    macro: "craftPolishing",
    time: "2 to 3 days",
    hands: "The polisher",
  },
  {
    number: "05",
    title: "Hallmarking",
    body: "Finished gold goes to a BIS assaying centre for testing. It returns with the BIS mark, its purity and a six-digit HUID of its own.",
    video: "craftHallmark",
    detail:
      "The finished gold goes to a BIS-recognised assaying and hallmarking centre. A sample is tested for purity; if it passes, the piece is laser-marked with the BIS mark, its purity grade and a unique six-digit HUID. Only then does it come home to the showroom.",
    macro: "dailyCoinPendant",
    time: "1 to 2 days",
    hands: "A BIS hallmarking centre",
  },
];

export const showroomFloors = [
  {
    floor: "G",
    name: "The Gold Floor",
    line: "Walk in, no appointment needed.",
    body: "Our everyday floor, bright and open to the street. Chains, daily wear and gold classics, the rate board, and the counter where old gold is tested in front of you.",
    offers: ["Daily Wear and Gold Classics", "Coins and bars in 24K", "Old gold testing and exchange", "Resizing and cleaning while you wait"],
    image: "showroomGround" as ImageKey,
    detail: "showroomTray" as ImageKey,
  },
  {
    floor: "1",
    name: "The Bridal Salon",
    line: "Quieter, and by appointment.",
    body: "Up the staircase, a slower room. Bridal and diamond pieces are brought to you in private consultation rooms, with time to try a whole trousseau together.",
    offers: ["Bridal and Diamond collections", "Private rooms for families", "Trousseau planning and custom work", "Certified solitaires, viewed under loupe"],
    image: "showroomStair" as ImageKey,
    detail: "showroomBusts" as ImageKey,
  },
] as const;
