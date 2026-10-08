import * as Pinia from 'pinia'

export function setupStore(app) {
  const pinia = Pinia.createPinia()
  app.use(pinia)
  return pinia
}

export { Pinia }
