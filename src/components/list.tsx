import { For, Match, Switch, type JSX } from 'solid-js';

import { getQueryErrorInfo } from '~/api/utils/query';

import { ifIntersect } from '~/lib/utils/element-refs';

import CircularProgress from './circular-progress';
import EndOfListView from './end-of-list-view';
import ErrorView from './error-view';

interface ListProps<T> {
	data?: T[];
	error?: unknown;
	render: (item: T, index: () => number) => JSX.Element;
	fallback?: JSX.Element;
	manualScroll?: boolean;
	hasNewData?: boolean;
	hasNextPage?: boolean;
	isRefreshing?: boolean;
	isFetchingNextPage?: boolean;
	onEndReached?: () => void;
	onRefresh?: () => void;
}

const List = <T,>(props: ListProps<T>) => {
	const render = props.render;

	const onEndReached = props.onEndReached;
	const onRefresh = props.onRefresh;

	const hasFallback = 'fallback' in props;

	return (
		<div class="flex grow flex-col">
			<Switch>
				<Match when={props.isRefreshing}>
					<div class="grid h-13 shrink-0 place-items-center border-b border-outline">
						<CircularProgress />
					</div>
				</Match>

				<Match when={props.hasNewData}>
					<button
						onClick={onRefresh}
						class="hover:bg-border-outline-25 grid h-13 shrink-0 place-items-center border-b border-outline text-sm text-accent"
					>
						Show new items
					</button>
				</Match>
			</Switch>

			<For each={props.data}>{render}</For>

			<Switch>
				<Match when={props.isRefreshing}>{null}</Match>

				<Match when={props.error}>
					{(err) => (
						<ErrorView
							error={err()}
							onRetry={() => {
								const info = getQueryErrorInfo(err());

								if (info && info.pageParam === undefined) {
									onRefresh?.();
								} else {
									onEndReached?.();
								}
							}}
						/>
					)}
				</Match>

				<Match when={props.manualScroll && !props.isFetchingNextPage && props.hasNextPage}>
					<button
						onClick={onEndReached}
						class="grid h-13 shrink-0 place-items-center text-sm text-accent hover:bg-contrast/sm"
					>
						Show more
					</button>
				</Match>

				<Match when={props.isFetchingNextPage || props.hasNextPage}>
					<div
						ref={(node) => {
							if (onEndReached) {
								ifIntersect(node, () => !props.isFetchingNextPage && props.hasNextPage, onEndReached, {
									rootMargin: `150% 0%`,
								});
							}
						}}
						class="grid h-13 shrink-0 place-items-center"
					>
						<CircularProgress />
					</div>
				</Match>

				<Match when={hasFallback && (!props.data || props.data.length === 0)}>{props.fallback}</Match>

				<Match when={props.data}>
					<EndOfListView />
				</Match>
			</Switch>
		</div>
	);
};

export default List;
