import { Component } from '@angular/core';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-wallet-header',
  templateUrl: './wallet-header.component.html',
  styleUrls: ['./wallet-header.component.scss'],
})
export class WalletHeader {
  constructor(public walletService: WalletService) {}
}
