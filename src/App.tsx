import './App.css';
import { NavBarComponent } from './components/NavBarComponent';
import { initializeCircleCiClient } from './gateway/CircleCiClient';
import { DashboardsPage } from './pages/DashboardsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SettingsRepository } from './settings/SettingsRepository';

import { RouterProvider, createHashRouter } from 'react-router-dom';

const router = createHashRouter([
  //ghpage doesnt work with browser router: https://stackoverflow.com/a/71985764
  {
    path: '/settings',
    element: (
      <>
        <SettingsPage />
      </>
    ),
  },
  {
    path: '/*',
    element: (
      <>
        <DashboardsPage />
      </>
    ),
  },
])

const settingsRepository: SettingsRepository = new SettingsRepository();
if (settingsRepository.getApiToken()) {
  initializeCircleCiClient(settingsRepository.getApiToken()!)
}

export const App = (): JSX.Element => {
  return (
    <>
      <NavBarComponent></NavBarComponent>
      <div id='app' className='container'>
        <RouterProvider router={router} />
      </div>
    </>
  )
}
