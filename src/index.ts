import "dotenv/config"
import {
    APIInteractionResponse,
    APIInteraction,
    InteractionType,
    APIChatInputApplicationCommandInteraction,
    APIMessageComponentInteraction
} from "discord-api-types/v9"
import express, { Request } from "express"
import { verifyKey } from "discord-interactions"
import { logger, interactionsLogger } from "./utils"
import bodyParser from "body-parser"
import { handleCommands, handleComponents } from "./interactions"

const app = express()
    .use(bodyParser.json())
    .get('*', (req, res) => res.send('this fumo is r'))
    .post("/", (req: Request<never, APIInteractionResponse, APIInteraction>, res) => {
        const signature = req.headers["x-signature-ed25519"] as string
        const timestamp = req.headers["x-signature-timestamp"] as string

        if (!verifyKey(
            JSON.stringify(req.body),
            signature,
            timestamp,
            process.env.PUBLIC_KEY!
        )) return res.status(401).end()

        switch (req.body.type) {
            case InteractionType.Ping:
                interactionsLogger.info('got a pong interaction')
                return res.json({ type: 1 })

            case InteractionType.ApplicationCommand:
                return handleCommands(
                    req as Request<never, never, APIChatInputApplicationCommandInteraction>,
                    res
                )

            case InteractionType.MessageComponent:
                return handleComponents(
                    req as Request<never, never, APIMessageComponentInteraction>,
                    res
                )
        }
    })

app.listen(3000, () => logger.info('ready'))