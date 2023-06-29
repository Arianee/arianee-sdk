import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import Wallet, {
  ArianeeEventReceivedEvent,
  SmartAssetInstance,
  SmartAssetReceivedEvent,
  SmartAssetTransferedEvent,
} from '@arianee/wallet';
import { ChainType } from '@arianee/common-types';

@Component({
  selector: 'app-wallet-nfts',
  templateUrl: './wallet-nfts.component.html',
  styleUrls: ['./wallet-nfts.component.scss'],
})
export class WalletNfts implements OnInit {
  public nfts: SmartAssetInstance<ChainType>[] = [];
  public loading = false;

  public eventsLog = '';

  private wallet?: Wallet<ChainType>;

  constructor(public walletService: WalletService) {}

  ngOnInit(): void {
    this.walletService.wallet.subscribe(async (wallet) => {
      this.loading = true;

      this.wallet?.smartAsset.received.removeAllListeners();
      this.wallet?.smartAsset.transferred.removeAllListeners();
      this.wallet?.smartAsset.arianeeEventReceived.removeAllListeners();

      this.eventsLog = '';

      this.wallet = wallet;

      this.wallet.smartAsset.received.addListener(
        this.smartAssetReceived.bind(this)
      );

      this.wallet.smartAsset.transferred.addListener(
        this.smartAssetTransferred.bind(this)
      );

      this.wallet.smartAsset.arianeeEventReceived.addListener(
        this.arianeeEventReceived.bind(this)
      );

      this.nfts = await wallet.smartAsset.getOwned();

      this.loading = false;
    });
  }

  public smartAssetReceived(event: SmartAssetReceivedEvent) {
    this.eventsLog += `Received smart asset ${event.certificateId} from ${event.from} on ${event.protocol.name}\n`;
  }

  public smartAssetTransferred(event: SmartAssetTransferedEvent) {
    this.eventsLog += `Transferred smart asset ${event.certificateId} to ${event.to} on ${event.protocol.name}\n`;
  }

  public arianeeEventReceived(event: ArianeeEventReceivedEvent) {
    this.eventsLog += `Arianee event (${event.eventId}) received on smart asset ${event.certificateId} on ${event.protocol.name}\n`;
  }

  public stringify(obj: any) {
    return JSON.stringify(obj, null, 2);
  }
}
