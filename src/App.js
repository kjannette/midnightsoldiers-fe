import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Artists from "./pages/Artists";
import News from "./pages/News";
import RumorsLies from "./pages/RumorsLies";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import Subscribe from "./pages/Subscribe";
import AdminLogin from "./pages/AdminLogin";
import ArtistInfo from "./pages/ArtistInfo";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/news" element={<News />} />
          <Route path="/rumors-lies" element={<RumorsLies />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/artistinfo" element={<ArtistInfo />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
