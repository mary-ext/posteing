import { batch } from 'solid-js';

import * as preferences from '~/globals/preferences';

import * as Prompt from '../prompt';

const SignOutDialog = () => {
	return (
		<Prompt.Confirm
			title={`Sign out from all account?`}
			description={<></>}
			confirmLabel="Sign out"
			onConfirm={() => {
				batch(() => {
					const ui = preferences.sessions;

					ui.accounts = [];
					ui.active = undefined;

					location.reload();
				});
			}}
		/>
	);
};

export default SignOutDialog;
