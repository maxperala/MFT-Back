import { SERVICE_URL } from "./config"



export const buildUrl = (uri: string) => {
    if (!SERVICE_URL) {
        throw new Error("Please provide the SERVICE_URL variable")
    }
    return SERVICE_URL + uri;
}