import { Component, Input } from '@angular/core';
import Creator, { CreditType } from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-get-credit-price',
  templateUrl: './action-get-credit-price.component.html',
  styleUrls: ['./action-get-credit-price.component.scss'],
})
export class ActionGetCreditPriceComponent implements Action {
  @Input() creator: Creator | null = null;

  public creditType: string = '0';
  public result: string | null = null;
  public loading = false;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    try {
      this.loading = true;
      this.result = (
        await this.creator.utils.getCreditPrice(
          parseInt(this.creditType) as CreditType
        )
      ).toString();
    } catch (error) {
      console.error(error);
      alert('Error while getting the credit price, see console');
    } finally {
      this.loading = false;
    }
  }
}