import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import AllEvents from "./AllEvents"
import CreateEvent from "./CreateEvent"
import Navbar from "./components/Navbar"
import EditEvent from "./EditEvent"
import Login from "./Login"
import { UserProvider, useUser } from "./providers/UserProvider"

function ProtectedLayout() {
    const { user, isLoading } = useUser()

    if (isLoading) return <p>Loading...</p>

    if (!user) return <Navigate to="/login" replace />

    return (
        <>
            <Navbar />
            <Outlet />
        </>
    )
}

export const App = () => {
    return (
        <BrowserRouter>
            <UserProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedLayout />}>
                        <Route path="/" element={<CreateEvent />} />
                        <Route path="/events" element={<AllEvents />} />
                        <Route path="/events/:id/edit" element={<EditEvent />} />
                    </Route>

                    <Route path="*" element={<div>Page not found</div>} />
                </Routes>
            </UserProvider>
        </BrowserRouter>
    )
}

export default App
