import { FumoClient } from '@leoua/fumo-api'
import { APIMessageComponentEmoji } from 'discord-api-types'

export enum Emojis {
    error = '`❌`',
}

// Emojis taken from notsobot

export const ReloadButton: APIMessageComponentEmoji = {
    name: 'reload',
    id: '848380144338993174',
}

export type FilterType = `only_${'videos' | 'images' | 'gifs'}` | 'none'
export type ComponentActionName = 'double_previous' | 'previous' | 'cancel' | 'next' | 'double_next'

export const PaginatorEmojis: Array<{
    name: ComponentActionName
    id: string
}> = [
        {
            name: 'double_previous',
            id: '848383585807106064',
        },
        { name: 'previous', id: '848383585962819585' },
        { name: 'cancel', id: '848383585873428520' },
        { name: 'next', id: '848383585374830623' },
        {
            name: 'double_next',
            id: '848383585701330944',
        },
    ]

export const ReplyIcon = '<:reply:889026059738169405>'

export interface ComponentButtonBuffer {
    author_id: string
    page?: number
    filter?: FilterType
    action?: ComponentActionName
}

export const videoExtensions = ['mp4', '3gp', 'ogg']
export const fumoClient = new FumoClient(true)
export const baseApiUrl = 'https://discord.com/api/v9'
export const invite =
    'https://discord.com/api/oauth2/authorize?client_id=916065710038450186&scope=applications.commands'
