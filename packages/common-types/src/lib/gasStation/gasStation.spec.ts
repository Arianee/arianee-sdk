import { GasStation } from './gasStation';

it('works', () => {
  expect(true).toBe(true);
});

describe('GasStation', () => {
  const fetchLike = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGasPrice', () => {
    it('should fetch the gasStation with the fetchLike function and return the standard gas price in gwei', async () => {
      const gasStation = new GasStation('https://gasStation.com/', fetchLike);

      fetchLike.mockResolvedValue({
        json: () =>
          Promise.resolve({
            standard: 1,
          }),
      });

      const gasPrice = await gasStation.getGasPrice();

      expect(gasPrice).toEqual(BigInt(1000000000));
      expect(fetchLike).toHaveBeenCalledWith('https://gasStation.com/');
    });
  });
});
