import { Component, Input } from '@angular/core';
import Creator from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-recover-smart-asset-id',
  templateUrl: './action-recover-smart-asset-id.component.html',
  styleUrls: ['./action-recover-smart-asset-id.component.scss'],
})
export class ActionRecoverSmartAssetIdComponent implements Action {
  @Input() creator: Creator<'WAIT_TRANSACTION_RECEIPT'> | null = null;

  public id: string | null = null;
  public result: string | null = null;
  public loading = false;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    try {
      this.loading = true;
      if (!this.id) {
        throw new Error('No ID set!');
      }
      await this.creator.smartAssets.recoverSmartAsset(this.id);
    } catch (error) {
      console.error(error);
      alert('Error while recovering the smart asset ID, see console');
    } finally {
      this.loading = false;
    }
  }
}
