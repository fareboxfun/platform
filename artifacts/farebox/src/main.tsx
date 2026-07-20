import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// Point all API calls to the production API server
setBaseUrl('https://api.farebox.fun');

createRoot(document.getElementById('root')!).render(<App />);
