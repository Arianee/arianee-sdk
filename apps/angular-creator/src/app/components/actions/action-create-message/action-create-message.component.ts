import { Component, Input } from '@angular/core';
import Creator, {
  InsufficientMessageCreditsError,
  InsufficientSmartAssetCreditsError,
  InvalidURIError,
  UnavailableSmartAssetIdError,
} from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-create-message',
  templateUrl: './action-create-message.component.html',
  styleUrls: ['./action-create-message.component.scss'],
})
export class ActionCreateMessageComponent implements Action {
  public result: string | null = null;
  @Input() creator: Creator | null = null;

  public smartAssetId: string = '';
  public id: string | null = null;
  public uri: string = '';
  public loading = false;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    try {
      this.loading = true;
      const createdMessage = await this.creator.createMessage({
        smartAssetId: parseInt(this.smartAssetId),
        uri: this.uri,
        messageId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
      });

      this.result = JSON.stringify(createdMessage, null, 2);
    } catch (error) {
      if (error instanceof InsufficientMessageCreditsError) {
        alert('You do not have enough message credits!');
      } else if (error instanceof InvalidURIError) {
        alert('This URI is not valid!');
      } else {
        console.error(error);
        alert('Error while creating the message, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
