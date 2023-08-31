import { Component, Input } from '@angular/core';
import Creator, {
  InsufficientEventCreditsError,
  InvalidURIError,
  UnavailableEventIdError,
} from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-create-event',
  templateUrl: './action-create-event.component.html',
  styleUrls: ['./action-create-event.component.scss'],
})
export class ActionCreateEventComponent implements Action {
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
      const createdMessage = await this.creator.events.createEvent({
        smartAssetId: parseInt(this.smartAssetId),
        uri: this.uri,
        eventId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
      });

      this.result = JSON.stringify(createdMessage, null, 2);
    } catch (error) {
      if (error instanceof InsufficientEventCreditsError) {
        alert('You do not have enough event credits!');
      } else if (error instanceof UnavailableEventIdError) {
        alert('This event ID is not available!');
      } else if (error instanceof InvalidURIError) {
        alert('This URI is not valid!');
      } else {
        console.error(error);
        alert('Error while creating the event, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
