window.require = {
	baseUrl: './js/built/',
	waitSeconds: 15,
};

if(window.location.hostname.match('localhost')) {
	// Only in development
	window.require.urlArgs = 'bust=' + new Date().getTime();
}