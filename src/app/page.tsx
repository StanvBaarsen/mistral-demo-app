"use client";
import React, { useState } from 'react';

type Message = {
	content: string;
	role: string;
	isError?: boolean;
}


export default function MistralChatPage() {
	const [userInput, setUserInput] = useState('');
	const [chatMessages, setChatMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);

	const sendMessage = async () => {
		if (!userInput) return;

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

			const data = await res.json();
			setLoading(false);
			if (data.error) {
				setChatMessages((prev) => [...prev, {
					content: data.error,
					role: 'assistant',
					isError: true,
				}])
			} else {
				setChatMessages((prev) => [...prev, {
					content: data.response,
					role: 'assistant',
				}]);
			}

			// allow user to type again
			document.getElementById('userInput')?.focus();

		} catch (error) {
			setChatMessages((prev) => [...prev, {
				content: 'Error: ' + JSON.stringify(error),
				role: 'assistant',
				isError: true,
			}]);
		}
	};

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">
				Stan&#39;s Mistral Demo Web App
			</h1>
			<div className={chatMessages.length ? "py-8 px-4 bg-gray-100 rounded" : ""}>
				<ul>
					{chatMessages.map((response, index) => (
						<li key={index} className="chatMessage">
							{response.role == 'user' ? 'You' : 'Mistral'}:
							<span className={response.isError ? "text-red-500" : ""}>{response.content}</span>
						</li>
					))}
					{loading &&
						<li className="chatMessage">
							Mistral: <span className="text-gray-500">Loading...</span>
						</li>
					}
				</ul>
			</div>
			<input
				type="text"
				id="userInput"
				value={userInput}
				onChange={(e) => setUserInput(e.target.value)}
				placeholder="Ask anything!"
				onKeyUp={(e) => e.key === "Enter" ? sendMessage() : null}
			/>
			<button
				disabled={loading}
				onClick={sendMessage}
				className="bg-black text-white rounded p-2"
			>
				Send
			</button>
		</div>
	);
}
