import { createHexoHelpers, createDate, createCollection } from "../../../helpers";

export default {
	...createHexoHelpers(),
	"site": {
			"posts": []
		},
		"page": {
			"posts": {
				"data": [
					{
						"date_year": 2025,
						"date_formatted": "2025-03-15",
						"title": "Understanding Closures",
						"path": "posts/understanding-closures/",
						"date": "2025-03-15",
						"categories": [],
						"tags": [],
						"updated": "2025-03-15",
						"content": "<p>Content</p>"
					},
					{
						"date_year": 2025,
						"date_formatted": "2025-01-10",
						"title": "Async/Await Patterns",
						"path": "posts/async-await-patterns/",
						"date": "2025-01-10",
						"categories": [],
						"tags": [],
						"updated": "2025-01-10",
						"content": "<p>Content</p>"
					},
					{
						"date_year": 2024,
						"date_formatted": "2024-11-20",
						"title": "CSS Grid Layout",
						"path": "posts/css-grid-layout/",
						"date": "2024-11-20",
						"categories": [],
						"tags": [],
						"updated": "2024-11-20",
						"content": "<p>Content</p>"
					}
				]
			}
		},
};
