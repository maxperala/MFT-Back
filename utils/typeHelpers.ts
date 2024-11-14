import { Degree, ImageURL } from "../types"
import { InvalidDegreesError, InvalidUrlError } from "./errors/ApiErrors";



export const createDegree = (num: number): Degree => {
    if (typeof num === "number" && !isNaN(num) && num >= 0 && num <= 360) {
        return Math.round(num) as Degree;
    }
    throw new InvalidDegreesError();
};

export const createURL = (url: string): ImageURL => {
    try {
        new URL(url);
        return url as ImageURL;
    } catch (e){
        if (e instanceof Error) {
            throw new InvalidUrlError(e.message);
        }
        throw new InvalidUrlError("Error parsing provided URL");
    }
}