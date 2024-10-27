"use client";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = {
	content: string;
	role: string;
	isError?: boolean;
}


export default function MainPage() {
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
			const messagesDiv = document.getElementById('messages');
			if(messagesDiv) {
				messagesDiv.scrollTop = messagesDiv.scrollHeight;
			}

			const res = await fetch('/api/mistral', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ messages: newMessages }),
			});

			if(messagesDiv) {
				messagesDiv.scrollTop = messagesDiv.scrollHeight;
			}

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
						<span className="text-gray-500">Loading...</span>
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
					onKeyUp={(e) => e.key === "Enter" && !loading ? sendMessage() : null}
				/>
				<button
					disabled={loading}
					onClick={sendMessage}
					className="bg-black text-white rounded p-2"
				>
					Send
				</button>
			</div>
		</>
	);
}
