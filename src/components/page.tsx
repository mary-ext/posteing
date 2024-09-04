import type { ParentProps } from 'solid-js';

import { createProfileQuery } from '~/api/queries/profile';

import { useAgent } from '~/lib/states/agent';
import { useSession } from '~/lib/states/session';

import Avatar, { getUserAvatarType } from './avatar';
import IconButton from './icon-button';
import MenuOutlinedIcon from './icons-central/menu-outline';
import { openModal } from '~/globals/modals';
import AccountSwitchMenu from './main/account-switch-menu';

interface PageHeaderProps extends ParentProps {}

const PageHeader = (props: PageHeaderProps) => {
	return (
		<>
			<div class="sticky top-0 z-2 flex h-13 w-full max-w-md shrink-0 items-center justify-between gap-4 bg-background px-2.5">
				{props.children}
			</div>
		</>
	);
};

export { PageHeader as Header };

interface PageHeadingProps {
	title?: string;
	subtitle?: string;
}

const PageHeading = (props: PageHeadingProps) => {
	return (
		<div class="flex min-w-0 grow flex-col gap-0.5">
			<p class="overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold leading-5">
				{props.title}
			</p>

			<p class="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-contrast-muted empty:hidden">
				{props.subtitle}
			</p>
		</div>
	);
};

export { PageHeading as Heading };

interface PageHeaderAccessoryProps extends ParentProps {}

const PageHeaderAccessory = (props: PageHeaderAccessoryProps) => {
	return <div class="flex shrink-0 gap-2 empty:hidden">{props.children}</div>;
};

export { PageHeaderAccessory as HeaderAccessory };

interface PageAccountSwitcherProps {}

const PageAccountSwitcher = ({}: PageAccountSwitcherProps) => {
	const { currentAccount } = useSession();
	const { persister } = useAgent();

	return (
		<IconButton
			title="Open account switcher"
			icon={() => {
				if (currentAccount) {
					const profile = createProfileQuery(() => currentAccount.did, { persister });
					return <Avatar type={getUserAvatarType(profile.data)} src={profile.data?.avatar} size="sm" />;
				}

				return <MenuOutlinedIcon />;
			}}
			onClick={(ev) => {
				if (!currentAccount) {
					return;
				}

				const target = ev.currentTarget;
				openModal(() => <AccountSwitchMenu anchor={target} />);
			}}
		/>
	);
};

export { PageAccountSwitcher as AccountSwitcher };
