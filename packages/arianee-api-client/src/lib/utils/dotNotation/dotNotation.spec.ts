import { convertObjectToDotNotation } from './dotNotation';

describe('dotNotation', () => {
  it('should convert a javascript object to dot notation', () => {
    const res = convertObjectToDotNotation({
      createdAfter: '2023-05-12T12:47:39.463Z',
      returnValues: {
        _from: '0x19FBcF704e4CA7089D8382FBeB8cacdE568710ca',
      },
    });

    expect(res).toEqual(
      'createdAfter=2023-05-12T12:47:39.463Z&returnValues._from=0x19FBcF704e4CA7089D8382FBeB8cacdE568710ca'
    );
  });
});
