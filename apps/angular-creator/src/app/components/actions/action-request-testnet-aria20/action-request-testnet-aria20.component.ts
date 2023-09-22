import { Component, Input } from '@angular/core';
import Creator, {
  CreditType,
  ProtocolCompatibilityError,
} from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-request-testnet-aria20',
  templateUrl: './action-request-testnet-aria20.component.html',
  styleUrls: ['./action-request-testnet-aria20.component.scss'],
})
export class ActionRequestTestnetAria20Component implements Action {
  @Input() creator: Creator<'WAIT_TRANSACTION_RECEIPT'> | null = null;

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
        await this.creator.utils.requestTestnetAria20()
      ).toString();
    } catch (error) {
      if (error instanceof ProtocolCompatibilityError) {
        alert('Protocol compatibility error:\n' + error.message);
      } else {
        console.error(error);
        alert('Error while requesting testnet aria20, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
