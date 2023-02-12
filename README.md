# Kristsplit

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Erb3/Kristsplit/docker-image.yml)

A simple NodeJS app to split krist from one wallet to other(s).
To get started download the config.example.json file. Modify it to your needs.
Then you can go multiple paths for deploying.

Krist is a virtual currency made by 3d6, now maintained by tmpim. More information about [Krist](https://krist.dev). It is most famous for being used on the SwitchCraft minecraft server.

## Todo

Currently implemented:

- Split krist sent to one address

Not done yet:

- Split krist sent to a specific name
- Split krist sent to a specific metaname

## Deploying

### Docker run

Run the following in the same directory as the config.

```shell
docker run -d -it --mount type=bind,source="$(pwd)/config.json",target="/usr/src/app/config.json" ghcr.io/erb3/kristsplit:latest
```

### Docker compose

To run with docker compose, add this to your composefile:

```yml
kristsplit:
  image: ghcr.io/erb3/kristsplit:latest
  container_name: kristsplit
  restart: unless-stopped
  volumes:
    - type: bind
      source: '[Output of `pwd` in the directory of your config]/config.json'
      target: '/usr/src/app/config.json'
```
