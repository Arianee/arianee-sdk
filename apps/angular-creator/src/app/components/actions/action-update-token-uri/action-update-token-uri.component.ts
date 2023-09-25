import { Component, Input } from '@angular/core';
import Creator, { InvalidURIError, NotOwnerError } from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-update-token-uri',
  templateUrl: './action-update-token-uri.component.html',
  styleUrls: ['./action-update-token-uri.component.scss'],
})
export class ActionUpdateTokenURIComponent implements Action {
  @Input() creator: Creator<'WAIT_TRANSACTION_RECEIPT'> | null = null;

  public id: string = '';
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
      await this.creator.smartAssets.updateTokenURI(this.id, this.uri);
    } catch (error) {
      console.error(error);

      if (error instanceof NotOwnerError) {
        alert('You are not the owner of this smart asset');
      } else if (error instanceof InvalidURIError) {
        alert('This URI is not valid!');
      } else {
        alert('Error while updating the token URI, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
