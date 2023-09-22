import { Component, Input } from '@angular/core';
import Creator, { CreditType } from '@arianee/creator';
import { Action } from '../action';
import { isConnectedToV2Protocol } from '../../../helpers/isConnectedToV2Protocol';

@Component({
  selector: 'app-action-get-credit-price',
  templateUrl: './action-get-credit-price.component.html',
  styleUrls: ['./action-get-credit-price.component.scss'],
})
export class ActionGetCreditPriceComponent implements Action {
  @Input() creator: Creator<'WAIT_TRANSACTION_RECEIPT'> | null = null;

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

      const isV2Protocol = isConnectedToV2Protocol(this.creator);

      if (isV2Protocol) {
        throw new Error('cannot yet get credit price on v2 (not implemented)');
      } else {
        this.result = (
          await this.creator.utils.getCreditPrice(
            parseInt(this.creditType) as CreditType
          )
        ).toString();
      }
    } catch (error) {
      console.error(error);
      alert('Error while getting the credit price, see console');
    } finally {
      this.loading = false;
    }
  }
}
