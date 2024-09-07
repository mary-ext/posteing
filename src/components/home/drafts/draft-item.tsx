import { openModal } from '~/globals/modals';

import type { DraftEntry } from '~/lib/aglais-drafts';
import { formatAbsDateTime } from '~/lib/intl/time';
import { isElementClicked } from '~/lib/utils/interaction';

import { deserializeComposer } from '~/components/composer/lib/drafts/deserialize';

import ComposerDialogLazy from '~/components/composer/composer-dialog-lazy';
import MoreHorizOutlinedIcon from '~/components/icons-central/more-horiz-outline';
import DraftOverflowMenu from './draft-overflow-menu';

interface DraftItemProps {
	entry: DraftEntry;
}

const DraftItem = ({ entry }: DraftItemProps) => {
	const state = entry.state;

	const posts = state.posts;
	const count = posts.length;

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
				<div class="min-w-0 grow">
					<p class="line-clamp-[4] whitespace-pre-wrap break-words text-sm">
						{
							/* @once */ posts.map((post) => post.text).join('\n\n') || (
								<span class="text-muted-fg">{'<no contents>'}</span>
							)
						}
					</p>
				</div>
			</div>
		</div>
	);
};

export default DraftItem;
