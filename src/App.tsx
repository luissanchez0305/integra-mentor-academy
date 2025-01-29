import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
import CourseDetail from './pages/CourseDetail';
import CourseVideo from './pages/CourseVideo';
import Cart from './pages/Cart';
import CreateCourse from './pages/CreateCourse';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/course/:id/learn" element={<CourseVideo />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/create-course" element={<CreateCourse />} />
            <Route path="/create-course/:id?" element={<CreateCourse />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}