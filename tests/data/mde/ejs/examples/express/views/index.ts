export default {
	"compiledEjsTemplates": {
		"helloTemplate": "function(locals, escapeFn, include, rethrow) { return '<h1>Hello, ' + (locals.name || 'World') + '!</h1>' + (include ? include('messageTemplate', {person: locals.name || 'World'}) : ''); }",
		"messageTemplate": "function(locals) { return '<p>' + (locals.person || 'Someone') + ' just learned ' + (locals.fact || 'something') + '.</p>'; }"
	}
};
