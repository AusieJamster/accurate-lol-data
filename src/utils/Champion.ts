import { RiotGamesChampionData, RiotGamesAllChampionsResponse } from 'types/ddragon';
import { truncateVersion } from './common';
import { CDragonChampionData } from 'types/cdragon';

export class Champion {
  constructor(
    private readonly version: string,
    private readonly championId: string,
    private readonly championKey: string
  ) {}

  async fetchFromRiotApi(): Promise<RiotGamesChampionData> {
    const url = new URL(
      `https://ddragon.leagueoflegends.com/cdn/${this.version}/data/en_US/champion/${this.championId}.json`
    );
    try {
      const riotApiResponse = await fetch(url.href);
      const championData: RiotGamesAllChampionsResponse = await riotApiResponse.json();
      const champion = Object.values(championData.data).shift();
      if (!champion) throw new Error();

      return champion;
    } catch (err) {
      throw new Error(`Unable to obtain champion info from riot games api: ${url.href}`);
    }
  }

  async fetchFromCDragon(): Promise<CDragonChampionData> {
    const url = new URL(
      `https://raw.communitydragon.org/${truncateVersion(this.version)}/plugins/rcp-be-lol-game-data/global/en_au/v1/champions/${this.championKey}.json`
    );
    try {
      const riotApiResponse = await fetch(url.href);
      const championData: CDragonChampionData = await riotApiResponse.json();
      if (!championData) throw new Error();

      return championData;
    } catch (err) {
      throw new Error(`Unable to obtain champion info from community dragon: ${url.href}`);
    }
  }

  async fetchFromWiki(): Promise<any> {
    //
  }

  async merge() {}
}
