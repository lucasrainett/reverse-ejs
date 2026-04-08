export default {
	"blog": {
		"title": "My N-Blog",
		"description": "A blog about web development"
	},
	"user": {
		"_id": "u001",
		"name": "Alice"
	},
	"posts": [
		{
			"_id": "p001",
			"title": "Getting Started with Node.js",
			"content": "<p>Node.js is a JavaScript runtime.</p>",
			"created_at": "2025-01-15",
			"pv": 128,
			"commentsCount": 5,
			"author": {
				"_id": "u001",
				"name": "Alice",
				"gender": "f",
				"bio": "Full-stack developer",
				"avatar": "alice.png"
			}
		},
		{
			"_id": "p002",
			"title": "Express.js Tutorial",
			"content": "<p>Express is a minimal web framework for Node.js.</p>",
			"created_at": "2025-01-20",
			"pv": 64,
			"commentsCount": 2,
			"author": {
				"_id": "u002",
				"name": "Bob",
				"gender": "m",
				"bio": "Backend engineer",
				"avatar": "bob.png"
			}
		}
	],
	"success": "",
	"error": ""
};
