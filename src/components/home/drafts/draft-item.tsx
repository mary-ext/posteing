import { openModal } from '~/globals/modals';

import type { DraftEntry } from '~/lib/aglais-drafts';
import type { SerializedEmbed, SerializedImageEmbed, SerializedPost } from '~/lib/aglais-drafts/types';

import { formatAbsDateTime } from '~/lib/intl/time';
import { convertBlobToUrl } from '~/lib/utils/blob';
import { isElementClicked } from '~/lib/utils/interaction';

import { deserializeComposer } from '~/components/composer/lib/drafts/deserialize';

import ComposerDialogLazy from '~/components/composer/composer-dialog-lazy';
import ImageEmbed from '~/components/embeds/image-embed';
import MoreHorizOutlinedIcon from '~/components/icons-central/more-horiz-outline';

import DraftOverflowMenu from './draft-overflow-menu';

interface DraftItemProps {
	entry: DraftEntry;
}

const DraftItem = ({ entry }: DraftItemProps) => {
	const state = entry.state;

	const posts = state.posts;
	const count = posts.length;

	const imageEmbed = findPostsWithImage(posts);

	const handleClick = (ev: MouseEvent | KeyboardEvent) => {
		if (!isElementClicked(ev)) {
			return;
		}

		ev.preventDefault();

		const deserialized = deserializeComposer(entry);

		openModal(() => <ComposerDialogLazy params={{ override: deserialized }} />);
	};

	return (
		<div
			tabindex={0}
			onClick={handleClick}
			onKeyDown={handleClick}
			class="border-b border-outline px-4 py-3 text-sm hover:bg-contrast/sm active:bg-contrast/sm-pressed"
		>
			<div class="flex justify-between gap-4">
				<p class="text-de text-contrast-muted">
					<span>{/* @once */ formatAbsDateTime(entry.createdAt)}</span>
					{' · '}
					<span>{count !== 1 ? `${count} posts` : `${count} post`}</span>
				</p>

				<div class="shrink-0">
					<button
						onClick={(ev) => {
							const anchor = ev.currentTarget;
							openModal(() => <DraftOverflowMenu anchor={anchor} entry={entry} />);
						}}
						class="-mx-2 -my-1.5 flex h-8 w-8 items-center justify-center rounded-full text-base hover:bg-accent/md hover:text-accent active:bg-accent/md-pressed"
					>
						<MoreHorizOutlinedIcon />
					</button>
				</div>
			</div>

			<div class="mt-1 flex gap-4">
				<div class="min-w-0 grow-4">
					<p class="line-clamp-[4] whitespace-pre-wrap break-words text-sm">
						{
							/* @once */ posts.map((post) => post.text).join('\n\n') || (
								<span class="text-contrast-muted">{'<no contents>'}</span>
							)
						}
					</p>
				</div>

				{imageEmbed ? (
					<div class="grow basis-0">
						<ImageEmbed
							embed={{
								images: imageEmbed.images.map((img) => {
									const blobUrl = convertBlobToUrl(img.blob);

									return {
										alt: img.alt,
										fullsize: blobUrl,
										thumb: blobUrl,
									};
								}),
							}}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default DraftItem;

const findPostsWithImage = (posts: SerializedPost[]): SerializedImageEmbed | undefined => {
	for (const post of posts) {
		const image = extractImage(post.embed);
		if (image) {
			return image;
		}
	}
};

const extractImage = (embed: SerializedEmbed | undefined): SerializedImageEmbed | undefined => {
	if (embed) {
		if (embed.type === 'recordWithMedia') {
			return extractImage(embed.media);
		}

		if (embed.type === 'image') {
			return embed;
		}
	}
};
