import { APIEmbed } from "discord-api-types"

export enum Emojis {
    error = "`❌`"
}
export const videoExtensions = ["mp4", "3gp", "ogg"]
export function baseEmbed(id: string): APIEmbed {
    return {
        color: 0x2F3136,
        footer: { text: `ID: ${id}` }
    }
}

export const invite = "https://discord.com/api/oauth2/authorize?client_id=916065710038450186&scope=applications.commands"