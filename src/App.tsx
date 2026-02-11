import { BrowserRouter, Routes, Route } from "react-router-dom"
import CreateEvent from "./CreateEvent"
import AllEvents from "./AllEvents"
import EditEvent from "./EditEvent"
import Navbar from "./components/Navbar"

export const App = () => {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<CreateEvent />} />
                <Route path="/events" element={<AllEvents />} />
                <Route path="/events/:id/edit" element={<EditEvent />} />
                <Route path="*" element={<div>Page not found</div>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
