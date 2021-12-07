# Fumo HTTP Bot
A discord http bot only made to show images of fumos.

## How to use
You can invite it with [**this link**](https://discord.com/api/oauth2/authorize?client_id=916065710038450186&scope=applications.commands)

The commands are simple, you don't need a guide


# Manual setup
First of all, run `npm install` to install all de node modules required, after that, compile all the TS files with `npm run build`

## Make the bot
Go to [discord.com/developers/applications](https://discord.com/developers/applications), create an application and the bot

### Required keys in .env file
```
DISCORD_BOT_TOKEN
DISCORD_CLIENT_ID
DISCORD_GUILD_ID *
DISCORD_PUBLIC_KEY
```
\* optional

## Deploy the slash commands
Run `npm run deploy`, if you don't have the `DISCORD_GUILD_ID` key in the .env file it can take a while

## Listening for interactions
You will need a `https` server (you can't run it in localhosts)

Run `npm run start`

Go to your application general information, and in `Interactions Endpoint URL` put the http server url.
More info [here](https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction)

If it worked, congrats! 👏
