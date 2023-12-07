import { SignatureTransfer } from './signatureTransfer'
import { MaxUnorderedNonce, MaxTokenId, MaxSigDeadline } from './constants'

describe('SignatureTransfer', () => {
  describe('Max values', () => {
    it('max values', () => {
      expect(() =>
        SignatureTransfer.hash(
          {
            permitted: {
              token: '0x0000000000000000000000000000000000000000',
              tokenId: MaxTokenId.toString(),
            },
            spender: '0x0000000000000000000000000000000000000000',
            nonce: MaxUnorderedNonce.toString(),
            deadline: MaxSigDeadline.toString(),
          },
          '0x0000000000000000000000000000000000000000',
          1
        )
      ).not.toThrow()
    })

    it('nonce out of range', () => {
      expect(() =>
        SignatureTransfer.hash(
          {
            permitted: {
              token: '0x0000000000000000000000000000000000000000',
              tokenId: '0',
            },
            spender: '0x0000000000000000000000000000000000000000',
            nonce: MaxUnorderedNonce.add(1).toString(),
            deadline: '0',
          },
          '0x0000000000000000000000000000000000000000',
          1
        )
      ).toThrow('NONCE_OUT_OF_RANGE')
    })

    it('token id out of range', () => {
      expect(() =>
        SignatureTransfer.hash(
          {
            permitted: {
              token: '0x0000000000000000000000000000000000000000',
              tokenId: MaxTokenId.add(1).toString(),
            },
            spender: '0x0000000000000000000000000000000000000000',
            nonce: '0',
            deadline: '0',
          },
          '0x0000000000000000000000000000000000000000',
          1
        )
      ).toThrow('TOKEN_ID_OUT_OF_RANGE')
    })

    it('deadline out of range', () => {
      expect(() =>
        SignatureTransfer.hash(
          {
            permitted: {
              token: '0x0000000000000000000000000000000000000000',
              tokenId: '0',
            },
            spender: '0x0000000000000000000000000000000000000000',
            nonce: '0',
            deadline: MaxSigDeadline.add(1).toString(),
          },
          '0x0000000000000000000000000000000000000000',
          1
        )
      ).toThrow('SIG_DEADLINE_OUT_OF_RANGE')
    })
  })

  it('non-batch, no witness', () => {
    expect(
      SignatureTransfer.hash(
        {
          permitted: {
            token: '0x0000000000000000000000000000000000000000',
            tokenId: '0',
          },
          spender: '0x0000000000000000000000000000000000000000',
          nonce: '0',
          deadline: '0',
        },
        '0x0000000000000000000000000000000000000000',
        1
      )
    ).toBe('0xc9cb1598e894e8d3da3605fad9d21af0f36a9b7d5a5f134b6313046f88beff07')
  })

  it('non-batch, witness', () => {
    expect(
      SignatureTransfer.hash(
        {
          permitted: {
            token: '0x0000000000000000000000000000000000000000',
            tokenId: '0',
          },
          spender: '0x0000000000000000000000000000000000000000',
          nonce: '0',
          deadline: '0',
        },
        '0x0000000000000000000000000000000000000000',
        1,
        {
          witnessTypeName: 'MockWitness',
          witnessType: { MockWitness: [{ name: 'mock', type: 'uint256' }] },
          witness: { mock: '0x0000000000000000000000000000000000000000000000000000000000000000' },
        }
      )
    ).toBe('0xd209568be669b1fdc9977125530208893e896382f8bb748cf3387dc95ff7d223')
  })

  it('batch, no witness', () => {
    expect(
      SignatureTransfer.hash(
        {
          permitted: [
            {
              token: '0x0000000000000000000000000000000000000000',
              tokenId: '0',
            },
          ],
          spender: '0x0000000000000000000000000000000000000000',
          nonce: '0',
          deadline: '0',
        },
        '0x0000000000000000000000000000000000000000',
        1
      )
    ).toBe('0xf767db40633ba61fd2d2ae4f6e589804678d31edbefe6a1c2de5a79d9fc33b31')
  })

  it('batch, witness', () => {
    expect(
      SignatureTransfer.hash(
        {
          permitted: [
            {
              token: '0x0000000000000000000000000000000000000000',
              tokenId: '0',
            },
          ],
          spender: '0x0000000000000000000000000000000000000000',
          nonce: '0',
          deadline: '0',
        },
        '0x0000000000000000000000000000000000000000',
        1,
        {
          witnessTypeName: 'MockWitness',
          witnessType: { MockWitness: [{ name: 'mock', type: 'uint256' }] },
          witness: { mock: '0x0000000000000000000000000000000000000000000000000000000000000000' },
        }
      )
    ).toBe('0x1bb742c8ce2509c211d18e09202444363c2c26557feb9c1ae7e55f7466decfe1')
  })
})
