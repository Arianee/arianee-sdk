import { Component } from '@angular/core';
import { CreatorService } from '../../services/creator/creator.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public creatorAddress: string = '0x6C0084Bb281dcE6B0f0cc86191086531A50dDf04';
  public privateKey: string = '';
  public mnemonic: string =
    'sunset setup moral spoil stomach flush document expand rent siege perfect gauge';
  public slug: string = 'testnet';
  public slugOverride: string = '';

  public loading = false;
  public errors = '';

  constructor(public creatorService: CreatorService) {}

  public async tryConnect() {
    let _slug: string =
      this.slugOverride.length > 0 ? this.slugOverride : this.slug;

    let _creatorAddress: string = this.creatorAddress;

    let _auth =
      this.privateKey.length > 0
        ? { privateKey: this.privateKey }
        : { mnemonic: this.mnemonic };

    if (_slug.length === 0) {
      alert('Invalid slug');
      return;
    }

    if (_creatorAddress.length === 0) {
      alert('Invalid creator address');
    }

    this.loading = true;
    try {
      await this.creatorService.connect(_auth, _creatorAddress, _slug);
      this.errors = '';
    } catch (e) {
      if (e instanceof Error) this.errors = e.message + '<br/>' + this.errors;
    } finally {
      this.loading = false;
    }
  }

  public get protocolDetails() {
    return JSON.stringify(
      this.creatorService.creator.getValue()?.connectedProtocolClient
        ?.protocolDetails,
      null,
      2
    );
  }
}
