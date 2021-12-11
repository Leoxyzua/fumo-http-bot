import {
    APIInteractionResponse,
    APIChatInputApplicationCommandInteraction,
    ApplicationCommandOptionType,
    ApplicationCommandInteractionDataOptionString,
    InteractionResponseType,
    MessageFlags,
} from 'discord-api-types'
import {
    interactionsLogger,
    makeFumoResponseData,
    fumoClient,
    invite,
    makePaginationResponseData,
    buildRandomFumoComponents,
} from '../utils'
import { Request, Response } from 'express'

export async function handleCommands(
    req: Request<never, never, APIChatInputApplicationCommandInteraction>,
    res: Response<APIInteractionResponse>
) {
    const { data, member, guild_id } = req.body

    interactionsLogger.info(
        `user: ${member?.user?.username}#${member?.user?.discriminator} [${member?.user?.id}], command ${data.name}, guild id: ${guild_id}`
    )

    switch (data.name) {
        case 'get': {
            const { value } = data.options?.find(
                (option) => option.type === ApplicationCommandOptionType.String
            ) as ApplicationCommandInteractionDataOptionString

            const fumo = fumoClient.cache.get(value) || fumoClient.cache.list[parseInt(value) - 1]

            return res.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: makeFumoResponseData(fumo),
            })
        }

        case 'random': {
            const fumo = fumoClient.cache.random()
            const randomFumoData = makeFumoResponseData(fumo)

            randomFumoData.components = [buildRandomFumoComponents(member?.user?.id!)]

            return res.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: randomFumoData,
            })
        }

        case 'list': {
            const responseData = makePaginationResponseData(1, member?.user?.id!)

            return res.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: responseData,
            })
        }

        case 'invite': {
            return res.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `Invite me: [click here](${invite})`,
                    flags: MessageFlags.Ephemeral,
                },
            })
        }
    }
}
