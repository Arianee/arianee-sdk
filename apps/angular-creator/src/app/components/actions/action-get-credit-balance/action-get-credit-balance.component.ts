import { Component, Input } from '@angular/core';
import Creator from '@arianee/creator';
import { Action } from '../action';
import { isConnectedToV2Protocol } from '../../../helpers/isConnectedToV2Protocol';
import { getV2ContractAddressForCreditType } from '../../../helpers/getV2ContractAddressForCreditType';

@Component({
  selector: 'app-action-get-credit-balance',
  templateUrl: './action-get-credit-balance.component.html',
  styleUrls: ['./action-get-credit-balance.component.scss'],
})
export class ActionGetCreditBalance implements Action {
  @Input() creator: Creator<'WAIT_TRANSACTION_RECEIPT'> | null = null;

  public id: string | null = null;
  public creditType: string = '0';
  public result: string | null = null;
  public loading = false;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    this.loading = true;

    const isV2Protocol = isConnectedToV2Protocol(this.creator);

    if (isV2Protocol) {
      this.result = (
        await this.creator.utils.getCreditBalance(
          undefined,
          this.creator.core.getAddress(),
          getV2ContractAddressForCreditType(
            parseInt(this.creditType),
            this.creator
          )
        )
      ).toString();
    } else {
      this.result = (
        await this.creator.utils.getCreditBalance(parseInt(this.creditType))
      ).toString();
    }
    this.loading = false;
  }
}
