export interface RiotGamesAllChampionsResponse {
  type: string;
  format: string;
  version: string;
  data: { [key: string]: RiotGamesChampionData };
}

export interface RiotGamesChampionData {
  id: string;
  key: string;
  name: string;
  title: string;
  image: ChampionImage;
  skins: ChampionSkin[];
  lore: string;
  blurb: string;
  allytips: string[];
  enemytips: string[];
  tags: string[];
  partype: string;
  info: ChampionInfo;
  stats: ChampionStats;
  spells: ChampionSpell[];
  passive: ChampionPassive;
}

interface ChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ChampionSkin {
  id: string;
  num: number;
  name: string;
  chromas: boolean;
}

interface ChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

interface ChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
}

interface ChampionSpell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  leveltip: LevelTip;
  maxrank: number;
  cooldown: number[];
  cooldownBurn: string;
  cost: number[];
  costBurn: string;
  datavalues: {};
  effect: (number[] | null)[];
  effectBurn: string[];
  vars: any[];
  costType: string;
  maxammo: string;
  range: number[];
  rangeBurn: string;
  image: ChampionImage;
  resource: string;
}

interface LevelTip {
  label: string[];
  effect: string[];
}

interface ChampionPassive {
  name: string;
  description: string;
  image: ChampionImage;
}
