import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout/MainLayout";
import PublicRoute from "./components/auth/PublicRoute/PublicRoute";



import Home from "./pages/Home/Home";
import Messages from "./pages/Messages/Messages";
import Bookmarks from "./pages/Bookmarks/Bookmarks";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute/ProtectedRoute";
import PublicProfile from "./pages/PublicProfile/PublicProfile";
import PostDetails from "./pages/PostDetails/PostDetails";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        </Route>
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/post/:postId" element={<PostDetails />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<PublicProfile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
