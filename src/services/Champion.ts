import type { RiotGamesChampionData, RiotGamesAllChampionsResponse } from 'types/ddragon.types';
import { truncateVersion } from '../utils/common';
import type { CDragonChampionData } from 'types/cdragon.types';
import OpenAI from 'openai';

import openAIChampionSchema from '../../types/openaiChampion.json';
import type { PutItemInput } from '@aws-sdk/client-dynamodb';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import type { FinalChampion } from 'types/champion.types';
import custom from '../../sls/custom';
import { ServerError } from './Error';
import type Logger from '@src/utils/Logger';
import axios from 'axios';

export class Champion {
  private openai: OpenAI | null = null;

  constructor(
    private readonly version: string,
    private readonly championId: string,
    private readonly championKey: string,
    private readonly logger: Logger
  ) {
    this.logger.debug('Initialising Champion...');
  }

  async initOpenAI() {
    this.logger.debug('Initialising OpenAI...');

    if (this.openai) return this.openai;

    this.logger.debug('Getting OpenAI ApiKey...');

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Unable to obtain openapi api key.');
    }

    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (!this.openai) {
      throw new Error('Unable to initialise openai');
    }

    this.logger.debug('Returning OpenAI...');

    return this.openai;
  }

  private async fetchFromRiotApi(): Promise<RiotGamesChampionData> {
    this.logger.debug('Fetching champion from RiotGames API...');

    try {
      const url = new URL(
        `https://ddragon.leagueoflegends.com/cdn/${this.version}/data/en_US/champion/${this.championId}.json`
      );
      const riotApiResponse = await axios.get<RiotGamesAllChampionsResponse>(url.href, {
        headers: { Accept: 'application/json' }
      });
      const champion = Object.values(riotApiResponse.data.data).shift();
      if (!champion) throw new Error('Obtained null riot games api champion data');

      this.logger.debug('RiotGames API', champion);

      return champion;
    } catch (err) {
      this.logger.error('Unable to obtain champion info from riot games api', err);
      throw new ServerError('Unable to obtain champion info from riot games api');
    }
  }

  private async fetchFromCDragon(): Promise<CDragonChampionData> {
    this.logger.debug('Fetching champion from community dragon API...');
    try {
      const url = new URL(
        `https://raw.communitydragon.org/${truncateVersion(this.version)}/plugins/rcp-be-lol-game-data/global/en_au/v1/champions/${this.championKey}.json`
      );
      const cDragonResponse = await axios.get<CDragonChampionData>(url.href, {
        headers: { Accept: 'application/json' }
      });
      const championData = cDragonResponse.data;
      this.logger.debug('response body', championData);
      if (!championData) throw new Error('Obtained null community dragon champion data');

      return championData;
    } catch (err) {
      this.logger.error('Unable to obtain champion info from community dragon', err);
      throw new Error('Unable to obtain champion info from community dragon');
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

  async putDynamoDocument(version: string, champion: FinalChampion): Promise<void> {
    this.logger.debug('Putting in DynamoDb...');

    const client = new DynamoDBClient({ logger: this.logger });

    const input: PutItemInput = {
      TableName: custom.championsTableName,
      Item: marshall({ ...champion, version })
    };

    const command = new PutItemCommand(input);
    await client.send(command);
  }

  async getFinalChampion(): Promise<FinalChampion> {
    this.logger.debug('Running getFinalChampion...');

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

    this.logger.debug('Obtained All Champion Data');

    await this.initOpenAI();
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

    this.logger.debug('Obtained openai response', rawChampion);

    const champion = rawChampion.choices[0]?.message.content || null;

    if (!champion) throw new ServerError('Invalid response from openai');

    const finalChamp = JSON.parse(champion) as FinalChampion;

    return finalChamp;
  }
}
