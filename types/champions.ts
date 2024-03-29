interface IAllChampionsResponse {
  type: string;
  format: string;
  version: string;
  data: {
    [key: string]: string;
    id: string;
    key: string;
  }[];
}
