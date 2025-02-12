import bcrypt from "bcrypt";

const salt = 10;

/**
 * Hashes a string using bcrypt
 * @param {string} code - String to be hashed
 * @returns {Promise<string>} Hashed string
 */
export const hash = async (code: string): Promise<string> => {
  return bcrypt.hash(code, salt);
};

/**
 * Compares a plain text string with a bcrypt hash
 * @param {string} code - Plain text string to compare
 * @param {string} hash - Bcrypt hash to compare against
 * @returns {Promise<boolean>} True if match, false otherwise
 */
export const compare = async (code: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(code, hash);
};
