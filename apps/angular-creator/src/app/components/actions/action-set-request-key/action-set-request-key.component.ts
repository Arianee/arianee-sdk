import { Component, Input } from '@angular/core';
import Creator, { NotOwnerError, TokenAccess } from '@arianee/creator';
import { Action } from '../action';

@Component({
  selector: 'app-action-set-request-key',
  templateUrl: './action-set-request-key.component.html',
  styleUrls: ['./action-set-request-key.component.scss'],
})
export class ActionSetRequestKeyComponent implements Action {
  @Input() creator: Creator | null = null;

  public id: string | null = null;
  public passphrase: string | null = null;
  public publicKey: string | null = null;
  public result: string | null = null;
  public loading = false;

  public async action() {
    if (!this.creator) {
      alert('Creator not set!');
      return;
    }

    try {
      this.loading = true;

      let tokenAccess: TokenAccess | undefined = undefined;

      if (!this.id) {
        alert('Smart asset id is required');
        return;
      }

      if (this.passphrase) {
        tokenAccess = {
          fromPassphrase: this.passphrase,
        };
      } else if (this.publicKey) {
        tokenAccess = {
          address: this.publicKey,
        };
      }

      const linkObject = await this.creator.smartAssets.setRequestKey(
        this.id,
        tokenAccess
      );

      this.result = JSON.stringify(linkObject, null, 2);
    } catch (error) {
      if (error instanceof NotOwnerError) {
        alert('You are not the owner of this smart asset!');
      } else {
        console.error(error);
        alert('Error while setting the request key, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
