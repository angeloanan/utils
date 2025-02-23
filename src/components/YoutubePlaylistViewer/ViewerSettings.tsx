import { createContext, type ParentComponent } from 'solid-js'
import { createStore, type SetStoreFunction } from 'solid-js/store'

type ViewerSettings = {
  accessToken?: string
}
export const SettingsContext = createContext<{
  settings: ViewerSettings
  updateSettings: SetStoreFunction<ViewerSettings>
}>()

export const Provider: ParentComponent = (props) => {
  const [state, setState] = createStore<ViewerSettings>({})

  return (
    <SettingsContext.Provider value={{ settings: state, updateSettings: setState }}>
      {props.children}
    </SettingsContext.Provider>
  )
}
