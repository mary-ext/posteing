import type { AppBskyGraphDefs } from '@atcute/client/lexicons';

import { parseAtUri } from '~/api/utils/strings';

import Avatar from '../avatar';

interface ListEmbedProps {
	/** Expected to be static */
	list: AppBskyGraphDefs.ListView;
	/** Expected to be static */
	interactive?: boolean;
	onClick?: () => void;
}

const ListEmbed = ({ list, interactive, onClick }: ListEmbedProps) => {
	const uri = parseAtUri(list.uri);
	const href = `/${list.creator.did}/feeds/${uri.rkey}`;

	return (
		<a
			href={interactive ? href : undefined}
			class={
				`flex gap-3 overflow-hidden rounded-md border border-outline p-3` +
				(interactive ? ` hover:bg-contrast/sm active:bg-contrast/sm-pressed` : ``)
			}
			onClick={onClick}
		>
			<Avatar type="list" src={list.avatar} class="mt-0.5" />

			<div class="min-w-0 grow">
				<p class="line-clamp-2 break-words text-sm font-bold">{/* @once */ list.name}</p>
				<p class="line-clamp-2 break-words text-de text-contrast-muted">{
					/* @once */ `${getListLabel(list.purpose)} by @${list.creator.handle}`
				}</p>
			</div>
		</a>
	);
};

export default ListEmbed;

const getListLabel = (type: AppBskyGraphDefs.ListPurpose) => {
	switch (type) {
		case 'app.bsky.graph.defs#curatelist':
			return `Curation list`;
		case 'app.bsky.graph.defs#modlist':
			return `Moderation list`;
	}

	return `Unknown list`;
};
