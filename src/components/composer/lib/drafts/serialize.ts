import { unwrap } from 'solid-js/store';

import type * as t from '~/lib/aglais-drafts/types';
import { assert } from '~/lib/utils/invariant';

import { type ComposerState, EmbedKind, type PostEmbed, type PostState } from '../state';

const serializeEmbed = (embed: PostEmbed): t.SerializedEmbed => {
	switch (embed.type) {
		case EmbedKind.EXTERNAL:
			return {
				type: 'external',
				uri: embed.uri,
				labels: embed.labels.slice(),
			};
		case EmbedKind.GIF:
			return {
				type: 'gif',
				gif: structuredClone(unwrap(embed.gif)),
				alt: embed.alt,
			};
		case EmbedKind.IMAGE:
			return {
				type: 'image',
				images: embed.images.map((image) => ({ blob: image.blob, alt: image.alt })),
				labels: embed.labels.slice(),
			};

		case EmbedKind.FEED:
			return {
				type: 'feed',
				uri: embed.uri,
			};
		case EmbedKind.LIST:
			return {
				type: 'list',
				uri: embed.uri,
			};
		case EmbedKind.QUOTE:
			return {
				type: 'quote',
				origin: embed.origin,
				uri: embed.uri,
			};

		case EmbedKind.RECORD_WITH_MEDIA:
			return {
				type: 'recordWithMedia',
				media: serializeEmbed(embed.media) as t.SerializedMediaEmbed,
				record: serializeEmbed(embed.record) as t.SerializedRecordEmbed,
			};

		default:
			assert(false);
	}
};

const serializePost = (post: PostState): t.SerializedPost => {
	return {
		text: post.text,
		languages: post.languages.slice(),
		embed: post.embed ? serializeEmbed(post.embed) : undefined,
	};
};

export const serializeComposer = (state: ComposerState): t.SerializedComposer => {
	return {
		$version: 1,
		replyUri: state.reply ? state.reply.uri : undefined,
		posts: state.posts.map(serializePost),
		threadgate: state.threadgate?.map((allow): t.SerializedThreadgateAllow => {
			switch (allow.$type) {
				case 'app.bsky.feed.threadgate#followingRule':
					return { type: 'following' };
				case 'app.bsky.feed.threadgate#listRule':
					return { type: 'list', list: allow.list };
				case 'app.bsky.feed.threadgate#mentionRule':
					return { type: 'mention' };

				default:
					assert(false);
			}
		}),
	};
};
