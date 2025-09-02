import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';

export const router = createBrowserRouter(routes);

// Export navigation helpers
export { useNavigate, useLocation, useParams, Link, NavLink } from 'react-router-dom';