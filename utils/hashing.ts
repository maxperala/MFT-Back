import bcrypt from "bcrypt";

const salt = 10;

export const hash = async (code: string): Promise<string> => {
  return bcrypt.hash(code, salt);
};

export const compare = async (code: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(code, hash);
};
