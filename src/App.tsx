import { BrowserRouter, Routes, Link, Route } from "react-router-dom"
import CreateEvent from "./CreateEvent"
import AllEvents from "./AllEvents"
import Navbar from "./components/Navbar"

export const App = () => {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<CreateEvent />} />
                <Route path="/events" element={<AllEvents />} />
                <Route path="*" element={<div>Page not found</div>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
