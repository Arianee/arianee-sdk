import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import Wallet, {
  IdentityInstance,
  IdentityUpdatedEvent,
} from '@arianee/wallet';
import { BrandIdentityWithOwned, ChainType } from '@arianee/common-types';

@Component({
  selector: 'app-wallet-identities',
  templateUrl: './wallet-identities.component.html',
  styleUrls: ['./wallet-identities.component.scss'],
})
export class WalletIdentities implements OnInit {
  public identities: IdentityInstance<BrandIdentityWithOwned>[] = [];
  public loading = false;

  public eventsLog = '';

  private wallet?: Wallet<ChainType>;

  constructor(public walletService: WalletService) {}

  ngOnInit(): void {
    this.walletService.wallet.subscribe(async (wallet) => {
      this.loading = true;

      this.wallet?.identity.updated.removeAllListeners();

      this.eventsLog = '';

      this.wallet = wallet;

      this.wallet.identity.updated.addListener(this.identityUpdated.bind(this));

      this.identities = await wallet.identity.getOwnedSmartAssetsIdentities();

      this.loading = false;
    });
  }

  public identityUpdated(event: IdentityUpdatedEvent) {
    this.eventsLog += `Identity ${event.issuer} updated on ${event.protocol.name}\n`;
  }

  public stringify(obj: any) {
    return JSON.stringify(obj, null, 2);
  }
}
