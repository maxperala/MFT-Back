// Set MODE variable to ENV in package.json if you wish to use a dotenv file :)
if (process.env.MODE === "dev") {
    const dotenv = require("dotenv");
    dotenv.config();
}

const PORT: number = Number(process.env.PORT);
if (isNaN(PORT)) throw new Error("Please provide a valid PORT variable!");
let DB_KEY: string;
if (process.env.DB_KEY) {
    DB_KEY = process.env.DB_KEY;
} else {
    throw new Error("Please provide a DB Key!");
};

export {PORT, DB_KEY};

