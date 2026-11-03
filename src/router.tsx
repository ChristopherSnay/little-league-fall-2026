import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import { PlayerSectionRoute } from './components/PlayerSectionRoute';
import { Glossary } from './sections/Glossary';
import { NotFound } from './sections/NotFound';
import { Overview } from './sections/Overview';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: 'overview', element: <Overview /> },
      { path: 'batting', element: <PlayerSectionRoute section="batting" /> },
      { path: 'pitching', element: <PlayerSectionRoute section="pitching" /> },
      { path: 'fielding', element: <PlayerSectionRoute section="fielding" /> },
      { path: 'players', element: <PlayerSectionRoute section="players" /> },
      { path: 'glossary', element: <Glossary /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
