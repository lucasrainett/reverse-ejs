// reverse-ejs playground - Alpine.js component.
// Loaded with `defer`, runs before the Alpine script fires `alpine:init`.

(function () {
	// ── Pure syntax-highlight helpers ───────────────────────────────

	function escapeHtml(str) {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}

	var HTML_TAG_RE =
		/(&lt;\/?)([\w][\w-]*)((?:\s+[\w-]+(?:=(?:&quot;[^&]*?&quot;|"[^"]*?"|'[^']*?'|[^\s&]+))?)*\s*\/?)(&gt;)/g;
	var HTML_ATTR_RE =
		/([\w-]+)(=)(&quot;[^&]*?&quot;|"[^"]*?"|'[^']*?'|[^\s&]+)/g;

	function highlightHtmlTags(escaped) {
		return escaped.replace(
			HTML_TAG_RE,
			function (m, open, tagName, attrs, close) {
				var out =
					'<span class="html-tag">' + open + tagName + "</span>";
				if (attrs) {
					out += attrs.replace(
						HTML_ATTR_RE,
						'<span class="html-attr">$1</span>$2<span class="html-string">$3</span>',
					);
				}
				return out + '<span class="html-tag">' + close + "</span>";
			},
		);
	}

	function highlightEjs(text) {
		var escaped = escapeHtml(text);
		var ejsParts = [];
		escaped = escaped.replace(
			/(&lt;%[-=]?)([\s\S]*?)(%&gt;)/g,
			function (m, open, body, close) {
				var html =
					open.indexOf("=") !== -1 || open.indexOf("-") !== -1
						? '<span class="ejs-tag">' +
							open +
							'</span><span class="ejs-expr">' +
							body +
							'</span><span class="ejs-tag">' +
							close +
							"</span>"
						: '<span class="ejs-tag">' +
							open +
							body +
							close +
							"</span>";
				ejsParts.push(html);
				return "\x00EJS" + (ejsParts.length - 1) + "\x00";
			},
		);
		escaped = highlightHtmlTags(escaped);
		// NUL bytes are safe sentinel delimiters here — they cannot appear in
		// textarea input, so there's no risk of accidentally matching real
		// content. eslint flags them as control characters in a regex, which
		// is the intended behavior.
		// eslint-disable-next-line no-control-regex
		var ejsPlaceholderRe = /\x00EJS(\d+)\x00/g;
		return (
			escaped.replace(ejsPlaceholderRe, function (m, idx) {
				return ejsParts[parseInt(idx, 10)];
			}) + "\n"
		);
	}

	function highlightHtml(text) {
		return highlightHtmlTags(escapeHtml(text)) + "\n";
	}

	function highlightJson(text) {
		return escapeHtml(text)
			.replace(
				/(")((?:[^"\\]|\\.)*)(")\s*:/g,
				'<span class="json-key">$1$2$3</span>:',
			)
			.replace(
				/: (")((?:[^"\\]|\\.)*)(")/g,
				': <span class="json-string">$1$2$3</span>',
			)
			.replace(
				/([[,]\s*)\n?\s*(")((?:[^"\\]|\\.)*)(")/g,
				'$1<span class="json-string">$2$3$4</span>',
			)
			.replace(
				/: (-?\d+\.?\d*)/g,
				': <span class="json-number">$1</span>',
			)
			.replace(/: (true|false)/g, ': <span class="json-bool">$1</span>')
			.replace(/: (null)/g, ': <span class="json-null">$1</span>')
			.replace(/([{}[\]])/g, '<span class="json-bracket">$1</span>');
	}

	function highlightMarkdown(text) {
		var s = escapeHtml(text);
		s = s.replace(/^(#{1,6}\s.*)$/gm, '<span class="md-heading">$1</span>');
		s = s.replace(/`([^`]+)`/g, '<span class="md-code">`$1`</span>');
		s = s.replace(/\*\*(.+?)\*\*/g, '<span class="md-bold">**$1**</span>');
		s = s.replace(
			/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
			'<span class="md-italic">*$1*</span>',
		);
		s = s.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'[<span class="md-link-text">$1</span>](<span class="md-link-url">$2</span>)',
		);
		s = s.replace(/^(\s*- )/gm, '<span class="md-list">$1</span>');
		return s + "\n";
	}

	function highlightLog(text) {
		var s = escapeHtml(text);
		s = s.replace(/\[(INFO|WARN|ERROR)\]/g, function (m, level) {
			var cls =
				level === "ERROR"
					? "log-error"
					: level === "WARN"
						? "log-warn"
						: "log-info";
			return '[<span class="' + cls + '">' + level + "</span>]";
		});
		s = s.replace(
			/(\d{4}-\d{2}-\d{2}T[\d:]+Z)/g,
			'<span class="log-timestamp">$1</span>',
		);
		s = s.replace(/\s([\w-]+):/g, ' <span class="log-service">$1</span>:');
		return s + "\n";
	}

	function highlightCsv(text) {
		var lines = text.split("\n");
		var result = [];
		for (var i = 0; i < lines.length; i++) {
			var line = escapeHtml(lines[i]);
			if (i === 0 && line) {
				line = '<span class="csv-header">' + line + "</span>";
			} else {
				line = line.replace(/,/g, '<span class="csv-delim">,</span>');
			}
			result.push(line);
		}
		return result.join("\n") + "\n";
	}

	function highlightEmail(text) {
		var s = escapeHtml(text);
		s = s.replace(
			/(https?:\/\/[^\s&]+)/g,
			'<span class="email-url">$1</span>',
		);
		s = s.replace(/(\$[\d,.]+)/g, '<span class="email-amount">$1</span>');
		s = s.replace(
			/^(\w[\w\s]*:)(?=\s)/gm,
			'<span class="email-label">$1</span>',
		);
		return s + "\n";
	}

	function highlightCli(text) {
		var s = escapeHtml(text);
		s = s.replace(
			/^([0-9a-f]{7,})\s/gm,
			'<span class="cli-hash">$1</span> ',
		);
		return s + "\n";
	}

	function highlightPlain(text) {
		return escapeHtml(text) + "\n";
	}

	var FORMAT_HIGHLIGHTERS = {
		html: highlightHtml,
		markdown: highlightMarkdown,
		log: highlightLog,
		email: highlightEmail,
		csv: highlightCsv,
		cli: highlightCli,
		plain: highlightPlain,
	};

	function detectFormat(text) {
		if (!text.trim()) return "plain";
		if (/^\[(?:INFO|WARN|ERROR|DEBUG)\]/m.test(text)) return "log";
		if (/^#{1,6}\s/m.test(text) || /\*\*.+\*\*/.test(text))
			return "markdown";
		var lines = text.split("\n").filter(function (l) {
			return l.trim();
		});
		if (
			lines.length > 1 &&
			lines.every(function (l) {
				return l.indexOf(",") !== -1;
			})
		)
			return "csv";
		if (
			/^[0-9a-f]{7,}\s/m.test(text) &&
			lines.every(function (l) {
				return /^[0-9a-f]{7,}\s/.test(l);
			})
		)
			return "cli";
		if (/^(Hi|Hello|Dear)\s/m.test(text)) return "email";
		if (/<[a-zA-Z][\s\S]*>/.test(text)) return "html";
		return "plain";
	}

	function formatBadgeText(fmt) {
		if (fmt === "cli") return "CLI";
		if (fmt === "csv") return "CSV";
		return fmt.charAt(0).toUpperCase() + fmt.slice(1);
	}

	// ── Examples registry ──────────────────────────────────────────

	var EXAMPLES = {
		html: {
			flexWs: true,
			types: '{\n  "price": "number",\n  "rating": "number"\n}',
			rendered:
				'<div class="product">\n' +
				"  <h1>Sony WH-1000XM5</h1>\n" +
				'  <span class="price">$348.00</span>\n' +
				'  <p class="description">Industry-leading noise canceling headphones</p>\n' +
				'  <div class="specs">\n' +
				'    <span class="brand">Sony</span>\n' +
				'    <span class="color">Black</span>\n' +
				'    <span class="rating">4.7</span>\n' +
				"  </div>\n" +
				'  <ul class="reviews">\n' +
				"    <li>\n" +
				"      <strong>Alice</strong>\n" +
				"      <span>Best headphones I've ever owned. The noise canceling is incredible.</span>\n" +
				"    </li>\n" +
				"    <li>\n" +
				"      <strong>Bob</strong>\n" +
				"      <span>Great sound quality, comfortable for long flights.</span>\n" +
				"    </li>\n" +
				"  </ul>\n" +
				"</div>",
			template:
				'<div class="product">\n' +
				"  <h1><%= name %></h1>\n" +
				'  <span class="price">$<%= price %></span>\n' +
				'  <p class="description"><%= description %></p>\n' +
				'  <div class="specs">\n' +
				'    <span class="brand"><%= specs.brand %></span>\n' +
				'    <span class="color"><%= specs.color %></span>\n' +
				'    <span class="rating"><%= specs.rating %></span>\n' +
				"  </div>\n" +
				'  <ul class="reviews">\n' +
				"    <% reviews.forEach(review => { %>\n" +
				"    <li>\n" +
				"      <strong><%= review.author %></strong>\n" +
				"      <span><%= review.text %></span>\n" +
				"    </li>\n" +
				"    <% }) %>\n" +
				"  </ul>\n" +
				"</div>",
		},
		markdown: {
			flexWs: false,
			rendered:
				"# My First Post\n\n" +
				"**Author:** Alice Chen\n" +
				"**Published:** 2026-04-10\n\n" +
				"A short post about reverse-ejs.\n\n" +
				"## Tags\n\n" +
				"- javascript\n- typescript\n- parsing\n",
			template:
				"# <%= title %>\n\n" +
				"**Author:** <%= author %>\n" +
				"**Published:** <%= date %>\n\n" +
				"<%= summary %>\n\n" +
				"## Tags\n\n" +
				"<% tags.forEach(tag => { %>- <%= tag %>\n<% }) %>",
		},
		log: {
			flexWs: false,
			rendered:
				"[INFO] 2026-04-10T16:58:00Z auth-service: user login successful\n" +
				"[WARN] 2026-04-10T16:59:30Z api-gateway: response time exceeded 2000ms\n" +
				"[ERROR] 2026-04-10T17:00:00Z api-gateway: upstream connection refused\n" +
				"[INFO] 2026-04-10T17:00:05Z scheduler: retry attempt 1 for job 4f92a\n",
			template:
				"<% lines.forEach(l => { %>[<%= l.level %>] <%= l.timestamp %> <%= l.service %>: <%= l.message %>\n<% }) %>",
		},
		email: {
			flexWs: false,
			types: '{\n  "qty": "number",\n  "price": "number",\n  "total": "number"\n}',
			rendered:
				"Hi Alice,\n\n" +
				"Your order #A-1234 has shipped!\n\n" +
				"  - 2x Widget ($9.99)\n" +
				"  - 1x Gadget ($24.50)\n\n" +
				"Total: $44.48\n\n" +
				"Tracking: https://ship.example.com/track/ZZ1234\n",
			template:
				"Hi <%= customer %>,\n\n" +
				"Your order <%= orderId %> has shipped!\n\n" +
				"<% items.forEach(item => { %>  - <%= item.qty %>x <%= item.name %> ($<%= item.price %>)\n" +
				"<% }) %>\nTotal: $<%= total %>\n\n" +
				"Tracking: <%= trackingUrl %>\n",
		},
		csv: {
			flexWs: false,
			types: '{\n  "score": "number"\n}',
			rendered: "Name,Score\nAlice,95\nBob,87\nCarol,72\n",
			template:
				"Name,Score\n<% rows.forEach(r => { %><%= r.name %>,<%= r.score %>\n<% }) %>",
		},
		cli: {
			flexWs: false,
			rendered:
				"abc1234 Fix authentication bug\n" +
				"def5678 Add CSV export feature\n" +
				"9012345 Bump dependencies\n",
			template:
				"<% commits.forEach(c => { %><%= c.hash %> <%= c.message %>\n<% }) %>",
		},
		store: {
			flexWs: true,
			types: '{\n  "price": "number",\n  "rating": "number",\n  "cartCount": "number",\n  "year": "number"\n}',
			partials:
				'{\n  "header": "<header><h1><%= storeName %></h1><p class=\\"tagline\\"><%= tagline %></p><nav><a href=\\"<%= cartUrl %>\\">Cart (<%= cartCount %>)</a></nav></header>",\n  "footer": "<footer><p>&copy; <%= year %> <%= brand %> &mdash; <%= footerNote %></p></footer>"\n}',
			rendered:
				"<!DOCTYPE html>\n<html>\n<body>\n" +
				"<header>\n  <h1>TechStore</h1>\n" +
				'  <p class="tagline">Best deals on electronics</p>\n' +
				'  <nav><a href="/cart">Cart (3)</a></nav>\n</header>\n' +
				"<main>\n  <h2>Weekend Deals</h2>\n" +
				'  <div class="product-grid">\n' +
				'    <article class="product-card">\n' +
				'      <img src="/img/keyboard.jpg" alt="Mechanical Keyboard">\n' +
				"      <h2>Mechanical Keyboard</h2>\n" +
				'      <span class="badge">New</span>\n' +
				"      <p>Cherry MX Brown switches, RGB backlit</p>\n" +
				'      <div class="rating">4.8/5 stars</div>\n' +
				'      <span class="price">$99</span>\n' +
				"    </article>\n" +
				'    <article class="product-card">\n' +
				'      <img src="/img/monitor.jpg" alt="4K Monitor">\n' +
				"      <h2>4K Monitor</h2>\n" +
				'      <span class="badge">Best Seller</span>\n' +
				"      <p>27-inch IPS, 144Hz, HDR600</p>\n" +
				'      <div class="rating">4.6/5 stars</div>\n' +
				'      <span class="price">$379</span>\n' +
				"    </article>\n" +
				'    <article class="product-card">\n' +
				'      <img src="/img/mouse.jpg" alt="Wireless Mouse">\n' +
				"      <h2>Wireless Mouse</h2>\n" +
				'      <span class="badge">50% Off</span>\n' +
				"      <p>Ergonomic design, 20K DPI sensor</p>\n" +
				'      <div class="rating">4.3/5 stars</div>\n' +
				'      <span class="price">$40</span>\n' +
				"    </article>\n" +
				"  </div>\n</main>\n" +
				"<footer>\n  <p>&copy; 2026 TechStore &mdash; Free shipping over $50</p>\n</footer>\n" +
				"</body>\n</html>",
			template:
				"<!DOCTYPE html>\n<html>\n<body>\n" +
				'<%- include("header") %>\n' +
				"<main>\n  <h2><%= sectionTitle %></h2>\n" +
				'  <div class="product-grid">\n' +
				"    <% products.forEach(p => { %>\n" +
				'    <article class="product-card">\n' +
				'      <img src="<%= p.image %>" alt="<%= p.name %>">\n' +
				"      <h2><%= p.name %></h2>\n" +
				'      <span class="badge"><%= p.badge %></span>\n' +
				"      <p><%= p.description %></p>\n" +
				'      <div class="rating"><%= p.rating %>/5 stars</div>\n' +
				'      <span class="price">$<%= p.price %></span>\n' +
				"    </article>\n    <% }) %>\n" +
				"  </div>\n</main>\n" +
				'<%- include("footer") %>\n' +
				"</body>\n</html>",
		},
	};

	// ── Analytics helpers (module scope) ───────────────────────────

	var trackedOnce = {};

	function track(name, title) {
		if (window.goatcounter && window.goatcounter.count) {
			window.goatcounter.count({
				path: name,
				title: title || name,
				event: true,
			});
		}
	}

	function trackOnce(name, title) {
		if (trackedOnce[name]) return;
		trackedOnce[name] = true;
		track(name, title);
	}

	// ── Alpine component factory ───────────────────────────────────

	document.addEventListener("alpine:init", function () {
		window.Alpine.data("playground", function () {
			return {
				// ── State ──────────────────────────────────────────
				rendered: "",
				template: "",
				format: "html",
				options: {
					flexWs: true,
					rmWs: false,
					safe: false,
					silent: false,
					autoRun: false,
					delimiter: "%",
					openDelim: "<",
					closeDelim: ">",
					partials: "",
					types: "",
				},
				optionsOpen: false,
				outputHtml: "",
				outputText: "",
				statusText: "",
				statusKind: "",
				copyState: "",

				_urlTimer: null,
				_autoRunTimer: null,

				// ── Computed highlights (x-html consumers) ────────
				get renderedOverlayHtml() {
					var fn = FORMAT_HIGHLIGHTERS[this.format] || highlightHtml;
					return fn(this.rendered);
				},
				get templateOverlayHtml() {
					return highlightEjs(this.template);
				},
				get partialsOverlayHtml() {
					return highlightJson(this.options.partials);
				},
				get typesOverlayHtml() {
					return highlightJson(this.options.types);
				},

				get formatBadge() {
					return formatBadgeText(this.format);
				},

				get copyLabel() {
					if (this.copyState === "copied") return "Copied!";
					if (this.copyState === "failed") return "Failed";
					return "Copy";
				},

				// ── Lifecycle ──────────────────────────────────────
				init() {
					this.loadStateFromUrl();
					this.attachKeyboard();
					this.attachLinkTracking();
				},

				// ── Input handlers (textareas) ────────────────────
				onRenderedInput() {
					trackOnce("type-rendered", "Typed in Rendered HTML");
					this.format = detectFormat(this.rendered);
					this.autoRun();
				},
				onTemplateInput() {
					trackOnce("type-template", "Typed in Template");
					this.autoRun();
				},
				onPartialsInput() {
					trackOnce("opt-partials-used", "partials option used");
					this.autoRun();
				},
				onTypesInput() {
					trackOnce("opt-types-used", "types option used");
					this.autoRun();
				},

				// Scroll-sync for highlight overlays.
				syncScroll(ev, refName) {
					var overlay = this.$refs[refName];
					if (!overlay) return;
					overlay.firstElementChild.style.transform =
						"translate(0," + -ev.target.scrollTop + "px)";
				},

				// ── Option handlers ───────────────────────────────
				onCheckboxChange(key) {
					var labels = {
						flexWs: "flexibleWhitespace",
						rmWs: "rmWhitespace",
						safe: "safe",
						silent: "silent",
					};
					if (labels[key]) {
						var on = this.options[key];
						track(
							"opt-" + key + "-" + (on ? "on" : "off"),
							labels[key] + " " + (on ? "enabled" : "disabled"),
						);
					}
					this.autoRun();
				},
				onDelimiterChange(key, defaultValue) {
					if (this.options[key] !== defaultValue) {
						trackOnce(
							"opt-" + key + "-changed",
							key + " changed from default",
						);
					}
					this.autoRun();
				},
				onAutoRunChange() {
					this.saveStateToUrl();
				},

				toggleOptions() {
					this.optionsOpen = !this.optionsOpen;
					track(
						this.optionsOpen ? "options-opened" : "options-closed",
						this.optionsOpen
							? "Options panel opened"
							: "Options panel closed",
					);
				},

				// ── Build runtime options object for reverseEjs() ─
				getRuntimeOptions() {
					var opts = {};
					if (this.options.flexWs) opts.flexibleWhitespace = true;
					if (this.options.rmWs) opts.rmWhitespace = true;
					if (this.options.safe) opts.safe = true;
					if (this.options.silent) opts.silent = true;
					if (this.options.delimiter !== "%")
						opts.delimiter = this.options.delimiter;
					if (this.options.openDelim !== "<")
						opts.openDelimiter = this.options.openDelim;
					if (this.options.closeDelim !== ">")
						opts.closeDelimiter = this.options.closeDelim;
					var p = this.options.partials.trim();
					if (p) {
						try {
							opts.partials = JSON.parse(p);
						} catch (e) {
							throw new Error(
								"Invalid partials JSON: " + e.message,
								{ cause: e },
							);
						}
					}
					var t = this.options.types.trim();
					if (t) {
						try {
							opts.types = JSON.parse(t);
						} catch (e) {
							throw new Error(
								"Invalid types JSON: " + e.message,
								{ cause: e },
							);
						}
					}
					return opts;
				},

				// ── Core: extract ─────────────────────────────────
				extract(source) {
					if (!this.template || !this.rendered) {
						this.statusKind = "err";
						this.statusText = "Both fields are required";
						this.outputHtml = "";
						this.outputText = "";
						track(
							"extract-empty",
							"Extract clicked with empty fields",
						);
						return;
					}
					try {
						var opts = this.getRuntimeOptions();
						var result = window.ReverseEjs.reverseEjs(
							this.template,
							this.rendered,
							opts,
						);
						if (result === null) {
							this.outputText = "null";
							this.outputHtml = "null";
							this.statusKind = "err";
							this.statusText = "No match (safe mode)";
							track(
								"extract-safe-null",
								"Safe mode returned null (" +
									(source || "click") +
									")",
							);
							return;
						}
						var pretty = JSON.stringify(result, null, 2);
						this.outputText = pretty;
						this.outputHtml = highlightJson(pretty);
						this.statusKind = "ok";
						this.statusText =
							"Extracted " +
							Object.keys(result).length +
							" top-level keys";
						track(
							"extract-success",
							"Extraction succeeded (" +
								(source || "click") +
								")",
						);
					} catch (e) {
						this.statusKind = "err";
						this.statusText = "Error";
						this.outputText = e.message;
						this.outputHtml = escapeHtml(e.message);
						track(
							"extract-error",
							"Extraction failed (" + (source || "click") + ")",
						);
					}
				},

				onExtractClick() {
					track("extract-clicked", "Extract button clicked");
					this.extract("click");
				},

				// ── Examples ──────────────────────────────────────
				// `opts.silent` is used by the default-on-bare-URL path: it
				// suppresses analytics noise and skips writing query params,
				// so the URL stays clean for visitors landing on `/`.
				loadExample(key, opts) {
					var ex = EXAMPLES[key];
					if (!ex) return;
					var silent = opts && opts.silent;
					this.rendered = ex.rendered;
					this.template = ex.template;
					this.options.flexWs = !!ex.flexWs;
					this.options.types = ex.types || "";
					this.options.partials = ex.partials || "";
					if (ex.partials || ex.types) this.optionsOpen = true;
					this.format = detectFormat(ex.rendered);
					if (!silent) {
						track("example-" + key, "Loaded " + key + " example");
					}
					this.extract(silent ? "default" : "example-" + key);
					if (!silent) this.saveStateToUrl();
				},

				// ── Reset ─────────────────────────────────────────
				reset() {
					this.rendered = "";
					this.template = "";
					this.options = {
						flexWs: true,
						rmWs: false,
						safe: false,
						silent: false,
						autoRun: false,
						delimiter: "%",
						openDelim: "<",
						closeDelim: ">",
						partials: "",
						types: "",
					};
					this.outputHtml = "";
					this.outputText = "";
					this.statusText = "";
					this.statusKind = "";
					this.optionsOpen = false;
					this.format = "html";
					this.saveStateToUrl();
					track("reset", "Playground reset");
				},

				// ── Copy button ───────────────────────────────────
				copy() {
					var text = this.outputText;
					if (!text) {
						track(
							"copy-button-empty",
							"Copy clicked with empty result",
						);
						return;
					}
					var done = () => {
						track("copy-button-success", "Copy button succeeded");
						this.copyState = "copied";
						setTimeout(() => {
							this.copyState = "";
						}, 1500);
					};
					var fail = () => {
						track("copy-button-error", "Copy button failed");
						this.copyState = "failed";
						setTimeout(() => {
							this.copyState = "";
						}, 1500);
					};
					if (navigator.clipboard && navigator.clipboard.writeText) {
						navigator.clipboard
							.writeText(text)
							.then(done)
							.catch(fail);
					} else {
						try {
							var ta = document.createElement("textarea");
							ta.value = text;
							ta.style.position = "fixed";
							ta.style.opacity = "0";
							document.body.appendChild(ta);
							ta.select();
							document.execCommand("copy");
							document.body.removeChild(ta);
							done();
						} catch {
							fail();
						}
					}
				},

				// ── Auto-run (debounced) ──────────────────────────
				autoRun() {
					this.saveStateToUrl();
					if (!this.options.autoRun) return;
					clearTimeout(this._autoRunTimer);
					this._autoRunTimer = setTimeout(() => {
						this.extract("auto");
					}, 300);
				},

				// ── URL state sync ────────────────────────────────
				saveStateToUrl() {
					clearTimeout(this._urlTimer);
					this._urlTimer = setTimeout(() => {
						var p = new URLSearchParams();
						if (this.rendered) p.set("rendered", this.rendered);
						if (this.template) p.set("template", this.template);
						if (!this.options.flexWs) p.set("flexWs", "0");
						if (this.options.rmWs) p.set("rmWs", "1");
						if (this.options.safe) p.set("safe", "1");
						if (this.options.silent) p.set("silent", "1");
						if (this.options.autoRun) p.set("autoRun", "1");
						if (this.format !== "html")
							p.set("format", this.format);
						if (this.options.delimiter !== "%")
							p.set("delimiter", this.options.delimiter);
						if (this.options.openDelim !== "<")
							p.set("openDelim", this.options.openDelim);
						if (this.options.closeDelim !== ">")
							p.set("closeDelim", this.options.closeDelim);
						if (this.options.partials.trim())
							p.set("partials", this.options.partials);
						if (this.options.types.trim())
							p.set("types", this.options.types);
						var qs = p.toString();
						history.replaceState(
							null,
							"",
							qs ? "?" + qs : window.location.pathname,
						);
					}, 400);
				},

				loadStateFromUrl() {
					var p = new URLSearchParams(window.location.search);
					var exampleParam = p.get("example");
					if (
						exampleParam &&
						EXAMPLES[exampleParam] &&
						!p.has("rendered") &&
						!p.has("template")
					) {
						this.loadExample(exampleParam);
						return;
					}
					if (!p.has("rendered") && !p.has("template")) {
						// Fresh visit with no template/rendered in the URL —
						// preload the HTML example so the playground isn't
						// blank, but keep the URL clean and don't fire the
						// example-loaded analytics event.
						this.loadExample("html", { silent: true });
						return;
					}

					this.rendered = p.get("rendered") || "";
					this.template = p.get("template") || "";
					this.options.flexWs = p.get("flexWs") !== "0";
					this.options.rmWs = p.get("rmWs") === "1";
					this.options.safe = p.get("safe") === "1";
					this.options.silent = p.get("silent") === "1";
					this.options.autoRun = p.get("autoRun") === "1";
					if (p.has("delimiter"))
						this.options.delimiter = p.get("delimiter");
					if (p.has("openDelim"))
						this.options.openDelim = p.get("openDelim");
					if (p.has("closeDelim"))
						this.options.closeDelim = p.get("closeDelim");
					this.options.partials = p.get("partials") || "";
					this.options.types = p.get("types") || "";

					if (
						this.options.partials ||
						this.options.types ||
						this.options.rmWs ||
						this.options.safe ||
						this.options.silent
					) {
						this.optionsOpen = true;
					}
					this.format = detectFormat(this.rendered);
					this.extract("url");
				},

				// ── Global listeners attached in init ─────────────
				attachKeyboard() {
					document.addEventListener("keydown", (e) => {
						if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
							e.preventDefault();
							track(
								"extract-shortcut",
								"Extract via Ctrl/Cmd+Enter",
							);
							this.extract("shortcut");
						}
					});
				},
				attachLinkTracking() {
					var links = document.querySelectorAll(".links a, footer a");
					for (var j = 0; j < links.length; j++) {
						(function (link) {
							link.addEventListener("click", function () {
								var label =
									link.textContent.trim() || link.href;
								track(
									"link-" +
										label
											.toLowerCase()
											.replace(/\s+/g, "-"),
									"Clicked: " + label,
								);
							});
						})(links[j]);
					}
				},

				// ── Tracking pass-throughs for inline @events ─────
				onPasteRendered() {
					track("paste-rendered", "Pasted into Rendered HTML");
				},
				onPasteTemplate() {
					track("paste-template", "Pasted into Template");
				},
				onFocusRendered() {
					trackOnce("focus-rendered", "Focused Rendered HTML");
				},
				onFocusTemplate() {
					trackOnce("focus-template", "Focused Template");
				},
				onOutputCopy() {
					track("copy-result", "Copied result");
				},
				onOutputMouseDown() {
					trackOnce("select-result", "Selected result");
				},
			};
		});
	});
})();
