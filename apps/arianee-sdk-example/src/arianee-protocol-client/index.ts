import ArianeeProtocolClient from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';

export default async () => {
  const client = new ArianeeProtocolClient(
    Core.fromMnemonic(
      'sunset setup moral spoil stomach flush document expand rent siege perfect gauge'
    )
  );
  const protocol = await client.connect('sokol');
};
