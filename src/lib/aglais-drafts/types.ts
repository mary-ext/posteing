// Our runtime state isn't stable, in particular, embed types are represented
// with bitflags. We don't want to cram those into IndexedDB.

// The validations aren't going to be used as long as the versioning stays the
// same, they're here just in case.

import * as v from '@badrap/valita';

import { ATURI_RE } from '~/api/utils/strings';

const blob = v.unknown().assert((val) => val instanceof Blob, `expected blob`);
const labels = v.array(v.string());

const atUri = v.string().assert((str) => ATURI_RE.test(str), `expected at-uri`);

const bskyFeedUri = atUri.assert(
	(v) => v.includes('/app.bsky.feed.generator/'),
	`expected app.bsky.feed.generator at-uri`,
);
const bskyListUri = atUri.assert(
	(v) => v.includes('/app.bsky.graph.list/'),
	`expected app.bsky.graph.list at-uri`,
);
const bskyPostUri = atUri.assert(
	(v) => v.includes('/app.bsky.feed.post/'),
	`expected app.bsky.feed.post at-uri`,
);

const image = v.object({
	blob: blob,
	alt: v.string(),
});

const externalEmbed = v.object({
	type: v.literal('external'),
	uri: v.string(),
	labels: labels,
});

const gifEmbed = v.object({
	type: v.literal('gif'),
	gif: v.unknown(),
	alt: v.string().optional(),
});

const imageEmbed = v.object({
	type: v.literal('image'),
	images: v.array(image).assert((val) => val.length >= 1, `expected one or more images`),
	labels: labels,
});

export type SerializedImageEmbed = v.Infer<typeof imageEmbed>;

const mediaEmbed = v.union(externalEmbed, gifEmbed, imageEmbed);

export type SerializedMediaEmbed = v.Infer<typeof mediaEmbed>;

const feedEmbed = v.object({
	type: v.literal('feed'),
	uri: bskyFeedUri,
});

const listEmbed = v.object({
	type: v.literal('list'),
	uri: bskyListUri,
});

const quoteEmbed = v.object({
	type: v.literal('quote'),
	uri: bskyPostUri,
	origin: v.boolean(),
});

const recordEmbed = v.union(feedEmbed, listEmbed, quoteEmbed);

export type SerializedRecordEmbed = v.Infer<typeof recordEmbed>;

const recordWithMediaEmbed = v.object({
	type: v.literal('recordWithMedia'),
	record: recordEmbed,
	media: mediaEmbed,
});

const embed = v.union(recordWithMediaEmbed, mediaEmbed, recordEmbed);

export type SerializedEmbed = v.Infer<typeof embed>;

const post = v.object({
	text: v.string(),
	languages: v.array(v.string()),
	embed: embed.optional(),
});

export type SerializedPost = v.Infer<typeof post>;

const threadgateAllowFollowing = v.object({
	type: v.literal('following'),
});

const threadgateAllowMention = v.object({
	type: v.literal('mention'),
});

const threadgateAllowList = v.object({
	type: v.literal('list'),
	list: bskyListUri,
});

const threadgateAllow = v.union(threadgateAllowFollowing, threadgateAllowList, threadgateAllowMention);

export type SerializedThreadgateAllow = v.Infer<typeof threadgateAllow>;

const composer = v.object({
	$version: v.literal(1),
	replyUri: bskyPostUri.optional(),
	posts: v.array(post).assert((val) => val.length >= 1, `expected 1 or more posts`),
	threadgate: v
		.array(threadgateAllow)
		.assert((val) => val.length <= 5, `expected 5 or less threadgate rules`)
		.optional(),
});

export type SerializedComposer = v.Infer<typeof composer>;
