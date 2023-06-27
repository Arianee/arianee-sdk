import MemoryStorage from './memoryStorage';

describe('MemoryStorage', () => {
  it('should return the length of the storage', () => {
    const memoryStorage = new MemoryStorage();
    expect(memoryStorage.length).toBe(0);
    memoryStorage.setItem('key', 'value');
    expect(memoryStorage.length).toBe(1);
  });

  it('should return the value behind the key', () => {
    const memoryStorage = new MemoryStorage();
    memoryStorage.setItem('key', 'value');

    expect(memoryStorage.getItem('key')).toEqual('value');
  });

  it('should remove the key / value', () => {
    const memoryStorage = new MemoryStorage();
    memoryStorage.setItem('key', 'value');
    expect(memoryStorage.getItem('key')).toEqual('value');
    memoryStorage.removeItem('key');
    expect(memoryStorage.getItem('key')).toEqual(null);
  });

  it('should return the name of the nth key', () => {
    const memoryStorage = new MemoryStorage();
    memoryStorage.setItem('key', 'value');
    expect(memoryStorage.key(0)).toEqual('key');
  });

  it('should clear the storage', () => {
    const memoryStorage = new MemoryStorage();
    memoryStorage.setItem('key', 'value');
    expect(memoryStorage.getItem('key')).toEqual('value');
    memoryStorage.clear();
    expect(memoryStorage.getItem('key')).toEqual(null);
  });
});
