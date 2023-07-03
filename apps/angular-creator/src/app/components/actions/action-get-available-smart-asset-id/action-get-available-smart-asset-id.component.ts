import { Component, Input } from '@angular/core';
import Creator from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-get-available-smart-asset-id',
  templateUrl: './action-get-available-smart-asset-id.component.html',
  styleUrls: ['./action-get-available-smart-asset-id.component.scss'],
})
export class ActionGetAvailableSmartAssetIdComponent implements Action {
  @Input() creator: Creator | null = null;

  public result: string | null = null;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    this.result = (await this.creator.getAvailableSmartAssetId()).toString();
  }
}
