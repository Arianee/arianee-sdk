import ArianeeProtocolClient, {
  ProtocolClientV1,
} from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';

export default async () => {
  const core = Core.fromMnemonic(
    'sunset setup moral spoil stomach flush document expand rent siege perfect gauge'
  );

  const slug = 'testnet';

  const client = new ArianeeProtocolClient(core);
  const protocol = await client.connect(slug);

  console.log(
    '#############\nTesting contract interactions on protocol with slug "' +
      slug +
      '"\n'
  );

  if (protocol instanceof ProtocolClientV1) {
    const [
      identityURI,
      balanceOf,
      ariaBalanceOf,
      creditBalanceOf,
      eventIdToToken,
      messageLengthByReceiver,
      creditPriceUSD,
      updatedImprint,
      addressToAbility,
      addAddressToWhitelist,
    ] = await Promise.all([
      protocol.identityContract.addressURI(
        '0x305051e9a023fe881EE21cA43fd90c460B427Caa'
      ),
      protocol.smartAssetContract.balanceOf(
        '0xa9bc90d24d0b8495043ab5857455444630028caf'
      ),
      protocol.ariaContract.balanceOf(
        '0xa9bc90d24d0b8495043ab5857455444630028caf'
      ),
      protocol.creditHistoryContract.balanceOf(
        '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
        1
      ),
      protocol.eventContract.eventIdToToken('148288273'),
      protocol.messageContract.messageLengthByReceiver(
        '0xa9bc90d24d0b8495043ab5857455444630028caf'
      ),
      protocol.storeContract.creditPriceUSD(0),
      protocol.updateSmartAssetContract.getUpdatedImprint(58824256),
      protocol.whitelistContract.isAuthorized(
        1,
        '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
        '0x305051e9a023fe881EE21cA43fd90c460B427Caa'
      ),
      protocol.userActionContract.addAddressToWhitelist(
        58824256,
        '0x305051e9a023fe881EE21cA43fd90c460B427Caa'
      ),
    ]);

    console.log(
      '1) IdentityContract\n\taddressURI("0x305051e9a023fe881EE21cA43fd90c460B427Caa")\n\t> ' +
        identityURI
    );

    console.log(
      '2) SmartAssetContract\n\tbalanceOf("0xa9bc90d24d0b8495043ab5857455444630028caf")\n\t> ' +
        balanceOf
    );

    console.log(
      '3) AriaContract\n\tbalanceOf("0xa9bc90d24d0b8495043ab5857455444630028caf")\n\t> ' +
        ariaBalanceOf
    );

    console.log(
      '4) CreditHistoryContract\n\tbalanceOf("0x305051e9a023fe881EE21cA43fd90c460B427Caa")\n\t> ' +
        creditBalanceOf
    );

    console.log(
      '4) EventContract\n\teventIdToToken("148288273")\n\t> ' + eventIdToToken
    );

    console.log(
      '5) MessageContract\n\tmessageLengthByReceiver("0xa9bc90d24d0b8495043ab5857455444630028caf")\n\t> ' +
        messageLengthByReceiver
    );

    console.log('6) StoreContract\n\tcreditPriceUSD(0)\n\t> ' + creditPriceUSD);

    console.log(
      '7) UpdateSmartAssetContract\n\tgetUpdatedImprint(58824256)\n\t> ' +
        updatedImprint
    );

    console.log(
      '8) UpdateSmartAssetContract\n\tgetUpdatedImprint(58824256)\n\t> ' +
        updatedImprint
    );
    console.log(
      '9) WhitelistContract\n\tisAuthorized(1, "0x305051e9a023fe881EE21cA43fd90c460B427Caa", "0x305051e9a023fe881EE21cA43fd90c460B427Caa")\n\t> ' +
        addressToAbility
    );
    console.log(
      '10) UserActionContract\n\taddAddressToWhitelist(58824256, "0x305051e9a023fe881EE21cA43fd90c460B427Caa")\n\t> ' +
        JSON.stringify(await addAddressToWhitelist.wait())
    );
  } else {
    console.warn('protocol v2 is not yet implemented');
  }
};
