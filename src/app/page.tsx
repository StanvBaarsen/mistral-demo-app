"use client";
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = {
	content: string;
	role: string;
	isError?: boolean;
}

export default function MainPage() {
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
		if (messagesDiv) {
			messagesDiv.scrollTop = messagesDiv.scrollHeight;
		}

		try {
			const newMessages = [...chatMessages, {
				content: userInput,
				role: 'user',
			}];
			setChatMessages(newMessages);
			setUserInput('');
			setLoading(true);

			const res = await fetch('/api/mistral', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ messages: newMessages }),
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
			if (messagesDiv) {
				messagesDiv.scrollTop = messagesDiv.scrollHeight;
			}
			focusInput();
			
			reader.cancel();
		} catch (error) {
			setChatMessages((prev) => [...prev, {
				content: 'Error: ' + JSON.stringify(error),
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
			<header id="header">
				<h1 className="text-2xl font-bold mb-4">
					Stan&#39;s Mistral Demo Web App
				</h1>
			</header>
			<div id="messages">
				{chatMessages.map((response, index) => (
					<div key={index} className={`chatMessage ${response.role}`}>
						<b>
							{response.role == 'user' ? 'You' : 'Mistral'}:
						</b>
						<span className={response.isError ? "text-red-500" : ""}>
							<ReactMarkdown>{response.content}</ReactMarkdown>
						</span>
					</div>
				))}
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
			</div>
			<div id="messageBox">
				<input
					type="text"
					id="userInput"
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					placeholder="Ask anything!"
					onKeyUp={(e) => (e.key === "Enter" && !loading) ? sendMessage() : null}
				/>
				<button
					disabled={loading}
					onClick={sendMessage}
					className="bg-black text-white rounded p-2"
				>
					{loading ? 'Loading...' : 'Send'}
				</button>
			</div>
		</>
	);
}
