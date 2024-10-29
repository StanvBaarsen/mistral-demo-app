"use client";
import React, { memo, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import './home.css';
import { settings } from '@/utils/settings';

type Message = {
	content: string;
	role: string;
	isError?: boolean;
}

export default function MainPage() {
	const router = useRouter();
	const [userInput, setUserInput] = useState('');
	const [chatMessages, setChatMessages] = useState<Message[]>([]);
	const [unfinishedMistralResponse, setUnfinishedMistralResponse] = useState('');
	const [loading, setLoading] = useState(false);

	const focusInput = () => {
		document.getElementById('userInput')?.focus();
	}

	const sendMessage = async () => {
		if (!userInput) return;

		const messagesDiv = document.getElementById('messages');
		if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight

		try {
			const newMessages = [...chatMessages, {
				content: userInput,
				role: 'user',
			}];
			setChatMessages(newMessages);
			setUserInput('');
			setLoading(true);

			const customInstruction = settings.get('customInstruction') as string;
			const temperature = settings.get('temperature') as number;
			const res = await fetch('/api/mistral', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ messages: newMessages, customInstruction, temperature }),
			});

			if (!res.body) {
				throw new Error('No response body');
			}

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let message = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				message += decoder.decode(value, { stream: true });
				setUnfinishedMistralResponse(message);
			}

			setLoading(false);
			setChatMessages((prev) => [...prev, {
				content: message,
				role: 'assistant',
			}]);
			setUnfinishedMistralResponse('');
			if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight
			focusInput();

			reader.cancel();
		} catch (error) {
			setChatMessages((prev) => [...prev, {
				content: 'Error: ' + String(error),
				role: 'assistant',
				isError: true,
			}]);
			setLoading(false);
			setUnfinishedMistralResponse('');
		}
	};

	useEffect(() => {
		focusInput();
	}, []);

	return (
		<>
			<header className="shadow-md">
				<h1 className="text-2xl font-bold">
					Stan&#39;s Mistral Demo Web App
				</h1>
				<button
					className="fab mr-3"
					onClick={() => router.push('/settings')}
				>
					<i className="material-icons">settings</i>
				</button>
			</header>
			<div id="messagesList" className="main-content">
				{loading &&
					<div className="chatMessage">
						<b>
							Mistral:
						</b>
						<br />
						{unfinishedMistralResponse ?
							<ReactMarkdown>{unfinishedMistralResponse + ' ...'}</ReactMarkdown>
							:
							<span className="text-gray-500">Loading...</span>
						}
					</div>
				}
				<Messages messages={chatMessages} />
				<br />
			</div>
			<div id="inputBox" className="shadow-md">
				<textarea
					id="userInput"
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					placeholder="Ask anything!"
					onKeyUp={(e) => (e.key === "Enter" && !e.shiftKey && !loading) ? sendMessage() : null}
				/>
				<button
					disabled={loading}
					onClick={sendMessage}
				>
					<i className="material-icons">send</i>
				</button>
			</div>
		</>
	);
}


const Messages = memo(function Messages({ messages }: { messages: Message[] }) {
	messages = [...messages].reverse(); // because the messagesList flex is reverse-column, i.e., newest messages at the bottom
	return (
		<>
			{messages.map((response, index) => (
				<div key={index} className={`chatMessage ${response.role} shadow-md`}>
					<b>
						{response.role == 'user' ? 'You' : 'Mistral'}:
					</b>
					<span className={response.isError ? "text-red-500" : ""}>
						<ReactMarkdown>{response.content}</ReactMarkdown>
					</span>
				</div>
			))}
		</>
	);
});