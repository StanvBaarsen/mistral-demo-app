
type Setting = {
	preferredColorTheme: string;
	temperature: number;
	customInstruction: string;
	[key: string]: string | boolean | number;
};

const defaults: Setting = {
	preferredColorTheme: 'dark',
	temperature: 0.3,
	customInstruction: '',
};

export const settings = {
	get(key: string) {
		const settings: Setting = JSON.parse(localStorage.getItem('settings') || '{}');
		return settings[key] || defaults[key];
	},
	set(key: string, value: string | boolean | number) {
		const settings: Setting = JSON.parse(localStorage.getItem('settings') || '{}');
		settings[key] = value;
		localStorage.setItem('settings', JSON.stringify(settings));
	},
};