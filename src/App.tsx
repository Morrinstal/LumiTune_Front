import { Routes, Route, Navigate } from "react-router-dom";
import LoginSite from "./components/loginSite/LoginSite";
import Registration from "./components/registration/Registration";
import MainPage from "./components/MainPage/MainPage";
import CreatePassword from "./components/createPassword/CreatePassword";
import LandingPage from './components/LandingPage/LandingPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/start" replace />} />
      <Route path="/login" element={<LoginSite />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/forgot-password" element={<CreatePassword />} />
      <Route path="/start" element={<LandingPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}