import fs from "node:fs/promises";

import { blogs } from "./blogs/sources.js";

const apiUrl = "https://www.googleapis.com/blogger/v3/blogs";

// get this from Google API Console
// https://developers.google.com/blogger/docs/3.0/using#APIKey
const apiKey = "key=YOUR_API_KEY";

const requestHeaders = new Headers({
	"Accept-Encoding": "gzip",
	"User-Agent": "Node Fetch (gzip)",
});

for (let blog of blogs) {
	const blogUrl = `https://${blog.url}`;

	const blogInfoResponse = await fetch(
		`${apiUrl}/byurl?url=${blogUrl}&${apiKey}`,
		{ headers: requestHeaders }
	);
	const blogInfo = await blogInfoResponse.json();

	const { id: blogId, name: blogName } = blogInfo;

	console.log(`Инфа по блогу "${blogName}" (${blog.url}) получена`);

	const blogPostsResponse = await fetch(`${apiUrl}/${blogId}/posts?${apiKey}`, {
		headers: requestHeaders,
	});
	const blogPostsInfo = await blogPostsResponse.json();

	const { items: posts } = blogPostsInfo;

	console.log(`Посты в количестве ${posts.length} получены`);

	const content = {
		url: blogUrl,
		api_id: blogId,
		title: blogName,
		posts: posts.map((post) => ({
			id: post.blog.id,
			api_id: post.id,
			url: post.url,
			title: post.title,
			published_date: post.published,
			updated_date: post.updated,
			content: post.content,
		})),
	};

	await fs.writeFile(
		`blogs/${blog.type}/${blog.url}.json`,
		JSON.stringify(content, null, "\t"),
		{ encoding: "utf-8" }
	);
}
