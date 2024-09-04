// ISO-639-1 preferred, if a 639-3 code can't be resolved to a language that
// exists here, it should be placed on `language-fallback.ts` file.
export const LANGUAGE_CODES = [
	'aa', // Afar
	'ab', // Abkhazian
	'ae', // Avestan
	'af', // Afrikaans
	'ak', // Akan
	'am', // Amharic
	'an', // Aragonese
	'ar', // Arabic
	'as', // Assamese
	'ast', // Asturian
	'av', // Avaric
	'ay', // Aymara
	'az', // Azerbaijani
	'ba', // Bashkir
	'be', // Belarusian
	'bg', // Bulgarian
	'bh', // Bhojpuri
	'bi', // Bislama
	'bm', // Bambara
	'bn', // Bangla
	'bo', // Tibetan
	'br', // Breton
	'bs', // Bosnian
	'ca', // Catalan
	'ce', // Chechen
	'ch', // Chamorro
	'chr', // Cherokee
	'co', // Corsican
	'cr', // Cree
	'cs', // Czech
	'csb', // Kashubian
	'cu', // Church Slavic
	'cv', // Chuvash
	'cy', // Welsh
	'da', // Danish
	'de', // German
	'dv', // Divehi
	'dz', // Dzongkha
	'ee', // Ewe
	'el', // Greek
	'en', // English
	'eo', // Esperanto
	'es', // Spanish
	'et', // Estonian
	'eu', // Basque
	'fa', // Persian
	'ff', // Fula
	'fi', // Finnish
	'fj', // Fijian
	'fo', // Faroese
	'fr', // French
	'fy', // Western Frisian
	'ga', // Irish
	'gd', // Scottish Gaelic
	'gl', // Galician
	'gu', // Gujarati
	'gv', // Manx
	'ha', // Hausa
	'he', // Hebrew
	'hi', // Hindi
	'ho', // Hiri Motu
	'hr', // Croatian
	'ht', // Haitian Creole
	'hu', // Hungarian
	'hy', // Armenian
	'hz', // Herero
	'ia', // Interlingua
	'id', // Indonesian
	'ie', // Interlingue
	'ig', // Igbo
	'ii', // Sichuan Yi
	'ik', // Inupiaq
	'io', // Ido
	'is', // Icelandic
	'it', // Italian
	'iu', // Inuktitut
	'ja', // Japanese
	'jbo', // Lojban
	'jv', // Javanese
	'ka', // Georgian
	'kab', // Kabyle
	'kg', // Kongo
	'ki', // Kikuyu
	'kj', // Kuanyama
	'kk', // Kazakh
	'kl', // Kalaallisut
	'km', // Khmer
	'kn', // Kannada
	'ko', // Korean
	'kr', // Kanuri
	'ks', // Kashmiri
	'ku', // Kurdish
	'kv', // Komi
	'kw', // Cornish
	'ky', // Kyrgyz
	'la', // Latin
	'lb', // Luxembourgish
	'lg', // Ganda
	'li', // Limburgish
	'ln', // Lingala
	'lo', // Lao
	'lt', // Lithuanian
	'lu', // Luba-Katanga
	'lv', // Latvian
	'mg', // Malagasy
	'mh', // Marshallese
	'mi', // Māori
	'mk', // Macedonian
	'ml', // Malayalam
	'mn', // Mongolian
	'moh', // Mohawk
	'mr', // Marathi
	'ms', // Malay
	'mt', // Maltese
	'my', // Burmese
	'na', // Nauru
	'nb', // Norwegian Bokmål
	'nd', // North Ndebele
	'nds', // Low German
	'ne', // Nepali
	'ng', // Ndonga
	'nl', // Dutch
	'nn', // Norwegian Nynorsk
	'no', // Norwegian
	'nr', // South Ndebele
	'nv', // Navajo
	'ny', // Nyanja
	'oc', // Occitan
	'oj', // Ojibwa
	'om', // Oromo
	'or', // Odia
	'os', // Ossetic
	'pa', // Punjabi
	'pi', // Pali
	'pl', // Polish
	'ps', // Pashto
	'pt', // Portuguese
	'qu', // Quechua
	'rm', // Romansh
	'rn', // Rundi
	'ro', // Romanian
	'ru', // Russian
	'rw', // Kinyarwanda
	'sa', // Sanskrit
	'sc', // Sardinian
	'sco', // Scots
	'sd', // Sindhi
	'se', // Northern Sami
	'sg', // Sango
	'si', // Sinhala
	'sk', // Slovak
	'sl', // Slovenian
	'sma', // Southern Sami
	'smj', // Lule Sami
	'sn', // Shona
	'so', // Somali
	'sq', // Albanian
	'sr', // Serbian
	'ss', // Swati
	'st', // Southern Sotho
	'su', // Sundanese
	'sv', // Swedish
	'sw', // Swahili
	'ta', // Tamil
	'te', // Telugu
	'tg', // Tajik
	'th', // Thai
	'ti', // Tigrinya
	'tk', // Turkmen
	'tl', // Filipino
	'tn', // Tswana
	'to', // Tongan
	'tok', // Toki Pona
	'tr', // Turkish
	'ts', // Tsonga
	'tt', // Tatar
	'ty', // Tahitian
	'ug', // Uyghur
	'uk', // Ukrainian
	'ur', // Urdu
	'uz', // Uzbek
	'vai', // Vai
	've', // Venda
	'vi', // Vietnamese
	'vo', // Volapük
	'wa', // Walloon
	'wo', // Wolof
	'xal', // Kalmyk
	'xh', // Xhosa
	'yi', // Yiddish
	'yo', // Yoruba
	'za', // Zhuang
	'zgh', // Standard Moroccan Tamazight
	'zh', // Chinese
	'zu', // Zulu
];

const englishLanguageNames = new Intl.DisplayNames('en', { type: 'language', fallback: 'none' });

export const getEnglishLanguageName = (code: string) => {
	return englishLanguageNames.of(code);
};
export const getNativeLanguageName = (code: string) => {
	return new Intl.DisplayNames(code, { type: 'language', fallback: 'none' }).of(code);
};
