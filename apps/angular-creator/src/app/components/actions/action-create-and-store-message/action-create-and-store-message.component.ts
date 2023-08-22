import { Component, Input } from '@angular/core';
import Creator, {
  InsufficientMessageCreditsError,
  InsufficientSmartAssetCreditsError,
  InvalidURIError,
  NoIdentityError,
  UnavailableMessageIdError,
  UnavailableSmartAssetIdError,
} from '@arianee/creator';
import { Action } from '../action';
import { ArianeeMessageI18N } from '../../../../../../../packages/common-types/src';

@Component({
  selector: 'app-action-create-and-store-message',
  templateUrl: './action-create-and-store-message.component.html',
  styleUrls: ['./action-create-and-store-message.component.scss'],
})
export class ActionCreateAndStoreMessageComponent implements Action {
  public result: string | null = null;
  @Input() creator: Creator | null = null;

  public smartAssetId: string = '';
  public id: string | null = null;
  public content: string = JSON.stringify(
    {
      $schema: 'https://cert.arianee.org/version1/ArianeeMessage-i18n.json',
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

    let content: ArianeeMessageI18N;
    try {
      content = JSON.parse(this.content);
    } catch {
      alert('Content is not a valid JSON');
      return;
    }

    try {
      this.loading = true;
      const createdMessage = await this.creator.createAndStoreMessage({
        smartAssetId: parseInt(this.smartAssetId),
        content,
        messageId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
      });

      this.result = JSON.stringify(createdMessage, null, 2);
    } catch (error) {
      if (error instanceof InsufficientMessageCreditsError) {
        alert('You do not have enough message credits!');
      } else if (error instanceof UnavailableMessageIdError) {
        alert('This message ID is not available!');
      } else if (error instanceof NoIdentityError) {
        alert(
          'You need to have an identity to use createAndStoreMessage, please use createMessage instead'
        );
      } else {
        console.error(error);
        alert('Error while creating the message, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
