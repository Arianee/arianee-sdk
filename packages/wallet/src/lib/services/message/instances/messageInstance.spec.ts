import { DecentralizedMessage } from '@arianee/common-types';

import MessageService from '../message';
import MessageInstance from './messageInstance';
jest.mock('../message');

describe('MessageInstance', () => {
  const messageService = new MessageService({} as any);

  describe('readMessage', () => {
    it('should call readMessage of the message service', async () => {
      const mockMessage: Partial<DecentralizedMessage> = {
        id: '123',
        protocol: {
          name: 'test',
          chainId: 1,
        },
      };

      const instance = new MessageInstance(messageService, mockMessage as any);
      await instance.readMessage();

      expect(messageService.readMessage).toHaveBeenCalledWith('test', '123');
    });
  });
});
