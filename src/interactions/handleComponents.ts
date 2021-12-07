import {
    APIMessageComponentInteraction,
    APIInteractionResponse,
    InteractionResponseType,
    MessageFlags
} from "discord-api-types"
import { Request, Response } from "express"
import {
    CustomIdBufferObject,
    decodeBuffer,
    Emojis,
    fumoClient,
    makePaginationResponseData
} from "../utils"

export function handleComponents(
    req: Request<never, never, APIMessageComponentInteraction>,
    res: Response<APIInteractionResponse>
) {
    const { data, member } = req.body
    let { author_id, action, page } = decodeBuffer(data.custom_id) as CustomIdBufferObject

    if (author_id !== member?.user?.id) return res.json({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            content: `no lmao`,
            flags: MessageFlags.Ephemeral
        }
    })

    switch (action) {
        case 'double_previous':
            page = Math.min(0, page - 10)
            break

        case 'previous':
            --page
            break

        case 'next':
            ++page
            break

        case 'double_next':
            page = Math.min(fumoClient.cache.size, page + 10)
            break
    }

    const paginationData = makePaginationResponseData(page, author_id)

    if (action === 'cancel') {
        paginationData.content = `${Emojis.error} Paginator cancelled.`
        paginationData.components = []
    }

    return res.json({
        type: InteractionResponseType.UpdateMessage,
        data: paginationData
    })
}