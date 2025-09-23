import bcrypt from 'bcryptjs';

export const hash = (str: string) => bcrypt.hash(str, 10);
export const compare = (str: string, hashed: string) => bcrypt.compare(str, hashed);
