import { Component, Input } from '@angular/core';
import Creator, { CreditType } from '@arianee/creator';
import { Action } from '../action';
import { generateRandomPassphrase } from '../../../../../../../packages/utils/src';

@Component({
  selector: 'app-action-buy-credit',
  templateUrl: './action-buy-credit.component.html',
  styleUrls: ['./action-buy-credit.component.scss'],
})
export class ActionBuyCreditComponent implements Action {
  @Input() creator: Creator | null = null;

  public creditType: string = '0';
  public amount: string | null = null;
  public result: string | null = null;
  public loading = false;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    if (!this.amount) {
      alert('Amount not set!');
      return;
    }

    try {
      this.loading = true;
      await this.creator.buyCredit(
        parseInt(this.creditType) as CreditType,
        parseInt(this.amount.trim())
      );
    } catch (error) {
      console.error(error);
      alert('Error, see console');
    } finally {
      this.loading = false;
    }
  }
}