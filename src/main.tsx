import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/i18n'

const redirectPath = new URLSearchParams(window.location.search).get('redirect')

if (redirectPath?.startsWith('/') && !redirectPath.startsWith('//')) {
	const query = new URLSearchParams(window.location.search)
	query.delete('redirect')

	const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
	const restoredPath = `${basePath}${redirectPath}`
	const restoredQuery = query.toString()
	window.history.replaceState(
		null,
		'',
		`${restoredPath}${restoredQuery ? `?${restoredQuery}` : ''}${window.location.hash}`,
	)
}

createRoot(document.getElementById("root")!).render(<App />);
