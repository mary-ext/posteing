import { ErrorBoundary, Suspense, lazy } from 'solid-js';

import { hasModals } from './globals/modals';

import { RouterView } from './lib/navigation/router';
import { useSession } from './lib/states/session';

import ErrorPage from './views/_error';

const SignedOutView = lazy(() => import('./views/_signed-out'));

const Shell = () => {
	const { currentAccount } = useSession();

	return (
		<div
			inert={hasModals()}
			class="relative z-0 mx-auto flex min-h-[100dvh] max-w-md flex-col-reverse border-outline sm:border-x"
		>
			<div class="z-0 flex min-h-0 grow flex-col overflow-clip">
				<RouterView
					render={({ def }) => {
						return (
							<ErrorBoundary fallback={(error, reset) => <ErrorPage error={error} reset={reset} />}>
								<Suspense
									children={(() => {
										if (!currentAccount && !def.meta?.public) {
											return <SignedOutView />;
										}

										return <def.component />;
									})()}
								/>
							</ErrorBoundary>
						);
					}}
				/>
			</div>
		</div>
	);
};

export default Shell;
