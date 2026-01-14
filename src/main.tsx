import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// context provider
import { ThemeProvider } from './context/theme-provider'
import { FontProvider } from './context/font-provider'
import { DirectionProvider } from './context/direction-provider'
import { SidebarProvider } from './components/ui/sidebar'
import { AxiosError } from 'axios'
import { LayoutProvider } from './context/layout-provider'
import { SearchProvider } from './context/search-provider'
import AppRoutes from './routes/AppRoutes'
import './styles/index.css'

// --- React Query Setup ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) console.log({ failureCount, error })
        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10000,
    },
  },
})

// --- Render App ---
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <BrowserRouter>
                <LayoutProvider>
                  <SidebarProvider>
                    <SearchProvider>
                      <AppRoutes />
                    </SearchProvider>
                  </SidebarProvider>
                </LayoutProvider>
              </BrowserRouter>
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
