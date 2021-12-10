This repo is a clone Wild Code School Express quests

# Setup

## Install dependencies
```sh
npm i
```
## Create your environment variables

Create a copy of the `.env.sample` file named `.env` : 

```
cp .env.sample .env
```

Then adjust variables in `.env` to match your own environment.

# Run the app

When developping, to automatically restart the server on file changes : 

```sh
npm run dev
```

If you don't need automatic reloadings, you can just : 

```sh
npm start
```

### Notes
MVC folder has unfinished process without authentication.
### PS: verify is safer than decode, because it returns the payload only when the secret/private_key is provided
#### PPS:
test files, are side-work learning JWT with bcrypt
