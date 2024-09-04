import Button from '~/components/button';
import { openModal } from '~/globals/modals';

import SignInDialogLazy from '~/components/main/sign-in-dialog-lazy';

const SignedOutPage = () => {
	return (
		<>
			<div class="flex grow flex-col items-center justify-center px-12">
				<p class="text-2xl font-medium">posteing</p>
				<p class="mt-1 text-sm">lets you send bluesky threads/multiple posts at once</p>
				<p class="mt-6 text-pretty text-sm text-contrast-muted">
					aka. holy shit i'm burned from maintaining a bluesky web client but bluesky team still hasn't got
					around to taking over my{' '}
					<a
						target="_blank"
						href="https://github.com/bluesky-social/social-app/pull/4163"
						class="text-accent hover:underline"
					>
						threaded composer pull request
					</a>{' '}
					so here it is my beautiful creation
				</p>

				<p class="mt-6 text-sm">
					<a
						target="_blank"
						href="https://codeberg.org/mary-ext/posteing"
						class="text-accent hover:underline"
					>
						source code
					</a>
				</p>
			</div>
			<div class="flex shrink-0 flex-col gap-4 p-6">
				<Button
					onClick={() => {
						openModal(() => <SignInDialogLazy />);
					}}
					variant="primary"
					size="lg"
				>
					Sign in
				</Button>
			</div>
		</>
	);
};

export default SignedOutPage;
