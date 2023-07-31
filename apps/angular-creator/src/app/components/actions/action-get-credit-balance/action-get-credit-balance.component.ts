import { Component, Input } from '@angular/core';
import Creator from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-get-credit-balance',
  templateUrl: './action-get-credit-balance.component.html',
  styleUrls: ['./action-get-credit-balance.component.scss'],
})
export class ActionGetCreditBalance implements Action {
  @Input() creator: Creator | null = null;

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
    this.result = (
      await this.creator.utils.getCreditBalance(parseInt(this.creditType))
    ).toString();
    this.loading = false;
  }
}
