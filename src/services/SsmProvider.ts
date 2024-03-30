export abstract class SsmProvider {
  abstract getParameterFromSsm(path: string, withDecryption: boolean): Promise<string | undefined | null>;
}
