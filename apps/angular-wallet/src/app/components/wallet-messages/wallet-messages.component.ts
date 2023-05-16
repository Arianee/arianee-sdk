import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import Wallet, {
  MessageInstance,
  MessageReadEvent,
  MessageReceivedEvent,
} from '@arianee/wallet';
import { ChainType } from '@arianee/common-types';

@Component({
  selector: 'app-wallet-messages',
  templateUrl: './wallet-messages.component.html',
  styleUrls: ['./wallet-messages.component.scss'],
})
export class WalletMessages implements OnInit {
  public messages: MessageInstance[] = [];
  public loading = false;

  public eventsLog = '';

  private wallet?: Wallet<ChainType>;

  constructor(public walletService: WalletService) {}

  ngOnInit(): void {
    this.walletService.wallet.subscribe(async (wallet) => {
      this.loading = true;

      this.wallet?.message.received.removeAllListeners();
      this.wallet?.message.read.removeAllListeners();

      this.eventsLog = '';

      this.wallet = wallet;

      this.wallet.message.received.addListener(this.messageReceived.bind(this));
      this.wallet.message.read.addListener(this.messageRead.bind(this));

      this.messages = await wallet.message.getReceived();

      this.loading = false;
    });
  }

  public messageReceived(event: MessageReceivedEvent) {
    this.eventsLog += `Message ${event.messageId} received on ${event.protocol.name}\n`;
  }
  public messageRead(event: MessageReadEvent) {
    this.eventsLog += `Identity ${event.messageId} read on ${event.protocol.name}\n`;
  }

  public stringify(obj: any) {
    return JSON.stringify(obj, null, 2);
  }
}
