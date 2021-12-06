import { FumoData } from "fumo-api"
import { APIEmbed, APIInteractionResponseCallbackData, MessageFlags } from "discord-api-types"
import { Emojis, videoExtensions } from "."

export function embeddable(link: string) {
    try {
        const url = new URL(link)
        return !videoExtensions.includes(url.pathname.split('.').pop()!)
    } catch {
        return false
    }
}

export function baseEmbed(id: string): APIEmbed {
    return {
        color: 0x2F3136,
        footer: { text: `ID: ${id}` }
    }
}

export function makeResponseData(fumo?: FumoData): APIInteractionResponseCallbackData {
    if (!fumo) return {
        content: `${Emojis.error} Fumo not found.`,
        flags: MessageFlags.Ephemeral
    }

    const data: APIInteractionResponseCallbackData = embeddable(fumo.URL)
        ? {
            embeds: [{
                image: {
                    url: fumo.URL
                },
                ...baseEmbed(fumo._id)
            }]
        } : { content: fumo.URL, embeds: [baseEmbed(fumo._id)] }

    return data
}