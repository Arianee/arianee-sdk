import { Component, Input } from '@angular/core';
import Creator, {
  InsufficientUpdateCreditsError,
  NoIdentityError,
} from '@arianee/creator';
import { Action } from '../action';
import { ArianeeProductCertificateI18N } from '@arianee/common-types';

@Component({
  selector: 'app-action-update-smart-asset',
  templateUrl: './action-update-smart-asset.component.html',
  styleUrls: ['./action-update-smart-asset.component.scss'],
})
export class ActionUpdateSmartAssetComponent implements Action {
  public result: string | null = null;
  @Input() creator: Creator | null = null;

  public smartAssetId: string = '';
  public content: string = JSON.stringify(
    {
      $schema:
        'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
    },
    null,
    2
  );
  public loading = false;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    let content: ArianeeProductCertificateI18N;
    try {
      content = JSON.parse(this.content);
    } catch {
      alert('Content is not a valid JSON');
      return;
    }

    try {
      this.loading = true;
      this.result = JSON.stringify(
        await this.creator.smartAssets.updateSmartAsset(
          this.smartAssetId,
          content
        ),
        null,
        2
      );
    } catch (error) {
      if (error instanceof InsufficientUpdateCreditsError) {
        alert('You do not have enough event credits!');
      } else if (error instanceof NoIdentityError) {
        alert('You need to have an identity to use updateSmartAsset');
      } else {
        console.error(error);
        alert('Error while updating the smart asset, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
