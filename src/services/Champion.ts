import type { RiotGamesChampionData, RiotGamesAllChampionsResponse } from 'types/ddragon.types';
import { truncateVersion } from '../utils/common';
import type { CDragonChampionData } from 'types/cdragon.types';
import chromium from '@sparticuz/chromium';
import OpenAI from 'openai';
import RealSsmProvider from '@src/services/RealSsmProvider';

import openAIChampionSchema from '../../types/openaiChampion.json';
import type { PutItemInput } from '@aws-sdk/client-dynamodb';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import type { FinalChampion } from 'types/champion.types';
import custom from '../../sls/custom';
import { ServerError } from './Error';

export class Champion {
  private openai: OpenAI | null = null;
  private openaiApiKey: string | null = null;
  private readonly getSsmProvider;

  constructor(
    private readonly version: string,
    private readonly championId: string,
    private readonly championKey: string
  ) {
    chromium.setHeadlessMode = true;
    chromium.setGraphicsMode = false;
    this.getSsmProvider = new RealSsmProvider();
  }

  async initOpenAI() {
    if (this.openai) return;

    this.openaiApiKey = await this.getSsmProvider
      .getParameterFromSsm('/accurate-data-lol/gpt/api-key', true)
      .then((res) => {
        if (!res) throw new Error('Unable to obtain gpt api key');
        return res;
      });

    if (this.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: this.openaiApiKey });
    }

    if (!this.openai) {
      throw new Error('Unable to initialise openai');
    }
  }

  private async fetchFromRiotApi(): Promise<RiotGamesChampionData> {
    const url = new URL(
      `https://ddragon.leagueoflegends.com/cdn/${this.version}/data/en_US/champion/${this.championId}.json`
    );
    try {
      const riotApiResponse = await fetch(url.href);
      const championData = (await riotApiResponse.json()) as RiotGamesAllChampionsResponse;
      const champion = Object.values(championData.data).shift();
      if (!champion) throw new Error();

      return champion;
    } catch (err) {
      throw new Error(`Unable to obtain champion info from riot games api: ${url.href}`);
    }
  }

  private async fetchFromCDragon(): Promise<CDragonChampionData> {
    const url = new URL(
      `https://raw.communitydragon.org/${truncateVersion(this.version)}/plugins/rcp-be-lol-game-data/global/en_au/v1/champions/${this.championKey}.json`
    );
    try {
      const riotApiResponse = await fetch(url.href);
      const championData = (await riotApiResponse.json()) as CDragonChampionData;
      if (!championData) throw new Error();

      return championData;
    } catch (err) {
      throw new Error(`Unable to obtain champion info from community dragon: ${url.href}`);
    }
  }

  // private async fetchFromWiki(): Promise<boolean> {
  //   console.log('here');
  //   // const browser =
  //   await puppeteer.launch({
  //     args: chromium.args,
  //     defaultViewport: chromium.defaultViewport,
  //     executablePath: await chromium.executablePath(
  //       process.env.AWS_EXECUTION_ENV ? '/opt/nodejs/node_modules/@sparticuz/chromium/bin' : undefined
  //     ),
  //     headless: chromium.headless,
  //     ignoreHTTPSErrors: true
  //   });

  //   // const page = await browser.newPage();
  //   // const domain = new URL(`https://leagueoflegends.fandom.com/wiki/Template:Data_${this.championId}`);
  //   // await page.goto(domain.href);
  //   // const element = await page.waitForSelector('.article-table');
  //   // const content = await element?.evaluate((el) => el.textContent);

  //   // console.log(content);

  //   // element?.dispose();
  //   // await browser.close();

  //   return {};
  // }

  async putDynamoDocument(champion: FinalChampion): Promise<void> {
    const client = new DynamoDBClient();

    const input: PutItemInput = {
      TableName: custom.championsTableName,
      Item: marshall(champion)
    };

    const command = new PutItemCommand(input);
    await client.send(command);
  }

  async merge(): Promise<FinalChampion> {
    await this.initOpenAI();

    const [riotGamesChampion, rawCDragonChampion] = await Promise.allSettled([
      this.fetchFromRiotApi(),
      this.fetchFromCDragon()
    ]);
    if (riotGamesChampion.status === 'rejected') {
      const reason = typeof riotGamesChampion.reason === 'string' ? riotGamesChampion.reason : null;
      throw new Error(reason || 'Failed to obtain RiotGames champion data');
    } else if (rawCDragonChampion.status === 'rejected') {
      const reason = typeof rawCDragonChampion.reason === 'string' ? rawCDragonChampion.reason : null;
      throw new Error(reason || 'Failed to obtain CDragon champion data');
    }

    if (!this.openai) throw new Error('Openai is not initialised');

    const rawChampion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: JSON.stringify(riotGamesChampion.value) },
        { role: 'system', content: JSON.stringify(rawCDragonChampion.value) },
        { role: 'system', content: JSON.stringify(openAIChampionSchema) },
        {
          role: 'user',
          content:
            'Given two distinct JSON objects with differing schemas, both describing League of Legends champions, please merge these objects into a single, unified representation that aligns with the provided TypeScript schema for a League of Legends champion. The provided schema includes many different fields for abilities, attributes (such as health, attack damage, etc.), skin details, lore, name, and roles (Top, Jungle, Mid, etc.).'
        }
      ]
    });

    const champion = rawChampion.choices[0]?.message.content || null;

    if (!champion) throw new ServerError('Invalid response from openai');

    const finalChamp = JSON.parse(champion) as FinalChampion;

    return finalChamp;
  }
}
