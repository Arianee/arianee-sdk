import { Component, Input } from '@angular/core';
import Creator, {
  InsufficientSmartAssetCreditsError,
  InvalidURIError,
  UnavailableSmartAssetIdError,
} from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-create-smart-asset',
  templateUrl: './action-create-smart-asset.component.html',
  styleUrls: ['./action-create-smart-asset.component.scss'],
})
export class ActionCreateSmartAssetComponent implements Action {
  @Input() creator: Creator | null = null;

  public id: string | null = null;
  public uri: string = '';
  public result: string | null = null;
  public loading = false;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    try {
      this.loading = true;
      const linkObject = await this.creator.smartAssets.createSmartAsset({
        smartAssetId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
        uri: this.uri,
      });

      this.result = JSON.stringify(linkObject, null, 2);
    } catch (error) {
      if (error instanceof InsufficientSmartAssetCreditsError) {
        alert('You do not have enough credits!');
      } else if (error instanceof UnavailableSmartAssetIdError) {
        alert('This smart asset ID is not available!');
      } else if (error instanceof InvalidURIError) {
        alert('This URI is not valid!');
      } else {
        console.error(error);
        alert('Error while creating the smart asset, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
