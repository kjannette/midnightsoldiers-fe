 import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/home/Home";
import News from "./pages/news/News";
import RumorsLies from "./pages/rumorslies/RumorsLies";
import Contact from "./pages/contact/Contact";
import Subscribe from "./pages/subscribe/Subscribe";
import AdminDashboard from "./pages/admindashboard/AdminDashboard";
import Exhibitions from "./pages/exhibitions/Exhibitions";
import ReelLogin from "./pages/reellogin/ReelLogin";
import VideoInfo from "./pages/videoinfo/VideoInfo";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/news" element={<News />} />
          <Route path="/rumors-lies" element={<RumorsLies />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/reellogin" element={<ReelLogin />} />
          <Route path="/videoinfo" element={<VideoInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
