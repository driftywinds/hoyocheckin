## An arm64 docker image for [Daily Check-in Bot](https://github.com/NickAwrist/Dailycheckin_Bot) made by drifty

The Hoyolab Dailycheckin Bot is a Discord bot that will automatically complete your daily checkin for Hoyoverse games like `Genshin Impact`, `Honkai Starrail`, and `Zenless Zone Zero`.

The official images do not exist and require building everytime, and I needed one for my Pi, so I cloned the repo and built the image myself. Useful for anyone with an arm64 processor who wants to run the bot. 

Also available on Docker Hub - [```driftywinds/hoyocheckin:latest```](https://hub.docker.com/repository/docker/driftywinds/hoyocheckin/general)

How to use: - 

1. Clone the original repo.
2. Copy the .env file from my repo into the cloned directory from Step 1, and populate it with your Discord bot entries.
3. Remove the lines corresponding to building the container and write the "image" part of the docker-compose.yml to ```ghcr.io/driftywinds/hoyocheckin:latest```.

<br>

You can check logs live with this command: - 
```
docker logs <container name> -f
```
