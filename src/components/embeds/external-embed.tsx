import { createSignal, type JSX } from 'solid-js';

import type { AppBskyEmbedExternal } from '@atcute/client/lexicons';

import { safeUrlParse } from '~/api/utils/strings';

import { on } from '~/lib/utils/misc';

import PlaySolidIcon from '../icons-central/play-solid';

import { SnippetType, detectSnippet } from './lib/snippet';
import { GifEmbed } from './supports/gif-embed';

export interface ExternalEmbedProps {
	/** Expected to be static */
	embed: AppBskyEmbedExternal.View;
	/** Expected to be static */
	interactive?: boolean;
}

const ExternalEmbed = ({ embed, interactive }: ExternalEmbedProps) => {
	const { title, uri, thumb } = embed.external;

	const url = safeUrlParse(uri);
	const domain = trimDomain(url?.host ?? '');

	const snippet = detectSnippet(embed.external, !interactive);
	const type = snippet.type;

	if (type === SnippetType.BLUESKY_GIF) {
		return <GifEmbed snippet={snippet} />;
	}

	if (type === SnippetType.IFRAME) {
		const [show, setShow] = createSignal(false);

		return on(show, (isShowing) => {
			if (isShowing) {
				return (
					<div
						class="overflow-hidden rounded-md border border-outline"
						style={/* @once */ { 'aspect-ratio': snippet.ratio }}
					>
						<iframe src={/* @once */ snippet.url} allow="autoplay; fullscreen" class="h-full w-full" />
					</div>
				);
			}

			return (
				<div class="flex overflow-hidden rounded-md border border-outline">
					<button
						onClick={() => setShow(true)}
						class="relative aspect-square w-[86px] shrink-0 border-r border-outline"
					>
						{thumb && <img src={thumb} class="h-full w-full object-cover" />}

						<div class="absolute inset-0 grid place-items-center">
							<div class="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-accent">
								<PlaySolidIcon class="text-sm" />
							</div>
						</div>
					</button>

					<a
						href={uri}
						target="_blank"
						rel="noopener noreferrer nofollow"
						class="flex min-w-0 grow flex-col justify-center gap-0.5 p-3 text-sm hover:bg-contrast/sm active:bg-contrast/sm-pressed"
					>
						<p class="overflow-hidden text-ellipsis text-contrast-muted empty:hidden">{domain}</p>
						<p class="line-clamp-2 break-words font-medium empty:hidden">{title}</p>
					</a>
				</div>
			);
		}) as unknown as JSX.Element;
	}

	return (
		<a
			href={interactive ? uri : undefined}
			target="_blank"
			rel="noopener noreferrer nofollow"
			class={
				`flex overflow-hidden rounded-md border border-outline` +
				(interactive ? ` hover:bg-contrast/sm active:bg-contrast/sm-pressed` : ``)
			}
		>
			{thumb && (
				<img src={thumb} class="aspect-square w-[86px] shrink-0 border-r border-outline object-cover" />
			)}

			<div class="flex min-w-0 flex-col justify-center gap-0.5 p-3 text-sm">
				<p class="overflow-hidden text-ellipsis text-contrast-muted empty:hidden">{domain}</p>
				<p class="line-clamp-2 break-words font-medium empty:hidden">{title}</p>
			</div>
		</a>
	);
};

export default ExternalEmbed;

const trimDomain = (host: string) => {
	return host.startsWith('www.') ? host.slice(4) : host;
};
