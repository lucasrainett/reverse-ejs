// Shared fixtures for benchmarks. Templates are single-line and match
// rendered text exactly (no whitespace ambiguity), so we can measure
// `flexibleWhitespace` overhead by comparing benchmarks.

// ── Deep-nested dotted path — exercises setNested ──────────────
// 10 levels of dotted path produces a 10-deep nested object in the
// extracted result. Close to the deepest a hand-written template
// would realistically have.
export const DEEP_TEMPLATE = "<%= a.b.c.d.e.f.g.h.i.j %>";
export const DEEP_RENDERED = "leaf";

// ── Back-reference fallback — same variable twice ──────────────
// The fast path rejects this shape (preserves back-reference semantics);
// measures the full regex path's cost on a small template.
export const BACKREF_TEMPLATE = "<title><%= t %></title><h1><%= t %></h1>";
export const BACKREF_RENDERED = "<title>Hello</title><h1>Hello</h1>";

// ── Realistic large page — 30KB HTML with a loop ───────────────
// Below the ~40KB regex-path cap but big enough that the hybrid
// walker's literal-skip shows its value. Captures 5 scalars + a
// loop of 50 items.
function buildLargePage(): { template: string; rendered: string } {
	const chunk =
		'<article class="filler"><p>Lorem ipsum dolor sit amet.</p></article>\n';
	const pad = chunk.repeat(200); // ~14KB each side
	const template =
		pad +
		"<header><h1><%= title %></h1><p><%= subtitle %></p></header>" +
		"<main>" +
		"<p><%= intro %></p>" +
		"<ul>" +
		"<% items.forEach(i => { %>" +
		"<li><%= i.label %>:<%= i.value %></li>" +
		"<% }) %>" +
		"</ul>" +
		"<footer><%= footer %></footer>" +
		"</main>" +
		pad;
	let rows = "";
	for (let i = 0; i < 50; i++) rows += `<li>Label ${i}:Val ${i}</li>`;
	const rendered =
		pad +
		"<header><h1>Welcome</h1><p>Subline</p></header>" +
		"<main>" +
		"<p>Intro paragraph.</p>" +
		"<ul>" +
		rows +
		"</ul>" +
		"<footer>Copyright 2026</footer>" +
		"</main>" +
		pad;
	return { template, rendered };
}
const LARGE = buildLargePage();
export const LARGE_PAGE_TEMPLATE = LARGE.template;
export const LARGE_PAGE_RENDERED = LARGE.rendered;

// ── Partial-expansion fixture — three small partials ───────────
// Measures the include-expansion + combined-regex cost for the
// common "layout wraps content" shape.
export const PARTIAL_TEMPLATE =
	'<%- include("header") %>' +
	"<main><%= body %></main>" +
	'<%- include("footer") %>';
export const PARTIAL_PARTIALS = {
	header: "<header><h1><%= title %></h1><nav><%= nav %></nav></header>",
	footer: "<footer>&copy; <%= year %> <%= company %></footer>",
};
export const PARTIAL_RENDERED =
	"<header><h1>Welcome</h1><nav>Home | About</nav></header>" +
	"<main>Hello, world.</main>" +
	"<footer>&copy; 2026 Acme</footer>";

export const PRODUCT_TEMPLATE =
	`<div class="product">` +
	`<h1><%= name %></h1>` +
	`<span class="price">$<%= price %></span>` +
	`<p class="description"><%= description %></p>` +
	`<div class="specs">` +
	`<span class="brand"><%= specs.brand %></span>` +
	`<span class="color"><%= specs.color %></span>` +
	`<span class="rating"><%= specs.rating %></span>` +
	`</div>` +
	`<ul class="reviews">` +
	`<% reviews.forEach(r => { %>` +
	`<li><strong><%= r.author %></strong><span><%= r.text %></span></li>` +
	`<% }) %>` +
	`</ul>` +
	`</div>`;

export const PRODUCT_RENDERED =
	`<div class="product">` +
	`<h1>Sony WH-1000XM5</h1>` +
	`<span class="price">$348.00</span>` +
	`<p class="description">Industry-leading noise canceling headphones</p>` +
	`<div class="specs">` +
	`<span class="brand">Sony</span>` +
	`<span class="color">Black</span>` +
	`<span class="rating">4.7</span>` +
	`</div>` +
	`<ul class="reviews">` +
	`<li><strong>Alice</strong><span>Best headphones I've ever owned. The noise canceling is incredible.</span></li>` +
	`<li><strong>Bob</strong><span>Great sound quality, comfortable for long flights.</span></li>` +
	`</ul>` +
	`</div>`;
