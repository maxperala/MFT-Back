export interface NewPostcard {
    title: string;
    description: string;
    location: Point;
    author: string;
    degree: Degree;
    url: ImageURL;
};

export interface Postcard extends NewPostcard {
    id: string;
};

export type Point = {
    lat: number;
    lon: number;
};

export type ImageURL = string & {readonly brand: unique symbol};

export type Degree = number & {readonly brand: unique symbol};