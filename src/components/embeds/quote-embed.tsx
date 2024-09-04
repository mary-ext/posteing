import { type JSX } from 'solid-js';

import type {
	AppBskyEmbedImages,
	AppBskyEmbedRecord,
	AppBskyEmbedVideo,
	AppBskyFeedDefs,
	AppBskyFeedPost,
} from '@atcute/client/lexicons';
import { parseAtUri } from '~/api/utils/strings';

import Avatar, { getUserAvatarType } from '../avatar';
import TimeAgo from '../time-ago';
import ImageEmbed from './image-embed';
import VideoEmbed from './video-embed';

interface QuoteEmbedProps {
	/** Expected to be static */
	quote: AppBskyEmbedRecord.ViewRecord;
	/** Expected to be static */
	interactive?: boolean;
	/** Expected to be static. Whether it should show a large UI for image embeds */
	large?: boolean;
}

const QuoteEmbed = ({ quote, interactive, large }: QuoteEmbedProps) => {
	const record = quote.value as AppBskyFeedPost.Record;
	const embed = quote.embeds?.[0];
	const author = quote.author;

	const uri = parseAtUri(quote.uri);
	const href = `/${author.did}/${uri.rkey}`;

	const text = record.text.trim();
	const image = getPostImage(embed);
	const video = getPostVideo(embed);

	return (
		<a
			href={interactive ? href : undefined}
			class={
				`block overflow-hidden rounded-md border border-outline` +
				(interactive ? ` hover:bg-contrast/sm active:bg-contrast/sm-pressed` : ``)
			}
		>
			<div class="mx-3 mt-3 flex min-w-0 text-sm text-contrast-muted">
				<Avatar
					type={/* @once */ getUserAvatarType(author)}
					src={/* @once */ author.avatar}
					size="xs"
					class="mr-2"
				/>

				<span class="flex max-w-full gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
					<bdi class="overflow-hidden text-ellipsis">
						<span class="font-bold text-contrast">{/* @once */ author.displayName || author.handle}</span>
					</bdi>
					<span class="block overflow-hidden text-ellipsis whitespace-nowrap">
						@{/* @once */ author.handle}
					</span>
				</span>

				<span class="px-1">·</span>

				<span class="whitespace-nowrap">
					<TimeAgo value={/* @once */ quote.indexedAt}>
						{(relative, _absolute) => relative as unknown as JSX.Element}
					</TimeAgo>
				</span>
			</div>

			{text ? (
				<div class="flex items-start">
					{!large ? (
						image ? (
							<div class="mb-3 ml-3 mt-2 grow basis-0">
								<ImageEmbed embed={image} />
							</div>
						) : video ? (
							<div class="mb-3 ml-3 mt-2 grow basis-0">
								<VideoEmbed embed={video} />
							</div>
						) : null
					) : null}

					<div class="mx-3 mb-3 mt-2 line-clamp-6 min-w-0 grow-4 basis-0 whitespace-pre-wrap break-words text-sm empty:hidden">
						{text}
					</div>
				</div>
			) : (
				<div class="mt-3"></div>
			)}

			{large || !text ? (
				image ? (
					<ImageEmbed embed={image} borderless />
				) : video ? (
					<VideoEmbed embed={video} borderless />
				) : null
			) : null}
		</a>
	);
};

export default QuoteEmbed;

const getPostImage = (embed: AppBskyFeedDefs.PostView['embed']): AppBskyEmbedImages.View | undefined => {
	if (embed) {
		if (embed.$type === 'app.bsky.embed.images#view') {
			return embed;
		}

		if (embed.$type === 'app.bsky.embed.recordWithMedia#view') {
			return getPostImage(embed.media);
		}
	}
};

const getPostVideo = (embed: AppBskyFeedDefs.PostView['embed']): AppBskyEmbedVideo.View | undefined => {
	if (embed) {
		if (embed.$type === 'app.bsky.embed.video#view') {
			return embed;
		}

		if (embed.$type === 'app.bsky.embed.recordWithMedia#view') {
			return getPostVideo(embed.media);
		}
	}
};
