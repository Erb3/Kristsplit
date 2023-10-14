<h1 align="center"> Kristsplit </h1>
<p align="center">Simple applicaiton to <strong>redirect your krist</strong>!</p>

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/Erb3/kristsplit/docker-image.yml?style=flat-square&logo=docker&label=Docker%20image">
  <img src="https://img.shields.io/github/actions/workflow/status/Erb3/kristsplit/ci.yml?style=flat-square&logo=jest&label=Tests">
</p>

## Configuring

To get started download the [config.example.json] file as `config.json`.
You will need to modify it to your own needs. Hopefully you can understand how the format works based on the contents.
There is a JSON schema which will help you with autocompletition if you use a supported IDE, like VSCode.

The JSON file is an object, which has the following properties:

- `splits`
- `node`

`node` refers to the krist syncnode to use. This property is optional, and is set to the krist.dev node by default.

`splits` is an array of different splits. Each item in this array is an object which features the following properties:

- `secret`
- `output`
- `walletFormat`

The `secret` field will contain the private key (or password) of your wallet.
Check out the section about ["Getting private key from KristWeb"](#getting-your-private-key-from-kristweb)!

`output` is either a string with the krist address which all krist should be sent to, or an object.
If you go the route of objects, you have to make a key-value pair where the key is an output address,
and the value is a number representing the percent to send to it.

`walletFormat` refers to the wallet format you want to use with your private key.
You most likly want KristWallet, but in some cases your private key might already be transformed, and you should use `api`.
This field is optional, and if you don't specify it, it will make an educated guess.

Anywhere in the config that you can put an address, you can also put a krist name with or without a metaname.

## FAQ

### Getting your private key from KristWeb

1. Go to "My Wallets"
2. Find the wallet you want to use
3. Find and press the "..." menu
4. Press "Wallet info"
5. Find where it says "Privatekey", click "Reveal".

### Can I use my Kristsplit v1 config with v2

No. You cannot use your Kristsplit v1 config with the new version.

### Krist?

Krist is a virtual currency used on some Minecraft servers, mainly [SwitchCraft](https://sc3.io).
More information about Krist is available at [krist.dev](https://krist.dev)

### Private key? Password?

Private key and password are two different things in the krist world!
A password, is what you give into a wallet hasher, and it outputs a private key!
If you have a private key (hashed password), you should set the format to `API`.

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

This application is tested-ish with Jest. After installing dependencies, you can run `pnpm run test` to run the tests.

## Linting

Kristsplit takes use of eslint to lint and format the code. Run `pnpm run lint` to lint the code.
If you wish to automatically fix some problems, use `pnpm run lint -- --fix`

## Todo

Currently implemented:

- Split krist sent to an address

Not done yet:

- Split krist sent to a specific (meta)name
- Real tests with alternative krist nodes

[config.example.json]: https://raw.githubusercontent.com/Erb3/Kristsplit/main/config.example.json "Example configuration file"
