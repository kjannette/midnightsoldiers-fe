 import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import Home from "./pages/home/Home";
import News from "./pages/news/News";
import RumorsLies from "./pages/rumorslies/RumorsLies";
import Contact from "./pages/contact/Contact";
import Subscribe from "./pages/subscribe/Subscribe";
import ReelLogin from "./pages/reellogin/ReelLogin";
import VideoInfo from "./pages/videoinfo/VideoInfo";
import ToS from "./pages/tos/ToS";
import Privacy from "./pages/privacy/Privacy";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/rumors-lies" element={<RumorsLies />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/tos" element={<ToS />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/reellogin" element={<ReelLogin />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/videoinfo" element={<VideoInfo />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
