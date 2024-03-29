import { truncateVersion } from '@utils/common';

describe('common', () => {
  describe('truncateVersion', () => {
    test('truncateVersion successful #1', () => {
      const result = truncateVersion('14.6.1');

      expect(result).toStrictEqual('14.6');
    });

    test('truncateVersion successful #2', () => {
      const result = truncateVersion('1.1.3216176');

      expect(result).toStrictEqual('1.1');
    });

    test('truncateVersion successful #3', () => {
      const result = truncateVersion('1.4');

      expect(result).toStrictEqual('1.4');
    });

    test('truncateVersion failure', () => {
      const result = () => truncateVersion('10');

      expect(result).toThrow(Error);
    });
  });
});
