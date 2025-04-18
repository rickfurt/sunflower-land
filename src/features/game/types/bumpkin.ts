export type BumpkinBody =
  | "Beige Farmer Potion"
  | "Light Brown Farmer Potion"
  | "Dark Brown Farmer Potion"
  | "Goblin Potion";

export type BumpkinHair = "Basic Hair" | "Rancher Hair" | "Explorer Hair";

export type BumpkinShirt =
  | "Red Farmer Shirt"
  | "Yellow Farmer Shirt"
  | "Blue Farmer Shirt"
  | "Chef Apron"
  | "Warrior Shirt";

export type BumpkinEyes =
  | "Rosy Wide Eyes"
  | "Rosy Squinted Eyes"
  | "Rosy Butterfly Eyes";

export type BumpkinMouths = "Wide Smile" | "Wide Smile With Teeth";

export type BumpkinTools = "Farmer Pitchfork";

export type BumpkinShoes = "Black Farmer Boots";

export type BumpkinNecklace =
  | "Sunflower Amulet"
  | "Carrot Amulet"
  | "Beetroot Amulet"
  | "Green Amulet";

export type BumpkinHat = "Farmer Hat" | "Chef Hat" | "Warrior Helmet";

export type BumpkinPants =
  | "Farmer Overalls"
  | "Lumberjack Overalls"
  | "Farmer Pants"
  | "Warrior Pants";

export type BumpkinItems =
  | BumpkinBody
  | BumpkinHair
  | BumpkinShirt
  | BumpkinPants
  | BumpkinEyes
  | BumpkinMouths
  | BumpkinTools
  | BumpkinShoes
  | BumpkinHat
  | BumpkinNecklace;

export const ITEM_IDS: Record<BumpkinItems, number> = {
  "Beige Farmer Potion": 1,
  "Light Brown Farmer Potion": 2,
  "Dark Brown Farmer Potion": 3,
  "Goblin Potion": 4,
  "Basic Hair": 5,
  "Rancher Hair": 6,
  "Explorer Hair": 7,
  "Rosy Wide Eyes": 8,
  "Rosy Squinted Eyes": 9,
  "Rosy Butterfly Eyes": 10,
  "Wide Smile": 11,
  "Wide Smile With Teeth": 12,
  "Red Farmer Shirt": 13,
  "Yellow Farmer Shirt": 14,
  "Blue Farmer Shirt": 15,
  "Chef Apron": 16,
  "Warrior Shirt": 17,
  "Farmer Overalls": 18,
  "Lumberjack Overalls": 19,
  "Farmer Pants": 20,
  "Warrior Pants": 21,
  "Black Farmer Boots": 22,
  "Farmer Pitchfork": 23,
  "Farmer Hat": 24,
  "Chef Hat": 25,
  "Warrior Helmet": 26,
  "Sunflower Amulet": 27,
  "Carrot Amulet": 28,
  "Beetroot Amulet": 29,
  "Green Amulet": 30,
};

// The reverse of above
export const ITEM_NAMES: Record<string, BumpkinItems> = Object.assign(
  {},
  ...Object.entries(ITEM_IDS).map(([a, b]) => ({ [b]: a }))
);

export const IDS = Object.values(ITEM_IDS);
export const NAMES = Object.keys(ITEM_IDS) as BumpkinItems[];

export type BumpkinParts = {
  hair: BumpkinHair;
  eyes: BumpkinEyes;
  body: BumpkinBody;
  shirt: BumpkinShirt;
  pants: BumpkinPants;
  shoes: BumpkinShoes;
  mouth: BumpkinMouths;
  tool?: BumpkinTools;
  necklace?: BumpkinNecklace;
  hat?: BumpkinHat;
};

export type BumpkinPart = keyof BumpkinParts;

export type WalletItems = Record<BumpkinItems, number>;
