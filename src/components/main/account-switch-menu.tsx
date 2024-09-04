import { For, Show } from 'solid-js';

import { createProfileQuery } from '~/api/queries/profile';

import { closeAllModals, openModal, useModalContext } from '~/globals/modals';

import type { AccountData } from '~/lib/preferences/sessions';
import { useSession } from '~/lib/states/session';

import Avatar, { getUserAvatarType } from '../avatar';
import Divider from '../divider';
import CircleCheckSolidIcon from '../icons-central/circle-check-solid';
import * as Menu from '../menu';

import ManageAccountDialogLazy from './manage-account-dialog-lazy';
import SignInDialogLazy from './sign-in-dialog-lazy';
import SignOutDialogLazy from './sign-out-dialog-lazy';

interface AccountSwitchMenuProps {
	anchor: HTMLElement;
}

const AccountSwitchMenu = (props: AccountSwitchMenuProps) => {
	const { close } = useModalContext();

	const { currentAccount, getAccounts, resumeSession } = useSession();
	const profile = createProfileQuery(() => currentAccount!.did, { staleTime: Infinity });

	const switchAccount = async (account: AccountData) => {
		resumeSession(account.did);
		closeAllModals();
	};

	return (
		<Menu.Container anchor={props.anchor} placement="top-start" fitDesktopWidth={300}>
			<Show when={getAccounts().length > 1}>
				<CurrentAccountItem />

				<For each={getAccounts().filter((account) => account.did !== currentAccount!.did)}>
					{(account) => <AccountItem account={account} onClick={() => switchAccount(account)} />}
				</For>

				<Divider />
			</Show>

			<Menu.Item
				label="Add an existing account"
				onClick={() => {
					close();
					openModal(() => <SignInDialogLazy />);
				}}
			/>

			<Show when={getAccounts().length > 1}>
				<Menu.Item
					label="Manage accounts"
					onClick={() => {
						close();
						openModal(() => <ManageAccountDialogLazy />);
					}}
				/>
			</Show>

			<Menu.Item
				label={`Log out @${profile.data?.handle ?? 'handle.invalid'}`}
				onClick={() => {
					close();
					openModal(() => <SignOutDialogLazy />);
				}}
			/>
		</Menu.Container>
	);
};

export default AccountSwitchMenu;

const CurrentAccountItem = () => {
	const { currentAccount } = useSession();
	const profile = createProfileQuery(() => currentAccount!.did);

	return (
		<div class="flex gap-4 px-4 py-3">
			<Avatar type={getUserAvatarType(profile.data)} src={profile.data?.avatar} class="mt-0.5" />

			<div class="min-w-0 grow self-center text-sm">
				<p class="overflow-hidden text-ellipsis whitespace-nowrap font-bold empty:hidden">
					{profile.data ? profile.data.displayName : currentAccount!.did}
				</p>
				<p class="overflow-hidden text-ellipsis whitespace-nowrap text-de text-contrast-muted">
					{'@' + (profile.data?.handle ?? 'handle.invalid')}
				</p>
			</div>

			<div class="mt-2.5 shrink-0 text-lg text-repost">
				<CircleCheckSolidIcon />
			</div>
		</div>
	);
};

const AccountItem = ({ account, onClick }: { account: AccountData; onClick?: () => void }) => {
	const profile = createProfileQuery(() => account.did);

	return (
		<button
			onClick={onClick}
			class="flex gap-4 px-4 py-3 text-left hover:bg-contrast/md active:bg-contrast/sm-pressed"
		>
			<Avatar type={getUserAvatarType(profile.data)} src={profile.data?.avatar} class="mt-0.5" />

			<div class="min-w-0 grow self-center text-sm">
				<p class="overflow-hidden text-ellipsis whitespace-nowrap font-bold empty:hidden">
					{profile.data ? profile.data.displayName : account.did}
				</p>
				<p class="overflow-hidden text-ellipsis whitespace-nowrap text-de text-contrast-muted">
					{'@' + (profile.data?.handle ?? 'handle.invalid')}
				</p>
			</div>
		</button>
	);
};
