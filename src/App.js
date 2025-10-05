import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/home/Home";
import News from "./pages/news/News";
import RumorsLies from "./pages/rumorslies/RumorsLies";
import Contact from "./pages/contact/Contact";
import Shop from "./pages/shop/Shop";
import Subscribe from "./pages/subscribe/Subscribe";
import AdminLogin from "./pages/adminlogin/AdminLogin";
import ReelInfo from "./pages/reelinfo/ReelInfo";
import AdminDashboard from "./pages/admindashboard/AdminDashboard";
import Exhibitions from "./pages/exhibitions/Exhibitions";
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
          <Route path="/shop" element={<Shop />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/reelinfo" element={<ReelInfo />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
