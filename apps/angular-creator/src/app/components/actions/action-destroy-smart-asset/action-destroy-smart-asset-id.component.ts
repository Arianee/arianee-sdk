import { Component, Input } from '@angular/core';
import Creator from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-destroy-smart-asset-id',
  templateUrl: './action-destroy-smart-asset-id.component.html',
  styleUrls: ['./action-destroy-smart-asset-id.component.scss'],
})
export class ActionDestroySmartAssetIdComponent implements Action {
  @Input() creator: Creator | null = null;

  public id: string | null = null;
  public result: string | null = null;
  public loading = false;
  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    try {
      if (!this.id) {
        throw new Error('No ID set!');
      }
      this.loading = true;
      await this.creator.smartAssets.destroySmartAsset(this.id);
    } catch (error) {
      console.error(error);
      alert('Error while destroying the smart asset ID, see console');
    } finally {
      this.loading = false;
    }
  }
}
