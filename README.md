# Memories From Tampere - Backend

>If you just want to test the app, refer to the instructions in the [main repo](https://github.com/maxperala/MFT-Public), there you can find prebuilt binaries as well as links to the App Store

This repository contains the backend code for the Memories From Tampere project. The backend is running at ```service.tampere.app```.

## Installing

Before you continue, building the app requires a Mapbox public key. You can get this for free from [mapbox.com](mapbox.com).

### Setting up project

1. Clone the repo
2. Run ```npm install```
3. You are set!

### Running with Docker

Make sure you have Docker and Docker compose installed.

1. Update the ```compose.yaml```file to include your ```MAPBOX_PUBLIC_KEY```under environment
2. Run ```docker compose up```
3. The service is now running at localhost, port 3001, including a disposable database

### Running with node

You can run the service on localhost normally by running ```npm run dev``` or
```npm run tsc``` && `npm run start` but you need to set up a `.env`file before. Here are the needed keys:

- `PORT` 
- `DB_KEY` A MongoDB database url
- `SECRET` Some random string used for encryption
- `SERVICE_URL` The url the service is running on, if running the frontend on a physical device this should be an IP address or URL, not localhost.
- `MAPBOX_PUBLIC_KEY` Public key obtained from [mapbox.com](mapbox.com)

### Notes

All images in the public library are either created by me (packs, stamps) or sourced from [Vapriikki Siiri](https://www.vapriikki.fi/) (photographs). The images from Vapriikki archive are all licensed under [Creative Commons 4.0](https://creativecommons.org/licenses/by/4.0/).