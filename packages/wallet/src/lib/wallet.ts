
import {Core} from "@arianee-sdk/core";

export class Wallet{

  public sign(){
    const core = new Core();
    console.log(core.signMessage('test'));
  }

}
