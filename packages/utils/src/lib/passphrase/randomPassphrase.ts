function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomCharacter(letterOnly = false) {
  let randomChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  if (letterOnly) {
    randomChars = randomChars.substring(0, 26);
  }
  return randomChars.charAt(Math.floor(Math.random() * randomChars.length));
}

export const generateRandomPassphrase = () => {
  let result = '';
  for (let i = 0; i < 11; i++) {
    result += getRandomCharacter();
  }
  const position = getRandomInt(0, 11);
  const extraCharacter = getRandomCharacter();

  return (
    result.substring(0, position) + extraCharacter + result.substring(position)
  );
};
