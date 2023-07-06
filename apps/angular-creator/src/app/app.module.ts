import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule } from '@angular/forms';
import { ActionsComponent } from './components/actions/actions.component';
import { ActionGetAvailableSmartAssetIdComponent } from './components/actions/action-get-available-smart-asset-id/action-get-available-smart-asset-id.component';
import { ActionReserveSmartAssetIdComponent } from './components/actions/action-reserve-smart-asset-id/action-reserve-smart-asset-id.component';
import { ActionGetCreditBalance } from './components/actions/action-get-credit-balance/action-get-credit-balance.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ActionsComponent,
    ActionGetAvailableSmartAssetIdComponent,
    ActionReserveSmartAssetIdComponent,
    ActionGetCreditBalance,
  ],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
