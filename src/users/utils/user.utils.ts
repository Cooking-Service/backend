export const generateUsername = (
  companyCode: string,
  name: string,
  lastName: string,
): string => {
  const pattern = /[^aeiou\W\d]/g;
  const characters = lastName.match(pattern);
  const random = Math.floor(Math.random() * (9 - 0)) + 0;
  let x = '';

  if (characters.length < 3) {
    characters.map((char) => {
      x += char;
    });

    x += lastName.charAt(lastName.length - 1);

    return `${name.charAt(0)}${x}${random}@${companyCode}`;
  }

  const [a, b, c] = characters;
  return `${name.charAt(0)}${a}${b}${c}${random}@${companyCode}`.toLowerCase();
};
