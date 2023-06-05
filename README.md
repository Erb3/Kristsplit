# Kristsplit

![GitHub Docker Publish Status](https://img.shields.io/github/actions/workflow/status/Erb3/Kristsplit/docker-image.yml?label=docker+publish&style=plastic)
![GitHub CI Status](https://img.shields.io/github/actions/workflow/status/Erb3/kristsplit/ci.yml?label=ci&style=plastic)

A Typescript application to split incoming krist from one wallet to other(s).
Lets say a shop earns 10 KST, and Player A should get a 42% split, then this application will split the incoming 10 KST to player A and player B based on the configured percents.
Note: As of 04/06-2023 the license changed to MPL 2.0

## Configuring

To get started download the [`config.example.json`](https://raw.githubusercontent.com/Erb3/Kristsplit/main/config.example.json) file, as `config.json`.
Once you have that file, you will need to modify it to your needs. Hopefully you can understand how the format works based on what is already in the file,
and the JSON schema will help you with autocompletion if you use a IDE which features JSON schemas, like VSCode.

The JSON file is a object, which has the following properties:

- `splits`
- `node`

`node` refers to the krist sync node to use. This property is optional, and is set to the krist.dev node by default.

`splits` is an array of different splits. Each item in this array is an object which features the following properties:

- `input`
- `output`

The `input` field will contain the private key or password of your wallet. It should hopefully determine itself what format it is, but if you face issues with this please open a GitHub issue. For information on how to get your private key check out the section about "Getting privatekey from KristWeb" under the "FAQ" section.

`output` is either a string with the krist address which all input krist should be tunneled to, or an object. If you go the route of objects, you have to make a key-value pair where the key is an output address, and the value is a number representing the percent of input to send to it.

Anywhere in the config that you can put an address, you can also put a krist name with or without a metaname.

## FAQ

### Getting privatekey from KristWeb

Then you can go multiple paths for deploying.

We use the versioning scheme of `rewrite.major.minor`.

Krist is a virtual currency made by 3d6, now maintained by tmpim. More information about [Krist](https://krist.dev). It is most famous for being used on the SwitchCraft minecraft server.

### Can I use my Kristsplit v1 config with v2

No. You cannot use your Kristsplit v1 config with the new version.

### Krist

Krist is a virtual currency used on some Minecraft servers, mainly [SwitchCraft](https://sc3.io).

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
      source: "[Output of `pwd` in the directory of your config]/config.json"
      target: "/usr/src/app/config.json"
```

## Tests

This application is tested-ish with Jest. After installing dependencies, you can run `npm test` to run the tests.

## Todo

Currently implemented:

- Split krist sent to an address

Not done yet:

- Split krist sent to a specific name
- Split krist sent to a specific metaname
