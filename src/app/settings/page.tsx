"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { settings } from '@/utils/settings';
import './settings.css';

export default function SettingsPage() {
	const router = useRouter();
	const [colorTheme, setColorTheme] = useState('');
	const [temperature, setTemperature] = useState('');
	const [customInstruction, setCustomInstruction] = useState('');
	const [recentlyUpdatedTemp, setRecentlyUpdatedTemp] = useState(false);
	const [recentlyUpdatedCustomInstruction, setRecentlyUpdatedCustomInstruction] = useState(false);

	const changeSetting = (key: string, value: string | boolean | number) => {
		if (key === 'temperature') {
			if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 1 || !value) {
				alert('Temperature must be a number between 0 and 1');
				return;
			} else {
				setRecentlyUpdatedTemp(true);
				setTimeout(() => {
					setRecentlyUpdatedTemp(false);
				}, 1500);
			}
		} else if (key === 'customInstruction') {
			setRecentlyUpdatedCustomInstruction(true);
			setTimeout(() => {
				setRecentlyUpdatedCustomInstruction(false);
			}, 1500);
		}

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
		setTemperature(String(settings.get('temperature')));
		setCustomInstruction(String(settings.get('customInstruction')));
	}, []);

	return (
		<>
			<header className="shadow-md">
				<button
					className="fab ml-3"
					onClick={() => router.push('/')}
				>
					<i className="material-icons">arrow_back</i>
				</button>
				<h1 className="text-2xl font-bold">
					Settings
				</h1>
			</header>
			<div className="main-content">
				<table id="settings-table">
					<tbody>

						<tr>
							<td>
								<span
									onClick={() => updateTheme(colorTheme == 'dark' ? 'light' : 'dark')}
								>
									Dark mode
								</span>
							</td>
							<td>
								<input
									type="checkbox"
									checked={colorTheme == 'dark'}
									onChange={(e) => {
										updateTheme(e.target.checked ? 'dark' : 'light');
									}}
								/>
							</td>
						</tr>
						<tr>
							<td>
								Temperature:
								<span
									className="tooltip cursor-pointer relative top-1.5 left-2"
									onClick={() => alert('According to Mistral: "[Temperature indicates] what sampling temperature to use, we recommend between 0.0 and 1.0. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. "')}
									>
									<i className="material-icons">help</i>
								</span>
							</td>
							<td>
								<input
									type="number"
									className="input text-white p-4 outline-none bg-[rgba(255,255,255,0.1)]"
									value={temperature}
									onChange={(e) => setTemperature(e.target.value)}
								/>
							</td>
							<td>
								<button
									className={"btn bg-accent" + (recentlyUpdatedTemp ? ' !bg-green-500' : '')}
									onClick={() => {
										changeSetting('temperature', temperature);
									}}
								>
									{recentlyUpdatedTemp ? 'Saved!' : 'Save'}
								</button>
							</td>
						</tr>
						<tr>
							<td>
								Custom Instructions:
								<span
									className="tooltip cursor-pointer relative top-1.5 left-2"
									onClick={() => alert('Custom instructions are instructions passed on to Mistral at the start of every chat. You can for example tell it to be extra polite, treat you like a toddler, or ask it to tell a fun fact about Paris in every response')}
									>
									<i className="material-icons">help</i>
								</span>
							</td>
							<td>
								<textarea
									className="input text-white p-4 outline-none bg-[rgba(255,255,255,0.1)]"
									value={customInstruction}
									onChange={(e) => setCustomInstruction(e.target.value)}
								/>
							</td>
							<td>
								<button
									className={"btn bg-accent" + (recentlyUpdatedCustomInstruction ? ' !bg-green-500' : '')}
									onClick={() => {
										changeSetting('customInstruction', customInstruction);
									}}
								>
									{recentlyUpdatedCustomInstruction ? 'Saved!' : 'Save'}
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</>
	);
}