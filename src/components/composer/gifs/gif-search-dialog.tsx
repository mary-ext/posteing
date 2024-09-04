import { For, Match, Switch, createSignal } from 'solid-js';

import { createGifSearchQuery, type Gif } from '~/api/queries/composer-gif';
import { chunked } from '~/api/utils/misc';

import { useModalContext } from '~/globals/modals';

import { ifIntersect } from '~/lib/utils/element-refs';
import { createDebouncedValue } from '~/lib/hooks/debounced-value';

import CircularProgress from '../../circular-progress';
import * as Dialog from '../../dialog';
import EndOfListView from '../../end-of-list-view';
import ErrorView from '../../error-view';
import SearchInput from '../../search-input';
import VirtualItem from '../../virtual-item';

interface GifSearchDialogProps {
	onPick: (gif: GifMedia) => void;
}

const GifSearchDialog = (props: GifSearchDialogProps) => {
	const { close } = useModalContext();

	const onPick = props.onPick;

	const [search, setSearch] = createSignal('');
	const debouncedSearch = createDebouncedValue(search, 500);

	const query = createGifSearchQuery(debouncedSearch);

	return (
		<>
			<Dialog.Backdrop />
			<Dialog.Container fullHeight>
				<Dialog.Header>
					<Dialog.HeaderAccessory>
						<Dialog.Close />
					</Dialog.HeaderAccessory>

					<div class="flex grow pr-2">
						<SearchInput value={search()} onChange={setSearch} placeholder="Search for GIFs" />
					</div>
				</Dialog.Header>

				<Dialog.Body unpadded>
					<div class="flex flex-col gap-0.5">
						<For each={query.data}>
							{(gifs) => {
								return chunked(gifs, 3).map((chunk) => {
									return (
										<VirtualItem>
											<div class="flex gap-0.5">
												{chunk.map((gif) => {
													const media = getGifMedia(gif);

													return (
														<button
															onClick={() => {
																close();
																onPick(media);
															}}
															class="aspect-square grow basis-0 overflow-hidden bg-outline-md"
														>
															<img src={media.gifUrl} class="h-full w-full bg-black object-cover" />
														</button>
													);
												})}
											</div>
										</VirtualItem>
									);
								});
							}}
						</For>
					</div>

					<Switch>
						<Match when={query.isRefetching}>{null}</Match>

						<Match when={query.error}>
							{(err) => <ErrorView error={err()} onRetry={() => query.fetchNextPage()} />}
						</Match>

						<Match when={query.isFetching || query.hasNextPage}>
							<div
								ref={(node) => {
									const onEndReached = () => query.fetchNextPage();

									ifIntersect(node, () => !query.isFetching && query.hasNextPage, onEndReached, {
										rootMargin: `150% 0%`,
									});
								}}
								class="grid h-13 shrink-0 place-items-center"
							>
								<CircularProgress />
							</div>
						</Match>

						<Match when>
							<EndOfListView />
						</Match>
					</Switch>
				</Dialog.Body>
			</Dialog.Container>
		</>
	);
};

export default GifSearchDialog;

export interface GifMedia {
	embedUrl: string;
	alt: string;
	ratio: { width: number; height: number };

	gifUrl: string;
	videoUrl: string;
	thumbUrl: string;
}

const getGifMedia = (gif: Gif): GifMedia => {
	const media = gif.media_formats.gif;

	const dimensions = media.dims;
	const url = media.url;

	const [, id, file] = /\/([^/]+?AAAAC)\/([^/]+?)\.gif\/?$/.exec(url)!;

	return {
		embedUrl: url + `?hh=${dimensions[1]}&ww=${dimensions[0]}`,
		alt: gif.content_description,
		ratio: { width: dimensions[0], height: dimensions[1] },

		// AAAAM -> tinygif
		gifUrl: `https://media.tenor.com/${id.replace(/AAAAC$/, 'AAAAM')}/${file}.gif`,
		// AAAP3 -> tinywebm
		videoUrl: `https://t.gifs.bsky.app/${id.replace(/AAAAC$/, 'AAAP3')}/${file}.webm`,
		// AAAAF -> tinygifpreview
		thumbUrl: `https://t.gifs.bsky.app/${id.replace(/AAAAC$/, 'AAAAF')}/${file}.png`,
	};
};
