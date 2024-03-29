import { Component, Input } from '@angular/core';
import Creator, {
  InsufficientSmartAssetCreditsError,
  NoIdentityError,
  UnavailableSmartAssetIdError,
} from '@arianee/creator';
import { Action } from '../action';
import { ArianeeProductCertificateI18N } from '../../../../../../../packages/common-types/src';

@Component({
  selector: 'app-action-create-and-store-smart-asset',
  templateUrl: './action-create-and-store-smart-asset.component.html',
  styleUrls: ['./action-create-and-store-smart-asset.component.scss'],
})
export class ActionCreateAndStoreSmartAssetComponent implements Action {
  @Input() creator: Creator<'WAIT_TRANSACTION_RECEIPT'> | null = null;

  public id: string | null = null;
  public content: string = JSON.stringify(
    {
      $schema:
        'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
    },
    null,
    2
  );
  public result: string | null = null;
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
      const linkObject =
        await this.creator.smartAssets.createAndStoreSmartAsset({
          smartAssetId:
            this.id && this.id !== '' ? parseInt(this.id) : undefined,
          content,
        });

      this.result = JSON.stringify(linkObject, null, 2);
    } catch (error) {
      if (error instanceof InsufficientSmartAssetCreditsError) {
        alert('You do not have enough credits!');
      } else if (error instanceof UnavailableSmartAssetIdError) {
        alert('This smart asset ID is not available!');
      } else if (error instanceof NoIdentityError) {
        alert(
          'You need to have an identity to use createAndStoreSmartAsset, please use createSmartAsset instead'
        );
      } else {
        console.error(error);
        alert('Error while creating the smart asset, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
