import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./modules/Dashboard/Dashboard";
import Form from "./modules/Form/Form";

const ProtectedRoutes = ({ children, auth = false }) => {
  const isLoggedIn = localStorage.getItem("user:token") !== null || false;

  if (!isLoggedIn && auth) {
    return <Navigate to={"/users/sign_in"} />;
  } else if (
    isLoggedIn &&
    ["/users/sign_in", "/users/sign_up"].includes(window.location.pathname)
  ) {
    return <Navigate to={"/"} />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#e1edff] h-screen flex justify-center items-center">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoutes auth={true}>
                <Dashboard />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/users/sign_in"
            element={
              <ProtectedRoutes>
                <Form isSignIn={true} />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/users/sign_up"
            element={
              <ProtectedRoutes>
                <Form isSignIn={false} />
              </ProtectedRoutes>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
