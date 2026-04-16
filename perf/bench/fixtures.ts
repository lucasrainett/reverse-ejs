// Shared fixtures for benchmarks. Templates are single-line and match
// rendered text exactly (no whitespace ambiguity), so we can measure
// `flexibleWhitespace` overhead by comparing benchmarks.

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
