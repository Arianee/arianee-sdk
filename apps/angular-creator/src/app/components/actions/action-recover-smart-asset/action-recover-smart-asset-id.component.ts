import { Component, Input } from '@angular/core';
import Creator from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-recover-smart-asset-id',
  templateUrl: './action-recover-smart-asset-id.component.html',
  styleUrls: ['./action-recover-smart-asset-id.component.scss'],
})
export class ActionRecoverSmartAssetIdComponent implements Action {
  @Input() creator: Creator | null = null;

  public id: string | null = null;
  public result: string | null = null;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    try {
      if (!this.id) {
        throw new Error('No ID set!');
      }
      await this.creator.recoverSmartAsset(this.id);
    } catch (error) {
      console.error(error);
      alert('Error while reserving the smart asset ID, see console');
    }
  }
}