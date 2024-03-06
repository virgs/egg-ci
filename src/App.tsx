import { useEffect, useRef } from 'react';
import './App.css';
import { NavBarComponent } from './components/NavBarComponent';
import { initializeCircleCiClient } from './gateway/CircleCiClient';
import { DashboardsPage } from './pages/DashboardsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SettingsRepository } from './settings/SettingsRepository';

import { RouterProvider, createHashRouter } from 'react-router-dom';

//ghpage doesnt work with browser router: https://stackoverflow.com/a/71985764
const router = createHashRouter([
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
      <NavBarComponent />
      <div id='app' className='container py-2'>
        <RouterProvider router={router} />
      </div>
    </>
  )
}
