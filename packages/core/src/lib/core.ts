import { ethers } from "ethers";
export class Core{

  public signMessage(message:string){
    ethers.HDNodeWallet.createRandom();
    return "0x"+message;
  }
}
