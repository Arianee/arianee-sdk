export const getSignatureValues = (
  signature: string
): { r: string; s: string; v: number } => {
  // Ensure the signature is in the right format
  if (signature.slice(0, 2) !== '0x' && signature.length !== 132) {
    throw new Error('Invalid signature');
  }

  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);
  return { r, s, v };
};
