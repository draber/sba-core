window.addEventListener('load', () => {
	const el = document.createElement('script');
	el.async = true;
	el.src = chrome.runtime.getURL('{{sbaFileName}}');
	el.id = '{{name}}';
	setTimeout(() => {
		document.body.append(el);
	}, 1500)
})