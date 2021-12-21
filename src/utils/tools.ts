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

import {
    Emojis,
    FilterType,
    fumoClient,
    PaginatorEmojis,
    ReloadButton,
    ReplyIcon,
    videoExtensions
} from '.'

export function isVideo(link: string) {
    const url = new URL(link)
    const extension = url.pathname.split('.').pop()

    if (!extension) return false

    return videoExtensions.includes(extension)
}

export function isGif(link: string) {
    const url = new URL(link)
    const extension = url.pathname.split('.').pop()

    return extension === 'gif'
}

export function isImage(link: string) {
    return !isGif(link) && !isVideo(link)
}

export function getRandomFumoByFilter(filter: FilterType) {
    const filterFunction = filter === 'only_gifs'
        ? isGif
        : filter === 'only_videos'
            ? isVideo
            : filter === 'only_images'
                ? isImage
                : () => true

    return fumoClient.cache.random((fumo) => filterFunction(fumo.URL))
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

    const data: APIInteractionResponseCallbackData = isVideo(fumo.URL)
        ? {
            content: [`**ID:** ${fumo._id}`, fumo.URL].join('\n'),
        } : {
            embeds: [
                {
                    image: {
                        url: fumo.URL,
                    },
                    ...baseEmbed(fumo._id),
                },
            ],
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
            (['double_next', 'next'].includes(name) && page === Math.ceil(fumoClient.cache.list.length / 4)),
        style: name === 'cancel' ? ButtonStyle.Danger : ButtonStyle.Primary,
    }))

    return {
        type: ComponentType.ActionRow,
        components: buttons,
    }
}

export function makePaginationResponseData(
    page: number,
    author_id: string,
    fumosPerPage = 4
): APIInteractionResponseCallbackData {
    const { list } = fumoClient.cache
    const pages = (page - 1) * fumosPerPage
    const allPages = Math.ceil(list.length / fumosPerPage)
    const fumos = list.slice(pages, pages + fumosPerPage)

    const row = buildPaginationComponents(page, author_id)
    const ids = fumos.map(({ _id }) => _id)

    const embeds: APIEmbed[] = fumos.map((fumo, index) => {
        const description = listDescription(pages, ids)

        return {
            color: 0x2f3136,
            description,
            image: {
                url: fumo.URL
            },
            url: fumoClient.url,
        }
    })

    return {
        content: `Page **${page}** of **${allPages}**`,
        embeds,
        components: [row],
    }
}

export function buildRandomFumoComponents(author_id: string, filter: FilterType): APIActionRowComponent {
    const button: APIButtonComponentWithCustomId = {
        custom_id: encodeBuffer({
            author_id,
            filter
        }),
        emoji: ReloadButton,
        style: ButtonStyle.Primary,
        type: ComponentType.Button,
    }

    return {
        type: ComponentType.ActionRow,
        components: [button],
    }
}

export function makeRandomFumoData(author_id: string, filter: FilterType): APIInteractionResponseCallbackData {
    const random = getRandomFumoByFilter(filter)
    const data = makeFumoResponseData(random)

    data.components = [buildRandomFumoComponents(author_id, filter)]

    return data
}

export function listDescription(startIndex: number, ids: string[]) {
    let text = ''

    ids.map((_, i) => {
        const isOdd = !!(i % 2)
        i++
        const plusr = startIndex > 60 && startIndex < 100
            ? -2
            : startIndex > 100
                ? -3 : 0

        const format = `**#${startIndex + i}**` + ' '.repeat([2, 4].includes(i) ? 0 : 26 + plusr)
        text += format
        if (isOdd) {
            text += '\n'
            const [left, right] = [i - 2, i - 1]
            text += [
                ReplyIcon,
                ids[left],
                ' ',
                ReplyIcon,
                ids[right] + '\n'
            ].join(' ')
        }

        if (i === 2) text += '\n'
    })

    return text
}

export function codeblock(text: string) {
    const key = '`'
    return [
        key.repeat(3),
        text,
        key.repeat(3)
    ].join('\n')
}