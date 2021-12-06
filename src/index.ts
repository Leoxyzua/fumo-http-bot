import "dotenv/config"
import {
    APIInteractionResponse,
    APIInteraction,
    InteractionType,
    APIChatInputApplicationCommandInteraction,
    ApplicationCommandOptionType,
    ApplicationCommandInteractionDataOptionString,
    InteractionResponseType,
    MessageFlags,
    APIInteractionResponseCallbackData
} from "discord-api-types/v9"
import express, { Request } from "express"
import { verifyKey } from "discord-interactions"
import { FumoClient } from "fumo-api"
import { Emojis, invite, logger, interactionsLogger, makeResponseData } from "./utils"
import bodyParser from "body-parser"
import { embeddable } from "./utils/tools"

const client = new FumoClient(true)
const app = express()
    .use(bodyParser.json())
    .get('/', (req, res) => res.send('this fumo is r'))
    .post("/fumos", (req: Request<never, APIInteractionResponse, APIInteraction>, res) => {
        const signature = req.headers["x-signature-ed25519"] as string
        const timestamp = req.headers["x-signature-timestamp"] as string

        if (!verifyKey(
            JSON.stringify(req.body),
            signature,
            timestamp,
            process.env.PUBLIC_KEY!
        )) return res.status(401).end()

        if (req.body.type === InteractionType.Ping) {
            interactionsLogger.info('got a pong interaction')
            return res.json({ type: 1 })
        }

        else if (req.body.type === InteractionType.ApplicationCommand) {
            const { data, member, user, guild_id } = req.body as APIChatInputApplicationCommandInteraction
            const author = guild_id ? member?.user : user

            interactionsLogger.info(`user: ${author?.username}#${author?.discriminator} [${author?.id}], command ${data.name}, guild id: ${guild_id}`)

            switch (data.name) {
                case 'get': {
                    const id = data.options
                        ?.find((option) => option.type === ApplicationCommandOptionType.String) as ApplicationCommandInteractionDataOptionString

                    const fumo = client.cache.get(id.value)

                    return res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: makeResponseData(fumo)
                    })
                }

                case 'random': {
                    const fumo = client.cache.random

                    return res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: makeResponseData(fumo)
                    })
                }

                case 'list': {
                    const fumos = client.cache.list
                    return res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: `There are a total of **${fumos.length}** fumos, find them with \`/random\`!`,
                            flags: MessageFlags.Ephemeral
                        }
                    })
                }

                case 'invite': {
                    return res.json({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: `Invite me: [click here](${invite})`,
                            flags: MessageFlags.Ephemeral
                        }
                    })
                }
            }
        }
    })

app.listen(3000, () => logger.info('ready'))