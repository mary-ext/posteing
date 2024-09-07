import { useQueryClient } from '@mary/solid-query';

import type { DraftEntry } from '~/lib/aglais-drafts';
import { useDrafts } from '~/lib/states/drafts';

import { openModal, useModalContext } from '~/globals/modals';

import TrashOutlinedIcon from '~/components/icons-central/trash-outline';
import * as Menu from '~/components/menu';
import * as Prompt from '~/components/prompt';

interface DraftOverflowMenuProps {
	anchor: HTMLElement;
	entry: DraftEntry;
}

const DraftOverflowMenu = (props: DraftOverflowMenuProps) => {
	const { close } = useModalContext();

	const entry = props.entry;

	const queryClient = useQueryClient();
	const drafts = useDrafts();

	return (
		<Menu.Container anchor={props.anchor}>
			<Menu.Item
				icon={TrashOutlinedIcon}
				label="Delete"
				onClick={() => {
					close();

					openModal(() => (
						<Prompt.Confirm
							title="Delete this draft?"
							description="You won't be able to retrieve it once it's been deleted"
							danger
							confirmLabel="Delete"
							onConfirm={() => {
								drafts.open().then(async (db) => {
									await db.delete('drafts', entry.id);
									queryClient.invalidateQueries({ queryKey: ['drafts'], exact: true });
								});
							}}
						/>
					));
				}}
			/>
		</Menu.Container>
	);
};

export default DraftOverflowMenu;
