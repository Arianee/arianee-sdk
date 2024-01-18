import { Component, Input } from '@angular/core';
import Creator, {
  InsufficientEventCreditsError,
  NoIdentityError,
  UnavailableEventIdError,
} from '@arianee/creator';
import { Action } from '../action';
import { ArianeeEventI18N } from '@arianee/common-types';

@Component({
  selector: 'app-action-create-and-store-event',
  templateUrl: './action-create-and-store-event.component.html',
  styleUrls: ['./action-create-and-store-event.component.scss'],
})
export class ActionCreateAndStoreEventComponent implements Action {
  public result: string | null = null;
  @Input() creator: Creator<'WAIT_TRANSACTION_RECEIPT'> | null = null;

  public smartAssetId: string = '';
  public id: string | null = null;
  public useSmartAssetIssuerPrivacyGateway = true;
  public content: string = JSON.stringify(
    {
      $schema: 'https://cert.arianee.org/version1/ArianeeEvent-i18n.json',
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

    let content: ArianeeEventI18N;
    try {
      content = JSON.parse(this.content);
    } catch {
      alert('Content is not a valid JSON');
      return;
    }

    try {
      this.loading = true;
      const createdEvent = await this.creator.events.createAndStoreEvent({
        smartAssetId: parseInt(this.smartAssetId),
        content,
        eventId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
        useSmartAssetIssuerPrivacyGateway:
          this.useSmartAssetIssuerPrivacyGateway,
      });

      this.result = JSON.stringify(createdEvent, null, 2);
    } catch (error) {
      if (error instanceof InsufficientEventCreditsError) {
        alert('You do not have enough event credits!');
      } else if (error instanceof UnavailableEventIdError) {
        alert('This event ID is not available!');
      } else if (error instanceof NoIdentityError) {
        alert(
          'You need to have an identity to use createAndStoreEvent, please use createEvent instead'
        );
      } else {
        console.error(error);
        alert('Error while creating the event, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
