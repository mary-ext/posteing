import type { AppBskyEmbedImages, AppBskyFeedDefs, AppBskyFeedPost } from '@atcute/client/lexicons';

import Avatar, { getUserAvatarType } from '../avatar';
import ImageEmbed from '../embeds/image-embed';
import TimeAgo from '../time-ago';

interface ComposerReplyContextProps {
	/** Expected to be static */
	post: AppBskyFeedDefs.PostView;
	pending?: boolean;
}

const ComposerReplyContext = (props: ComposerReplyContextProps) => {
	const post = props.post;
	const author = post.author;
	const record = post.record as AppBskyFeedPost.Record;

	const displayName = author.displayName;
	const handle = author.handle;
	const image = getPostImage(post.embed);

	return (
		<div class="relative flex gap-3 px-4 pt-3">
			<div class="flex shrink-0 flex-col items-center">
				<Avatar
					type={/* @once */ getUserAvatarType(author)}
					src={/* @once */ author.avatar}
					class={props.pending ? `opacity-50` : ``}
				/>

				<div class="mt-1 grow border-l-2 border-outline-md" />
			</div>

			<div class={`min-w-0 grow pb-3` + (props.pending ? ` opacity-50` : ``)}>
				<div class="mb-0.5 flex items-center justify-between gap-4 text-contrast-muted">
					<div class="flex items-center overflow-hidden text-sm">
						<span class="flex max-w-full gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
							{displayName ? (
								<bdi class="overflow-hidden text-ellipsis font-bold text-contrast hover:underline">
									{displayName}
								</bdi>
							) : (
								<span class="block overflow-hidden text-ellipsis whitespace-nowrap">@{handle}</span>
							)}
						</span>

						<span class="px-1">·</span>

						<TimeAgo value={/* @once */ post.indexedAt}>
							{(relative, absolute) => (
								<span title={absolute()} class="whitespace-nowrap">
									{relative()}
								</span>
							)}
						</TimeAgo>
					</div>
				</div>

				<div class="flex items-start gap-4">
					<div class="line-clamp-6 min-w-0 grow-4 basis-0 whitespace-pre-wrap break-words text-sm">
						{/* @once */ record.text}
					</div>

					{image && (
						<div class="grow basis-0">
							<ImageEmbed embed={image} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ComposerReplyContext;

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
