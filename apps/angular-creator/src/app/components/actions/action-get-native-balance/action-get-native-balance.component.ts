import { Component, Input } from '@angular/core';
import Creator from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-get-native-balance',
  templateUrl: './action-get-native-balance.component.html',
  styleUrls: ['./action-get-native-balance.component.scss'],
})
export class ActionGetNativeBalanceComponent implements Action {
  @Input() creator: Creator | null = null;

  public result: string | null = null;
  public loading = false;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    try {
      this.loading = true;
      this.result = (await this.creator.utils.getNativeBalance()).toString();
    } catch (error) {
      console.error(error);
      alert('Error while getting the native balance, see console');
    } finally {
      this.loading = false;
    }
  }
}
