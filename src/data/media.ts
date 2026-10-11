/**
 * Every image and video used on the site lives here.
 * All items are royalty-free stock from Pexels (pexels.com/license), verified to load
 * on 10 Oct 2026 (Phase 1) and re-verified in Phase 2. To swap in real photography, replace `src` (and `poster` / `sources`
 * for video) — nothing else in the codebase references a URL directly.
 *
 * Image URLs are stored WITHOUT query strings. src/lib/image-loader.ts appends the
 * width that next/image asks for.
 */

export type MediaImage = {
  src: string;
  alt: string;
  /** Short description for whoever swaps in real photography. */
  note: string;
};

export type MediaVideo = {
  /** Smallest suitable file first; `media` is used for <source media>. */
  sources: { src: string; media?: string; type: "video/mp4" }[];
  poster: string;
  alt: string;
  note: string;
};

const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;

export const images = {
  /* ---------------------------------------------------------------- Bridal */
  bridalPolkiEmerald: {
    src: px(13595451),
    alt: "Polki necklace set with emerald drops, laid on fabric",
    note: "Product: bridal polki necklace (landscape crop).",
  },
  bridalChokerRuby: {
    src: px(31772511),
    alt: "Close view of a gold choker with ruby and pale green enamel",
    note: "Product: bridal choker detail.",
  },
  bridalTrousseau: {
    src: px(38765152),
    alt: "A pair of polished gold kadas in a red velvet box",
    note: "Product: bridal kada pair. A clean product shot replacing a cluttered festive scene.",
  },
  bridalKundanTeal: {
    src: px(33154729),
    alt: "Kundan necklace, earrings and maang tikka with teal drops on ivory",
    note: "Product: kundan set on a light background.",
  },
  bridalLayered: {
    src: px(5043048),
    alt: "Layered gold bridal necklace worn over an embroidered blouse",
    note: "Product: satlada / layered bridal necklace, worn.",
  },
  bridalMathaPatti: {
    src: px(31741017),
    alt: "Gold matha patti with emerald drops worn in a bride’s hair",
    note: "Product: matha patti, worn.",
  },
  bridalThaliSet: {
    src: px(13595802),
    alt: "Kundan choker and matching earrings laid on grey glass",
    note: "Product: wedding set. Light grey background, to match the catalogue.",
  },
  bridalChandbali: {
    src: px(32989030),
    alt: "Gold chandbali earrings with green enamel on a stand",
    note: "Product: chandbali earrings on beige.",
  },
  bridePortraitIvory: {
    src: px(30780337),
    alt: "Bride in an ivory and gold lehenga wearing a kundan necklace and maang tikka",
    note: "Editorial portrait: Bridal collection cover.",
  },
  bridePortraitRed: {
    src: px(10429558),
    alt: "Bride in a red lehenga with a gold choker and maang tikka, looking away",
    note: "Editorial portrait: mega menu feature, bridal.",
  },
  brideGoldChoker: {
    src: px(33023960),
    alt: "Bride looking down, wearing a broad gold choker and pearl maang tikka",
    note: "Editorial portrait: hero fallback / bridal secondary.",
  },
  brideIvoryLehenga: {
    src: px(9419311),
    alt: "Smiling bride in ivory with layered pearl and kundan necklaces",
    note: "Editorial portrait: reviews and story sections.",
  },
  brideVelvet: {
    src: px(12634086),
    alt: "Bride in a maroon velvet dupatta with layered diamond and gold jewellery",
    note: "Editorial portrait: placeholder pages.",
  },
  brideTikkaDetail: {
    src: px(2498430),
    alt: "Close view of a bride’s gold maang tikka and nose ring",
    note: "Detail: placeholder pages.",
  },
  brideHands: {
    src: px(6011749),
    alt: "Bride’s hennaed hands holding gold bangles against a pastel lehenga",
    note: "Editorial detail: savings scheme teaser.",
  },
  brideSareeDetail: {
    src: px(38773208),
    alt: "Detail of a bride’s long gold necklace against a silk saree",
    note: "Editorial detail: heritage placeholder.",
  },

  /* ---------------------------------------------------------- Gold classics */
  bangleNakshi: {
    src: px(37485307),
    alt: "Pair of engraved gold bangles set with small stones on dark velvet",
    note: "Product: nakshi bangles.",
  },
  bangleNakshiAlt: {
    src: px(20493839),
    alt: "A pair of gold bangles set with green stones",
    note: "Product: meena kangan (and nakshi bangles' second image). Replaces a duplicate of the nakshi photograph.",
  },
  kadaGokhru: {
    src: px(20493839),
    alt: "Two gold gokhru kadas with emerald accents on a dark backdrop",
    note: "Product: gokhru kada.",
  },
  kadaGokhruAlt: {
    src: px(20493840),
    alt: "Gold kadas with beaded texture lit warmly against black",
    note: "Product secondary image: gokhru kada.",
  },
  jhumkaWorn: {
    src: px(37601639),
    alt: "Gold temple jhumka worn, photographed in soft evening light",
    note: "Product: jhumka, worn.",
  },
  jhumkaBook: {
    src: px(15787782),
    alt: "Gold jhumkas with ruby centres resting on an open book",
    note: "Product: ruby jhumka still life.",
  },
  pendantLotus: {
    src: px(32780784),
    alt: "Gold lotus pendant with a ruby drop worn over a silk saree",
    note: "Product: lotus pendant, worn.",
  },
  templeFlatlay: {
    src: px(37485313),
    alt: "Antique gold pendant, bangles and pearl strands laid on dark cloth",
    note: "Product: temple pendant necklace.",
  },
  banglesAssorted: {
    src: px(37485314),
    alt: "Assorted engraved gold bangles with pearls and earrings",
    note: "Product secondary image: bangle assortment.",
  },
  showcaseGold: {
    src: px(7314466),
    alt: "A jewellery showcase filled with gold necklaces and bangles",
    note: "Editorial: Gold Classics collection cover.",
  },
  showcaseStands: {
    src: px(29043373),
    alt: "Gold chains and a bracelet displayed on black velvet stands",
    note: "Editorial: placeholder pages.",
  },

  /* ---------------------------------------------------------------- Diamond */
  diaNecklaceWhite: {
    src: px(7134458),
    alt: "Yellow gold necklace with a diamond-set motif and pear drop on white",
    note: "Product: diamond necklace on white.",
  },
  diaBarPendant: {
    src: px(13204122),
    alt: "Rose gold bar pendant with three diamond drops on a pale background",
    note: "Product: diamond bar pendant.",
  },
  diaHaloRing: {
    src: px(1302307),
    alt: "Diamond ring with pavé stones on a pale studio surface",
    note: "Product: halo ring. Light seamless background, to match the catalogue.",
  },
  diaTwinRing: {
    src: px(12194367),
    alt: "Gold toi et moi ring with two diamonds on a white roll",
    note: "Product: twin stone ring.",
  },
  diaSolitaireStud: {
    src: px(28389453),
    alt: "Single diamond solitaire stud in yellow gold on grey",
    note: "Product: solitaire studs.",
  },
  diaFlamePendant: {
    src: px(4595723),
    alt: "Gold flame-shaped pendant set with small diamonds on a reflective surface",
    note: "Product: flame pendant.",
  },
  diaKitePendant: {
    src: px(14999288),
    alt: "Fine gold chain with a diamond kite pendant draped over a white cup",
    note: "Product: kite pendant.",
  },
  diaNecklaceWorn: {
    src: px(36189601),
    alt: "Diamond tennis necklace worn against warm skin",
    note: "Product: diamond necklace, worn.",
  },
  diaPortrait: {
    src: px(20838859),
    alt: "Woman in black wearing a fine diamond necklace, studio portrait",
    note: "Editorial portrait: Diamond collection cover.",
  },
  diaWhitePendant: {
    src: px(10215179),
    alt: "White gold cluster pendant set with diamonds on a ball chain",
    note: "Product: white gold pendant.",
  },
  diaEmeraldCut: {
    src: px(5370650),
    alt: "Emerald-cut diamond pendant with a halo on a pale blue ground",
    note: "Product secondary image.",
  },
  weddingBands: {
    src: px(21928764),
    alt: "Two gold wedding bands beside a diamond engagement ring",
    note: "Product: couple bands.",
  },
  diaRingsSculpt: {
    src: px(30541187),
    alt: "Gold and diamond rings on clear acrylic in a sculptural setting",
    note: "Product secondary image: rings.",
  },

  /* ------------------------------------------------------------- Daily wear */
  dailyHeartPendant: {
    src: px(16935588),
    alt: "Open heart gold pendant on a fine chain over textured white",
    note: "Product: heart pendant.",
  },
  dailyBoxChain: {
    src: px(12194383),
    alt: "Fine gold box chain on a white display bust",
    note: "Product: box chain.",
  },
  dailyRopeChain: {
    src: px(12194343),
    alt: "Gold rope chain draped over pale marble",
    note: "Product: rope chain.",
  },
  dailyCableChain: {
    src: px(12194264),
    alt: "Delicate gold cable chain on a white bust",
    note: "Product: cable chain.",
  },
  dailyLinkBracelet: {
    src: px(10581731),
    alt: "Rose gold link bracelet resting in soft white fabric",
    note: "Product: link bracelet.",
  },
  dailyJaaliPendant: {
    src: px(4735885),
    alt: "Two fine gold necklaces with jaali and coin pendants on white",
    note: "Product: jaali pendant.",
  },
  dailyStackBangles: {
    src: px(38827895),
    alt: "Three slim gold bangles on a mirrored tray",
    note: "Product: stacking bangles.",
  },
  dailyCoinPendant: {
    src: px(4889719),
    alt: "Gold coin pendant on a fine chain resting across an open book",
    note: "Product: sikka pendant.",
  },
  dailySculptedRings: {
    src: px(35933227),
    alt: "Sculpted gold rings and a pendant on a pale curved backdrop",
    note: "Product: everyday rings.",
  },
  dailyLayeredWorn: {
    src: px(14823622),
    alt: "Layered gold chains and a diamond collar worn with a white shirt",
    note: "Editorial: Daily Wear collection cover.",
  },
  dailyEverydayWorn: {
    src: px(7273388),
    alt: "Woman in a linen top wearing two fine gold chains",
    note: "Editorial: daily wear secondary.",
  },
  dailyStill: {
    src: px(19564918),
    alt: "Fine gold pendant on white silk with pink blossom",
    note: "Editorial still: placeholder pages.",
  },

  /* --------------------------------------------------------------- Gifting */
  giftCoins: {
    src: px(19673920),
    alt: "Stacks of gold coins on a white surface",
    note: "Product: 10 g gold coin.",
  },
  giftCoinStack: {
    src: px(8442429),
    alt: "Struck 24K gold coins with a fine milled edge",
    note: "Product: 5 g gold coin; also digital gold. Replaces a stock stack that read as chocolate coins.",
  },
  giftBar: {
    src: px(342942),
    alt: "A gold bar resting on a black presentation box over satin",
    note: "Product: 20 g gold bar.",
  },
  giftRingBox: {
    src: px(3871582),
    alt: "Hennaed hands holding an open ring box with a diamond ring",
    note: "Editorial: Gifting collection cover.",
  },
  giftHaloPendant: {
    src: px(5370650),
    alt: "Diamond halo pendant on a fine chain against a pale blue background",
    note: "Product: halo pendant. Light background, to match the catalogue.",
  },
  giftStuds: {
    src: px(12168883),
    alt: "Small gold studs on a speckled ceramic stand",
    note: "Product: petite studs.",
  },
  giftLeafBracelet: {
    src: px(29502912),
    alt: "Gold bracelet with crystal-set leaves on white",
    note: "Product: leaf bracelet.",
  },

  /* -------------------------------------------------------------- Showroom */
  showroomGround: {
    src: px(33257665),
    alt: "A bright jewellery showroom with glass counters and velvet seating",
    note: "Stand-in for the ground floor. Replace with real showroom photography.",
  },
  showroomStair: {
    src: px(8092431),
    alt: "Marble hall with a sweeping staircase and chandelier",
    note: "Stand-in for the staircase between floors.",
  },
  showroomSalon: {
    src: px(33803739),
    alt: "Heritage lounge with sandstone arches, chandeliers and display cases",
    note: "Stand-in for the first-floor bridal salon.",
  },
  showroomTray: {
    src: px(16063740),
    alt: "A hand choosing a ring from a tray of rings",
    note: "Showroom detail: ground floor.",
  },
  showroomBusts: {
    src: px(20299702),
    alt: "Necklaces displayed on busts in a softly lit case",
    note: "Showroom detail: first floor.",
  },
  showroomWindow: {
    src: px(31301818),
    alt: "Shop window with necklaces on ivory busts",
    note: "Showroom detail: visit pages.",
  },

  /* ------------------------------------------------- Workshop (Phase 2) */
  craftSketching: {
    src: px(31094159),
    alt: "A goldsmith’s hands laying out small gold components on the bench",
    note: "Craft macro: design and layout.",
  },
  craftPiercing: {
    src: px(33035383),
    alt: "Hands piercing a pattern with a jeweller’s saw at a wooden bench pin",
    note: "Craft macro: design, piercing the pattern.",
  },
  craftTorch: {
    src: px(7167017),
    alt: "Tweezers holding a ring in the blue flame of a jeweller’s torch",
    note: "Craft macro: casting and soldering.",
  },
  craftFlame: {
    src: px(15955333),
    alt: "A small torch flame heating gold on a soldering block",
    note: "Craft macro: heat work.",
  },
  craftBench: {
    src: px(31128289),
    alt: "An artisan working gold pieces at a traditional workbench",
    note: "Craft: the bench, setting.",
  },
  craftLamp: {
    src: px(38239304),
    alt: "A setter’s hands working under a warm bench lamp",
    note: "Craft macro: setting under magnification.",
  },
  craftFiling: {
    src: px(6262835),
    alt: "A gold ring being filed smooth, close up",
    note: "Craft macro: finishing.",
  },
  craftPolishing: {
    src: px(30557505),
    alt: "A craftsman polishing an intricate gold necklace on a polishing wheel",
    note: "Craft: finishing and polishing.",
  },

  /* ------------------------------------------------- Jaipur (Phase 2) */
  jaipurPalaceArch: {
    src: px(35394354),
    alt: "Jaipur’s City Palace framed by a carved archway",
    note: "Heritage: Jaipur, the city the house belongs to.",
  },
  jaipurGate: {
    src: px(32033554),
    alt: "A painted gateway in Jaipur’s old city",
    note: "Heritage timeline image.",
  },
  jaipurStreet: {
    src: px(15242546),
    alt: "A quiet lane of small shops in old Jaipur in early morning",
    note: "Heritage timeline: where the first counter stood. Replace with the family’s archive photograph.",
  },
  jaipurFacade: {
    src: px(16745025),
    alt: "Carved sandstone balconies of a Jaipur palace facade",
    note: "Heritage timeline image.",
  },

  /* ------------------------------------------------------------- Try-on */
  tryOnModel: {
    src: px(33545262),
    alt: "Studio portrait of a woman facing the camera, hair tied back",
    note: "Virtual try-on fallback model: front-facing, ears and neckline clear, plain background. If replaced, re-measure the points in tryon.ts (tryOnModel).",
  },
} satisfies Record<string, MediaImage>;

