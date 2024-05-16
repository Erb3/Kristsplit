<h1 align="center"> Kristsplit </h1>
<p align="center">Simple applicaiton to <strong>redirect your <a href="https://krist.dev">krist</a></strong>!</p>

<p align="center">
  <img alt="image of docker status" src="https://img.shields.io/github/actions/workflow/status/Erb3/kristsplit/docker-image.yml?style=flat-square&logo=docker&label=Docker%20image">
  <img alt="image of ci status" src="https://img.shields.io/github/actions/workflow/status/Erb3/kristsplit/ci.yml?style=flat-square&logo=jest&label=Tests">
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

`conditions` is a set of conditions on which the transaction will be split.
If a condition fails, the transaction will be ignored.
These are the following conditions you can use:

- `sender` filters for a specific sender. This can be an address
- `destination` filters for a the destination. This can be a name, with or without metaname
- `minAmount` filters for the minimum (inclusive) krist amount sent to split
- `maxAmount` filters for the maximum (inclusive) krist amount sent to split

Anywhere in the config that you can put an address, you can also put a krist name with or without a metaname.

## FAQ

### Getting your private key from KristWeb

1. Go to "My Wallets"
2. Find the wallet you want to use
3. Find and press the "..." menu
4. Press "Wallet info"
5. Find where it says "Privatekey", click "Reveal".

### Can I use my Kristsplit v1 config with v2 or v2?

No. You cannot use your Kristsplit v1 config with the new versions. v2 configs are compatible with v3.

### Krist?

Krist is a virtual currency used on some Minecraft servers, mainly [SwitchCraft](https://sc3.io).
More information about Krist is available at [krist]'s website.

### Private key? Password?

Private key and password are two different things in the krist world!
A password, is what you give into a wallet hasher, and it outputs a private key!
If you have a private key (hashed password), you should set the format to `API`.

### Division rest?

Let's say we have a 50/50 split is configured, but it receives k3 from someone.
It will then give k2 to the first address in the split configuration, and k1 to the other.

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

This application is tested-ish with the Bun test runner.
After installing dependencies, you can run `bun run test` to run the tests.

## Linting

Kristsplit uses [Biome](https://biomejs.dev) to lint and format the code.
Use `bun run lint` to lint the code, `bun run format` to format the code, or `bun run check` for both.
In linting you can automatically fix some problems by using `--apply` or `--apply-unsafe`.

## Todo

Currently implemented:

- Split krist sent to an address
- Split krist sent to a specific (meta)name

Not done yet:

- Real tests with alternative krist nodes
- Loop detection
- Config examples
- Config builder
- Condition actions
- Prometheus

[config.example.json]: https://raw.githubusercontent.com/Erb3/Kristsplit/main/config.example.json "Example configuration file"
[krist]: https://krist.dev "Krist website"
