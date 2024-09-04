export interface PerAccountPreferenceSchema {
	$version: 1;
	composer: ComposerPreferences;
}

export interface ComposerPreferences {
	/** Default language to use when composing a new post */
	defaultPostLanguage: 'none' | 'system' | (string & {});
	/** Default reply gate when creating a new thread */
	defaultReplyGate: 'everyone' | 'follows' | 'mentions';
}
