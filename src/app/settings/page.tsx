"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { settings } from '@/utils/settings';
import './settings.css';

export default function SettingsPage() {
	const router = useRouter();
	const [colorTheme, setColorTheme] = useState('');

	const changeSetting = (key: string, value: string | boolean) => {
		settings.set(key, value);
	};
	const updateTheme = (theme: string) => {
		setColorTheme(theme);
		changeSetting('preferredColorTheme', theme);
		if (theme == 'dark') {
			document.documentElement.classList.remove('light');
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
			document.documentElement.classList.add('light');
		}
	}

	useEffect(() => {
		setColorTheme(String(settings.get('preferredColorTheme')));
	}, []);

	return (
		<>
			<header className="shadow-md">
				<button
					className="with-icon fab ml-3"
					onClick={() => router.push('/')}
				>
					<i className="material-icons">arrow_back</i>
				</button>
				<h1 className="text-2xl font-bold">
					Settings
				</h1>
			</header>
			<div className="main-content">
				<div>
					<input
						type="checkbox"
						className=""
						checked={colorTheme == 'dark'}
						onChange={(e) => {
							updateTheme(e.target.checked ? 'dark' : 'light');
						}}
					/>
					<span
						onClick={() => updateTheme(colorTheme == 'dark' ? 'light' : 'dark')}
						className="ml-2"
					>
						Dark mode
					</span>
				</div>
			</div>
		</>
	);
}