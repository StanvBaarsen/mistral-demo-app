"use client"
import { settings } from "@/utils/settings";
import { useEffect } from "react";

export default function ThemeProvider() {
	useEffect(() => {
		const colorTheme = String(settings.get('preferredColorTheme'));
		if(colorTheme) document.documentElement.classList.add(colorTheme);
	}, []);

	return null;
}