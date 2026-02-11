import { BrowserRouter, Route, Routes } from "react-router-dom"
import AllEvents from "./AllEvents"
import CreateEvent from "./CreateEvent"
import Navbar from "./components/Navbar"
import EditEvent from "./EditEvent"

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
