import { videoExtensions } from "."

export function embeddable(link: string) {
    try {
        const url = new URL(link)
        return !videoExtensions.includes(url.pathname.split('.').pop()!)
    } catch {
        return false
    }
}