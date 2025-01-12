import type { PostEmbed } from '../lib/state';

type EmbedAction = { type: 'remove_media' } | { type: 'remove_record' };

export interface BaseEmbedProps {
	embed: PostEmbed;
	active: boolean;
	dispatch: (action: EmbedAction) => void;
}
