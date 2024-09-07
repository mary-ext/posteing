import { createInfiniteQuery } from '@mary/solid-query';

import type { DraftEntry } from '~/lib/aglais-drafts';
import { useDrafts } from '~/lib/states/drafts';

import List from '~/components/list';

import DraftItem from './draft-item';

interface DraftsListingReturn {
	cursor: string | undefined;
	entries: DraftEntry[];
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

			const entries: DraftEntry[] = [];
			let count = 0;
			let cursor: string | undefined;

			for await (const curs of tx.store.iterate(range, 'prev')) {
				if (count++ >= PER_PAGE) {
					cursor = curs.value.id;
					break;
				}

				entries.push(curs.value);
			}

			return {
				cursor: cursor,
				entries: entries,
			};
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (last) => last.cursor,
	}));

	return (
		<List
			data={query.data?.pages.flatMap((page) => page.entries)}
			error={query.error}
			render={(entry) => {
				return <DraftItem entry={entry} />;
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
