import { createInfiniteQuery } from '@mary/solid-query';

import { openModal } from '~/globals/modals';

import List from '~/components/list';

import type { DraftItem } from '~/lib/aglais-drafts';
import { formatAbsDateTime } from '~/lib/intl/time';
import { useDrafts } from '~/lib/states/drafts';
import { isElementClicked } from '~/lib/utils/interaction';

import ComposerDialogLazy from '~/components/composer/composer-dialog-lazy';
import { deserializeComposer } from '~/components/composer/lib/drafts/deserialize';

interface DraftsListingReturn {
	cursor: string | undefined;
	items: DraftItem[];
}

const PER_PAGE = 50;

const DraftsListing = () => {
	const { open: openDb } = useDrafts();

	const query = createInfiniteQuery(() => ({
		queryKey: ['drafts'],
		async queryFn({ pageParam }): Promise<DraftsListingReturn> {
			const db = await openDb();

			const tx = db.transaction('drafts', 'readonly');

			const range = pageParam !== undefined ? IDBKeyRange.upperBound(pageParam) : undefined;

			const items: DraftItem[] = [];
			let count = 0;
			let cursor: string | undefined;

			for await (const curs of tx.store.iterate(range, 'prev')) {
				if (count++ >= PER_PAGE) {
					cursor = curs.value.id;
					break;
				}

				items.push(curs.value);
			}

			return {
				cursor: cursor,
				items: items,
			};
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (last) => last.cursor,
	}));

	return (
		<List
			data={query.data?.pages.flatMap((page) => page.items)}
			error={query.error}
			render={(item) => {
				const state = item.state;

				const posts = state.posts;
				const count = posts.length;

				const handleClick = (ev: MouseEvent | KeyboardEvent) => {
					if (!isElementClicked(ev)) {
						return;
					}

					ev.preventDefault();

					const deserialized = deserializeComposer(item);

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
								<span>{/* @once */ formatAbsDateTime(item.createdAt)}</span>
								{' · '}
								<span>{count !== 1 ? `${count} posts` : `${count} post`}</span>
							</p>
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
			}}
			fallback={
				<p class="grid grow place-items-center py-6 text-center text-base font-medium text-contrast-muted">
					Your drafts will appear here.
				</p>
			}
			hasNextPage={query.hasNextPage}
			isFetchingNextPage={query.isFetching}
			onEndReached={() => query.fetchNextPage()}
		/>
	);
};

export default DraftsListing;
