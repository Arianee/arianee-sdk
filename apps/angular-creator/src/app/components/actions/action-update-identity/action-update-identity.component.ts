import { Component, Input } from '@angular/core';
import Creator, { NoIdentityError } from '@arianee/creator';
import { Action } from '../action';
import { ArianeeBrandIdentityI18N } from '../../../../../../../packages/common-types/src';

@Component({
  selector: 'app-action-update-identity',
  templateUrl: './action-update-identity.component.html',
  styleUrls: ['./action-update-identity.component.scss'],
})
export class ActionUpdateIdentityComponent implements Action {
  @Input() creator: Creator | null = null;

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

      const req = await fetch(this.uri);
      if (!req.ok) {
        throw new Error('Error while fetching uri');
      }

      let identityContent: ArianeeBrandIdentityI18N;
      try {
        identityContent = await req.json();
      } catch (e) {
        throw new Error('Error while parsing json from content');
      }

      const imprint = await this.creator.utils.calculateImprint(
        identityContent
      );

      const receipt = await this.creator.identities.updateIdentity({
        uri: this.uri,
        imprint,
      });

      this.result = JSON.stringify(receipt, null, 2);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof NoIdentityError) {
        alert('You need to have an identity to use updateIdentity');
      } else {
        alert('Error while updating the identity, see console');
      }
    } finally {
      this.loading = false;
    }
  }
}
