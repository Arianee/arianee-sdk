import { Component, Input } from '@angular/core';
import Creator, { CreditType } from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-get-aria-balance',
  templateUrl: './action-get-aria-balance.component.html',
  styleUrls: ['./action-get-aria-balance.component.scss'],
})
export class ActionGetAriaBalanceComponent implements Action {
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
      this.result = (await this.creator.utils.getAriaBalance()).toString();
    } catch (error) {
      console.error(error);
      alert('Error while getting the aria balance, see console');
    } finally {
      this.loading = false;
    }
  }
}
