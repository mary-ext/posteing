import type { AppBskyFeedThreadgate } from '@atcute/client/lexicons';

import * as t from '~/lib/aglais-drafts/types';
import { assert } from '~/lib/utils/invariant';

import {
	EmbedKind,
	type ComposerState,
	type PostEmbed,
	type PostMediaEmbed,
	type PostRecordEmbed,
	type PostState,
} from '../state';
import type { DraftItem } from '~/lib/aglais-drafts';

const deserializeEmbed = (embed: t.SerializedEmbed): PostEmbed => {
	switch (embed.type) {
		case 'external':
			return {
				type: EmbedKind.EXTERNAL,
				uri: embed.uri,
				labels: embed.labels,
			};
		case 'gif':
			return {
				type: EmbedKind.GIF,
				gif: embed.gif as any,
				alt: embed.alt,
			};
		case 'image':
			return {
				type: EmbedKind.IMAGE,
				images: embed.images.map((image) => ({ blob: image.blob, alt: image.alt })),
				labels: embed.labels.slice(),
			};

		case 'feed':
			return {
				type: EmbedKind.FEED,
				uri: embed.uri,
			};
		case 'list':
			return {
				type: EmbedKind.LIST,
				uri: embed.uri,
			};
		case 'quote':
			return {
				type: EmbedKind.QUOTE,
				origin: embed.origin,
				uri: embed.uri,
			};

		case 'recordWithMedia':
			return {
				type: EmbedKind.RECORD_WITH_MEDIA,
				media: deserializeEmbed(embed.media) as PostMediaEmbed,
				record: deserializeEmbed(embed.record) as PostRecordEmbed,
			};

		default:
			assert(false);
	}
};

const deserializePost = (post: t.SerializedPost): PostState => {
	return {
		text: post.text,
		languages: post.languages,
		embed: post.embed ? deserializeEmbed(post.embed) : undefined,

		_parsed: null,
	};
};

export const deserializeComposer = (item: DraftItem): ComposerState => {
	const state = item.state;

	return {
		active: 0,
		draftId: item.id,
		reply: undefined,
		posts: state.posts.map(deserializePost),
		threadgate: state.threadgate?.map((allow): UnwrapArray<AppBskyFeedThreadgate.Record['allow']> => {
			switch (allow.type) {
				case 'following':
					return { $type: 'app.bsky.feed.threadgate#followingRule' };
				case 'list':
					return { $type: 'app.bsky.feed.threadgate#listRule', list: allow.list };
				case 'mention':
					return { $type: 'app.bsky.feed.threadgate#mentionRule' };

				default:
					assert(false);
			}
		}),
	};
};

type UnwrapArray<T> = T extends (infer V)[] ? V : never;
