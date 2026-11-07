import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Products from "./pages/Products";

function App() {
  return (
    <Routes>
      {/* Public pages: no sidebar */}
      <Route path="/login" element={<div className="public"><Login /></div>} />
      <Route path="/signup" element={<div className="public"><Signup /></div>} />

      {/* Protected pages: login required, shown inside the sidebar layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Products />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;