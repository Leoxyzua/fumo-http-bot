import {
	APIMessageComponentInteraction,
	APIInteractionResponse,
	InteractionResponseType,
	MessageFlags,
} from 'discord-api-types'
import { Request, Response } from 'express'
import {
	ComponentButtonBuffer,
	decodeBuffer,
	Emojis,
	fumoClient,
	makePaginationResponseData,
	makeRandomFumoData,
} from '../utils'

export function handleComponents(
	req: Request<never, never, APIMessageComponentInteraction>,
	res: Response<APIInteractionResponse>
) {
	const {
		data: { custom_id },
		member,
	} = req.body
	// eslint-disable-next-line prefer-const
	let { author_id, action, page } = decodeBuffer(custom_id) as ComponentButtonBuffer

	if (author_id !== member?.user?.id)
		return res.json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: `no lmao`,
				flags: MessageFlags.Ephemeral,
			},
		})

	if (page && action) {
		switch (action) {
			case 'double_previous':
				page = Math.max(1, page - 10)
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

			for (const button of paginationData.components?.[0].components!) {
				button.disabled = true
			}
		}

		return res.json({
			type: InteractionResponseType.UpdateMessage,
			data: paginationData,
		})
	} else {
		const randomFumoData = makeRandomFumoData(author_id)

		return res.json({
			type: InteractionResponseType.UpdateMessage,
			data: randomFumoData,
		})
	}
}
