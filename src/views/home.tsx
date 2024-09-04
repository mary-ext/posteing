import ComposeFAB from '~/components/composer/compose-fab';
import * as Page from '~/components/page';

const HomePage = () => {
	return (
		<>
			<Page.Header>
				<Page.HeaderAccessory>
					<Page.AccountSwitcher />
				</Page.HeaderAccessory>

				<Page.Heading title="Home" />
			</Page.Header>

			<ComposeFAB />

			<div class="text-pretty p-4 text-sm text-contrast-muted">
				i'm gonna put drafts here but i cba to do that yet, come back next time.
			</div>

			<div class="text-pretty p-4 pt-0 text-sm text-contrast-muted">
				the button to start posteing is below
			</div>
		</>
	);
};

export default HomePage;