export type ImageKey = keyof typeof images;

/**
 * Pexels videos (https://videos.pexels.com/video-files/{id}/{file}), served
 * through this site’s own /media/video route so visitors get no third-party
 * cookies. To use the client’s own films, put full URLs or /public paths here.
 */
const pv = (id: number, file: string) => `/media/video/${id}/${file}`;

export const videos = {
  heroBride: {
    sources: [
      { src: pv(27239910, "12100751_960_540_50fps.mp4"), media: "(max-width: 767px)", type: "video/mp4" },
      { src: pv(27239910, "12100752_1280_720_50fps.mp4"), type: "video/mp4" },
    ],
    poster: "https://images.pexels.com/videos/27239910/ai-beautiful-beautiful-woman-beauty-27239910.jpeg",
    alt: "A bride in a maang tikka and kundan earrings, filmed in soft light",
    note: "Home hero. 22 s loop. 540p on phones (9 MB), 720p elsewhere (15 MB).",
  },
  bridalCampaign: {
    sources: [
      { src: pv(27296851, "12113523_960_540_50fps.mp4"), media: "(max-width: 767px)", type: "video/mp4" },
      { src: pv(27296851, "12113524_1280_720_50fps.mp4"), type: "video/mp4" },
    ],
    poster: "https://images.pexels.com/videos/27296851/asian-beautiful-beauty-bride-27296851.jpeg",
    alt: "A bride lowers her eyes beneath a kundan maang tikka",
    note: "Home bridal campaign film. Same shoot as the hero, a closer frame. Replace with the house's own bridal film.",
  },
  craftDesign: {
    sources: [{ src: pv(6262756, "6262756-hd_1280_720_25fps.mp4"), type: "video/mp4" }],
    poster: "https://images.pexels.com/videos/6262756/pexels-photo-6262756.jpeg",
    alt: "A goldsmith marking and piercing a gold piece at the bench",
    note: "Craft step 1, design. 2 MB.",
  },
  craftCasting: {
    sources: [{ src: pv(6033520, "6033520-hd_720_1280_30fps.mp4"), type: "video/mp4" }],
    poster: "https://images.pexels.com/videos/6033520/caliente-casting-jewellery-6033520.jpeg",
    alt: "Molten metal glowing in a crucible before it is poured",
    note: "Craft step 2, casting. Portrait. 5 MB.",
  },
  craftSetting: {
    sources: [{ src: pv(6262754, "6262754-hd_1280_720_25fps.mp4"), type: "video/mp4" }],
    poster: "https://images.pexels.com/videos/6262754/pexels-photo-6262754.jpeg",
    alt: "A setter placing stones into a gold ring held in a clamp",
    note: "Craft step 3, setting. 3 MB.",
  },
  craftFinishing: {
    sources: [{ src: pv(6263163, "6263163-sd_960_540_25fps.mp4"), type: "video/mp4" }],
    poster: "https://images.pexels.com/videos/6263163/accessory-arts-and-crafts-beautiful-bijouterie-6263163.jpeg",
    alt: "A goldsmith filing the edge of a gold ring",
    note: "Craft step 4, finishing. 5 MB.",
  },
  craftHallmark: {
    sources: [{ src: pv(36353836, "15419550_1280_720_50fps.mp4"), type: "video/mp4" }],
    poster: "https://images.pexels.com/videos/36353836/pexels-photo-36353836.jpeg",
    alt: "Finished gold jewellery laid out in a lit showcase",
    note: "Craft step 5, hallmarking and display. 4 MB. Replace with real hallmark footage when available.",
  },
  goldShowcase: {
    sources: [
      { src: pv(36338911, "15412880_960_540_50fps.mp4"), media: "(max-width: 767px)", type: "video/mp4" },
      { src: pv(36338911, "15412882_1280_720_50fps.mp4"), type: "video/mp4" },
    ],
    poster: "https://images.pexels.com/videos/36338911/pexels-photo-36338911.jpeg",
    alt: "A showcase of gold necklaces, bangles and rings under warm light",
    note: "Our Story full-width showroom film. 5 MB / 7.5 MB. Replace with footage of the real showroom.",
  },
  goldWindow: {
    sources: [{ src: pv(8849053, "8849053-hd_1280_720_60fps.mp4"), type: "video/mp4" }],
    poster: "https://images.pexels.com/videos/8849053/pexels-photo-8849053.jpeg",
    alt: "Gold jewellery hanging in a lit display window",
    note: "Gold Classics collection hero. 3 MB.",
  },
} satisfies Record<string, MediaVideo>;

export type VideoKey = keyof typeof videos;
