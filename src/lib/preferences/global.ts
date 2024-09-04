export interface GlobalPreferenceSchema {
	$version: 1;
	ui: UiPreferences;
}

interface UiPreferences {
	theme: 'system' | 'light' | 'dark';
}
