import { FumoData } from '@leoua/fumo-api'
import {
    APIActionRowComponent,
    APIButtonComponentWithCustomId,
    APIEmbed,
    APIInteractionResponseCallbackData,
    ButtonStyle,
    ComponentType,
    MessageFlags,
} from 'discord-api-types'
import { Emojis, fumoClient, PaginatorEmojis, ReloadButton, videoExtensions } from '.'

export function embeddable(link: string) {
    try {
        const url = new URL(link)
        const extension = url.pathname.split('.').pop()

        if (!extension) return false

        return !videoExtensions.includes(extension)
    } catch {
        return false
    }
}

export function baseEmbed(id: string): APIEmbed {
    return {
        color: 0x2f3136,
        footer: { text: `ID: ${id}` },
    }
}

export function makeFumoResponseData(fumo?: FumoData): APIInteractionResponseCallbackData {
    if (!fumo)
        return {
            content: `${Emojis.error} Fumo not found.`,
            flags: MessageFlags.Ephemeral,
        }

    const data: APIInteractionResponseCallbackData = embeddable(fumo.URL)
        ? {
            embeds: [
                {
                    image: {
                        url: fumo.URL,
                    },
                    ...baseEmbed(fumo._id),
                },
            ],
        } : {
            content: fumo.URL,
            embeds: [baseEmbed(fumo._id)],
        }

    return data
}

/**
 * Buffer stuff, taken from
 * https://stackoverflow.com/questions/41951307/convert-a-json-object-to-buffer-and-buffer-to-json-object-back
 */

export function decodeBuffer(encoded: string) {
    const buffer = Buffer.from(encoded, 'base64').toString('ascii')

    return JSON.parse(buffer)
}

export function encodeBuffer(object: Record<any, unknown>) {
    const stringBuffer = Buffer.from(JSON.stringify(object)).toString('base64')

    return stringBuffer
}

export function buildPaginationComponents(page: number, author_id: string): APIActionRowComponent {
    const buttons: APIButtonComponentWithCustomId[] = PaginatorEmojis.map(({ name, id }) => ({
        custom_id: encodeBuffer({
            page,
            author_id,
            action: name,
        }),
        emoji: { id, name },
        type: ComponentType.Button,
        disabled:
            (['double_previous', 'previous'].includes(name) && page === 1) ||
            (['double_next', 'next'].includes(name) && page === fumoClient.cache.size),
        style: name === 'cancel' ? ButtonStyle.Danger : ButtonStyle.Primary,
    }))

    return {
        type: ComponentType.ActionRow,
        components: buttons,
    }
}

export function makePaginationResponseData(
    page: number,
    author_id: string
): APIInteractionResponseCallbackData {
    const row = buildPaginationComponents(page, author_id)
    const fumo = fumoClient.cache.list[page - 1]
    let content = `Page **${page}** of **${fumoClient.cache.size}**`

    if (!embeddable(fumo.URL)) content += `\n\n${fumo.URL}`

    return {
        content,
        embeds: [
            {
                color: 0x2f3136,
                description: [`**ID**: ${fumo._id}`, `**URL**: [click here](${fumo.URL})`].join('\n'),
                image: content.endsWith('**') ? { url: fumo.URL } : undefined,
            },
        ],
        components: [row],
    }
}

export function buildRandomFumoComponents(author_id: string): APIActionRowComponent {
    const button: APIButtonComponentWithCustomId = {
        custom_id: encodeBuffer({ author_id }),
        emoji: ReloadButton,
        style: ButtonStyle.Primary,
        type: ComponentType.Button,
    }

    return {
        type: ComponentType.ActionRow,
        components: [button],
    }
}

export function makeRandomFumoData(author_id: string): APIInteractionResponseCallbackData {
    const random = fumoClient.cache.random()
    const data = makeFumoResponseData(random)

    data.components = [buildRandomFumoComponents(author_id)]

    return data
}
