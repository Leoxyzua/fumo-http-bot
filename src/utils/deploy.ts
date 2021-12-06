import "dotenv/config"
import { APIApplicationCommand, ApplicationCommandOptionType } from "discord-api-types"
import fetch from "node-fetch"
const { DISCORD_CLIENT_ID, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID } = process.env

const data = [
    {
        name: 'get',
        description: 'Get a fumo by its id',
        type: 1,
        options: [{
            name: 'id',
            type: ApplicationCommandOptionType.String,
            description: 'The fumo id',
            required: true
        }]
    },
    {
        name: 'random',
        description: 'Get a random fumo',
        type: 1
    },
    {
        name: 'list',
        description: 'Get a list of all the fumos (in the Fumo Api)',
        type: 1
    },
    {
        name: 'invite',
        description: 'Invite me',
        type: 1
    }
] as Omit<APIApplicationCommand, 'id' | 'application_id' | 'version'>[]

async function deploy() {
    const url = `https://discord.com/api/v9/applications/${DISCORD_CLIENT_ID}/${DISCORD_GUILD_ID ? `guilds/${DISCORD_GUILD_ID}` : ''}/commands`

    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bot ${DISCORD_BOT_TOKEN}`
        },
        method: 'PUT',
        body: JSON.stringify(data)
    })

    return res
}

deploy().then(async (res) => {
    if (res.ok) console.log('deployed cmds')
    else {
        console.log('failed to deploy')
        const json = await res.json()
        console.dir(json, { depth: 7 })
    }
})