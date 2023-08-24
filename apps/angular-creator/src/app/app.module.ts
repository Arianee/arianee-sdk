import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule } from '@angular/forms';
import { ActionsComponent } from './components/actions/actions.component';
import { ActionGetAvailableSmartAssetIdComponent } from './components/actions/action-get-available-smart-asset-id/action-get-available-smart-asset-id.component';
import { ActionReserveSmartAssetIdComponent } from './components/actions/action-reserve-smart-asset-id/action-reserve-smart-asset-id.component';
import { ActionGetCreditBalance } from './components/actions/action-get-credit-balance/action-get-credit-balance.component';
import { ActionRecoverSmartAssetIdComponent } from './components/actions/action-recover-smart-asset/action-recover-smart-asset-id.component';
import { ActionCreateSmartAssetComponent } from './components/actions/action-create-smart-asset/action-create-smart-asset.component';
import { ActionBuyCreditComponent } from './components/actions/action-buy-credit/action-buy-credit.component';
import { ActionGetCreditPriceComponent } from './components/actions/action-get-credit-price/action-get-credit-price.component';
import { ActionGetAriaBalanceComponent } from './components/actions/action-get-aria-balance/action-get-aria-balance.component';
import { ActionCreateAndStoreSmartAssetComponent } from './components/actions/action-create-and-store-smart-asset/action-create-and-store-smart-asset.component';
import { ActionDestroySmartAssetIdComponent } from './components/actions/action-destroy-smart-asset/action-destroy-smart-asset-id.component';
import { ActionGetNativeBalanceComponent } from './components/actions/action-get-native-balance/action-get-native-balance.component';
import { ActionRequestTestnetAria20Component } from './components/actions/action-request-testnet-aria20/action-request-testnet-aria20.component';
import { ActionSetRequestKeyComponent } from './components/actions/action-set-request-key/action-set-request-key.component';
import { ActionCreateMessageComponent } from './components/actions/action-create-message/action-create-message.component';
import { ActionCreateAndStoreMessageComponent } from './components/actions/action-create-and-store-message/action-create-and-store-message.component';
import { ActionCreateEventComponent } from './components/actions/action-create-event/action-create-event.component';
import { ActionCreateAndStoreEventComponent } from './components/actions/action-create-and-store-event/action-create-and-store-event.component';
import { ActionUpdateTokenURIComponent } from './components/actions/action-update-token-uri/action-update-token-uri.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ActionsComponent,
    ActionGetAvailableSmartAssetIdComponent,
    ActionReserveSmartAssetIdComponent,
    ActionGetCreditBalance,
    ActionDestroySmartAssetIdComponent,
    ActionRecoverSmartAssetIdComponent,
    ActionCreateSmartAssetComponent,
    ActionCreateAndStoreSmartAssetComponent,
    ActionBuyCreditComponent,
    ActionGetCreditPriceComponent,
    ActionGetAriaBalanceComponent,
    ActionGetNativeBalanceComponent,
    ActionRequestTestnetAria20Component,
    ActionSetRequestKeyComponent,
    ActionCreateMessageComponent,
    ActionCreateAndStoreMessageComponent,
    ActionCreateEventComponent,
    ActionCreateAndStoreEventComponent,
    ActionUpdateTokenURIComponent,
  ],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
