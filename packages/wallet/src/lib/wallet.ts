import {testType} from "@arianee-sdk/protocol-types";
import {Core} from "@arianee-sdk/core";

export class Wallet{

  public init(type:testType){
    console.log('init')
  }

  public sign(){
    const core = new Core();
    console.log(core.signMessage('test'));
  }

}
