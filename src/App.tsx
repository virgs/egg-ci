import './App.css'
import { NavBar } from './components/NavBar'
import { SettingsPage } from './pages/SettingsPage'

export const App = (): JSX.Element => {
  return (
    <>
      <NavBar></NavBar>
      <div id='app' className='container'>
        <SettingsPage></SettingsPage>
      </div>
    </>
  )
}
