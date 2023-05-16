import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { WalletHeader } from './components/wallet-header/wallet-header.component';
import { WalletNfts } from './components/wallet-nfts/wallet-nfts.component';
import { WalletIdentities } from './components/wallet-identities/wallet-identities.component';
import { WalletMessages } from './components/wallet-messages/wallet-messages.component';

@NgModule({
  declarations: [
    AppComponent,
    WalletHeader,
    WalletNfts,
    WalletIdentities,
    WalletMessages,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
