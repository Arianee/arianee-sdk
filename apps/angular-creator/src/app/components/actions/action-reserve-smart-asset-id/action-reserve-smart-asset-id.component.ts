import { Component, Input } from '@angular/core';
import Creator from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-reserve-smart-asset-id',
  templateUrl: './action-reserve-smart-asset-id.component.html',
  styleUrls: ['./action-reserve-smart-asset-id.component.scss'],
})
export class ActionReserveSmartAssetIdComponent implements Action {
  @Input() creator: Creator | null = null;

  public id: string | null = null;
  public result: string | null = null;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    try {
      await this.creator.reserveSmartAssetId(
        this.id ? parseInt(this.id.trim()) : undefined
      );
    } catch (error) {
      console.error(error);
      alert('Error while reserving the smart asset ID, see console');
    }
  }
}