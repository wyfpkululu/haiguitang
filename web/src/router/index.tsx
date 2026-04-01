import { Navigate, Route, Routes } from 'react-router-dom'
import { Game } from '../pages/Game'
import { Home } from '../pages/Home'
import { Result } from '../pages/Result'

/**
 * 应用路由配置。
 * @returns {React.ReactNode}
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:id" element={<Game />} />
      <Route path="/result/:storyId" element={<Result />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
