export interface CDragonChampionData {
  id: number;
  name: string;
  alias: string;
  title: string;
  shortBio: string;
  tacticalInfo: TacticalInfo;
  playstyleInfo: PlaystyleInfo;
  squarePortraitPath: string;
  stingerSfxPath: string;
  chooseVoPath: string;
  banVoPath: string;
  roles: string[];
  recommendedItemDefaults: unknown[];
  skins: Skin[];
  passive: Spell;
  spells: Spell[];
}

interface TacticalInfo {
  style: number;
  difficulty: number;
  damageType: string;
}

interface PlaystyleInfo {
  damage: number;
  durability: number;
  crowdControl: number;
  mobility: number;
  utility: number;
}

interface Skin {
  id: number;
  isBase: boolean;
  name: string;
  splashPath: string;
  uncenteredSplashPath: string;
  tilePath: string;
  loadScreenPath: string;
  skinType: string;
  rarity: string;
  isLegacy: boolean;
  splashVideoPath: string | null;
  collectionSplashVideoPath: string | null;
  featuresText: string | null;
  chromaPath: string | null;
  emblems: unknown | null;
  regionRarityId: number;
  rarityGemPath: string | null;
  skinLines: SkinLine[] | null;
  skinAugments: unknown | null;
  description: string | null;
}

interface SkinLine {
  id: number;
}

interface Spell {
  spellKey: string;
  name: string;
  abilityIconPath: string;
  abilityVideoPath: string;
  abilityVideoImagePath: string;
  cost: string;
  cooldown: string;
  description: string;
  dynamicDescription: string;
  range: number[];
  costCoefficients: number[];
  cooldownCoefficients: number[];
  coefficients: Coefficients;
  effectAmounts: EffectAmounts;
  ammo: Ammo;
  maxLevel: number;
}

interface Coefficients {
  coefficient1: number;
  coefficient2: number;
}

interface EffectAmounts {
  Effect1Amount: number[];
  Effect2Amount: number[];
  Effect3Amount: number[];
  Effect4Amount: number[];
  Effect5Amount: number[];
  Effect6Amount: number[];
  Effect7Amount: number[];
  Effect8Amount: number[];
  Effect9Amount: number[];
  Effect10Amount: number[];
}

interface Ammo {
  ammoRechargeTime: number[];
  maxAmmo: number[];
}
