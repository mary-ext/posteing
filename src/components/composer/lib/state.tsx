import { unwrap } from 'solid-js/store';

import type { AppBskyFeedDefs, AppBskyFeedThreadgate } from '@atcute/client/lexicons';

import { type PreliminaryRichText, parseRt } from '~/api/richtext/parser/parse';

import { primarySystemLanguage } from '~/globals/locales';

import type { ComposerPreferences } from '~/lib/preferences/account';
import { assert } from '~/lib/utils/invariant';

import type { GifMedia } from '../gifs/gif-search-dialog';

const MAXIMUM_IMAGE_COUNT = 4;

// Embeds
export const enum EmbedKind {
	EXTERNAL = 1 << 0,
	GIF = 1 << 1,
	IMAGE = 1 << 2,

	FEED = 1 << 3,
	LIST = 1 << 4,
	QUOTE = 1 << 5,

	RECORD_WITH_MEDIA = 1 << 6,

	MEDIA = EXTERNAL | GIF | IMAGE,
	RECORD = FEED | LIST | QUOTE,
	ALL = MEDIA | RECORD,
	NONE = 0,
}

interface PostImage {
	blob: Blob;
	alt: string;
}

export interface PostExternalEmbed {
	type: EmbedKind.EXTERNAL;
	uri: string;
	labels: string[];
}

export interface PostGifEmbed {
	type: EmbedKind.GIF;
	gif: GifMedia;
	/** User-provided alt, undefined if not provided. */
	alt?: string;
}

export interface PostImageEmbed {
	type: EmbedKind.IMAGE;
	images: PostImage[];
	labels: string[];
}

export type PostMediaEmbed = PostExternalEmbed | PostGifEmbed | PostImageEmbed;

export interface PostFeedEmbed {
	type: EmbedKind.FEED;
	uri: string;
}

export interface PostListEmbed {
	type: EmbedKind.LIST;
	uri: string;
}

export interface PostQuoteEmbed {
	type: EmbedKind.QUOTE;
	uri: string;
	origin: boolean;
}

export type PostRecordEmbed = PostFeedEmbed | PostListEmbed | PostQuoteEmbed;

export interface PostRecordWithMediaEmbed {
	type: EmbedKind.RECORD_WITH_MEDIA;
	record: PostRecordEmbed;
	media: PostMediaEmbed;
}

export type PostEmbed = PostMediaEmbed | PostRecordEmbed | PostRecordWithMediaEmbed;

/** Returns a bitflag of what can be embedded */
export function getAvailableEmbed(embed: PostEmbed | undefined): number {
	if (embed !== undefined) {
		switch (embed.type) {
			case EmbedKind.EXTERNAL: {
				return EmbedKind.NONE;
			}
			case EmbedKind.GIF: {
				return EmbedKind.RECORD;
			}
			case EmbedKind.IMAGE: {
				return EmbedKind.RECORD | (embed.images.length < MAXIMUM_IMAGE_COUNT ? EmbedKind.IMAGE : 0);
			}
			case EmbedKind.FEED:
			case EmbedKind.LIST:
			case EmbedKind.QUOTE: {
				return EmbedKind.GIF | EmbedKind.IMAGE;
			}
			case EmbedKind.RECORD_WITH_MEDIA: {
				const media = embed.media;

				if (media.type === EmbedKind.IMAGE && media.images.length < MAXIMUM_IMAGE_COUNT) {
					return EmbedKind.IMAGE;
				}

				return EmbedKind.NONE;
			}
			default: {
				return EmbedKind.NONE;
			}
		}
	}

	return EmbedKind.ALL;
}

/** Retrieve media embeds of specified type, if one is present */
function getMediaEmbed(embed: PostEmbed | undefined, type: EmbedKind.EXTERNAL): PostExternalEmbed | undefined;
function getMediaEmbed(embed: PostEmbed | undefined, type: EmbedKind.IMAGE): PostImageEmbed | undefined;
function getMediaEmbed(embed: PostEmbed | undefined, type: EmbedKind.GIF): PostGifEmbed | undefined;
function getMediaEmbed(embed: PostEmbed | undefined, type: number): PostMediaEmbed | undefined;
function getMediaEmbed(embed: PostEmbed | undefined, type: number): PostMediaEmbed | undefined {
	assert((type & EmbedKind.MEDIA) !== 0);

	if (embed) {
		if (embed.type & type) {
			return embed as PostMediaEmbed;
		}

		if (embed.type === EmbedKind.RECORD_WITH_MEDIA && embed.media.type & type) {
			return embed.media;
		}
	}
}

