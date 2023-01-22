# Kristsplit

A simple NodeJS app to split krist from one wallet to others
To run with docker: `docker run -d -it --mount type=bind,source="$(pwd)/config.json",target="/usr/src/app/config.json" [IMAGE]`
To run with docker compose:

```yml
kristsplit:
    image: ghcr.io/erb3/kristsplit:latest
    container_name: kristsplit
    restart: unless-stopped
    volumes:
      - type: bind
        source: "/home/pi/docker/kristsplit/config.json"
        target: "/usr/src/app/config.json"
```
