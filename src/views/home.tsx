import ComposeFAB from '~/components/composer/compose-fab';
import DraftsListing from '~/components/home/drafts/drafts-listing';
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

			<DraftsListing />
		</>
	);
};

export default HomePage;