/** Retrieves labels from external and image embeds, if one is present */
export function getEmbedLabels(embed: PostEmbed | undefined): string[] | undefined {
	const thing = getMediaEmbed(embed, EmbedKind.EXTERNAL | EmbedKind.IMAGE) as
		| PostExternalEmbed
		| PostImageEmbed;

	if (thing) {
		return thing.labels;
	}
}

// Post state
export interface PostState {
	text: string;
	languages: string[];
	embed: PostEmbed | undefined;

	_parsed: ParsedPost | null;
}

export const getPostRt = (post: PostState) => {
	const unwrapped = unwrap(post);

	const text = post.text;
	const existing = unwrapped._parsed;

	if (existing === null || existing.t !== text) {
		return (unwrapped._parsed = { t: text, r: parseRt(text, false) }).r;
	}

	return existing.r;
};

export const getPostEmbedFlags = (embed: PostEmbed | undefined) => {
	if (embed !== undefined) {
		if (embed.type === EmbedKind.RECORD_WITH_MEDIA) {
			return embed.media.type | embed.record.type;
		}

		return embed.type;
	}

	return 0;
};

interface ParsedPost {
	t: string;
	r: PreliminaryRichText;
}

interface CreatePostStateOptions {
	text?: string;
	embed?: PostEmbed;
	languages?: string[];
}

export function createPostState({
	text = '',
	embed,
	languages = [],
}: CreatePostStateOptions = {}): PostState {
	return {
		text: text,
		embed: embed,
		languages: languages,

		_parsed: null,
	};
}

// Composer state
export interface CreateComposerStateOptions {
	override?: ComposerState;
	reply?: AppBskyFeedDefs.PostView;
	text?: string;
	quote?: AppBskyFeedDefs.PostView;
	languages?: string[];
}

export interface ComposerState {
	active: number;
	draftId: string | undefined;
	reply: AppBskyFeedDefs.PostView | undefined;
	posts: PostState[];
	threadgate: AppBskyFeedThreadgate.Record['allow'];
}

export function createComposerState(
	{ override, reply, text, quote }: CreateComposerStateOptions = {},
	{ defaultPostLanguage, defaultReplyGate }: ComposerPreferences,
): ComposerState {
	if (override) {
		return override;
	}

	return {
		active: 0,
		draftId: undefined,
		reply: reply,
		posts: [
			createPostState({
				text,
				embed: quote
					? {
							type: EmbedKind.QUOTE,
							uri: quote.uri,
							origin: true,
						}
					: undefined,
				languages: resolveDefaultLanguage(defaultPostLanguage),
			}),
		],
		threadgate: resolveDefaultThreadgate(defaultReplyGate),
	};
}

const resolveDefaultLanguage = (lang: 'none' | 'system' | (string & {})) => {
	if (lang === 'none') {
		return [];
	}

	if (lang === 'system') {
		return [primarySystemLanguage];
	}

	return [lang];
};

const resolveDefaultThreadgate = (
	value: ComposerPreferences['defaultReplyGate'],
): AppBskyFeedThreadgate.Record['allow'] => {
	if (value === 'follows') {
		return [{ $type: 'app.bsky.feed.threadgate#followingRule' }];
	}

	if (value === 'mentions') {
		return [{ $type: 'app.bsky.feed.threadgate#mentionRule' }];
	}

	return undefined;
};

export const enum ThreadgateKnownValue {
	EVERYONE,
	NONE,
	FOLLOWS,
	MENTIONS,
	CUSTOM,
}

export const getThreadgateValue = (allow: AppBskyFeedThreadgate.Record['allow']) => {
	if (!allow) {
		return ThreadgateKnownValue.EVERYONE;
	}

	if (allow.length === 0) {
		return ThreadgateKnownValue.NONE;
	}

	if (allow.length === 1) {
		const rule = allow[0];

		if (rule.$type === 'app.bsky.feed.threadgate#followingRule') {
			return ThreadgateKnownValue.FOLLOWS;
		}
		if (rule.$type === 'app.bsky.feed.threadgate#mentionRule') {
			return ThreadgateKnownValue.MENTIONS;
		}
	}

	return ThreadgateKnownValue.CUSTOM;
};
