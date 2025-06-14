import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/AuthStore";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import Inbox from "./pages/Inbox";
import CalendarPage from "./pages/CalendarPage";
import NotificationPage from "./pages/NotificationPage";
import UsersPage from "./pages/UsersPage";

//project detail pages
import ProjectsPage from "./pages/ProjectsPage";
import DesignerProjectsPage from "./pages/DesignerProjectsPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import AdminProjectsPage from "./pages/AdminProjectsPage";

//tab content components
import TasksTab from "./components/projectdetails/TasksTab";
import ProgressTab from "./components/projectdetails/ProgressTab";
import TimelineTab from "./components/projectdetails/TimelineTab";
import FilesTab from "./components/projectdetails/FilesTab";
import ProjectUpdateTab from "./components/projectdetails/ProjectUpdateTab";
import ProjectOverviewTab from "./components/projectdetails/ProjectOverviewTab";
import MaterialsTab from "./components/projectdetails/MaterialsTab";

//materials
import MaterialsPage from "./pages/MaterialsPage";
import MaterialDetailsPage from "./pages/MaterialDetailsPage";
//material list
import MaterialList from "./components/materials/MaterialList";

//utils
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  useEffect(() => {
    useAuthStore.getState().rehydrate();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/*  Login and Signup */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LoginPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectedRoute>
              <SignupPage />
            </ProtectedRoute>
          }
        />

        {/* layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="inbox" element={<Inbox />} />
          <Route
            path="notification"
            element={
              <ProtectedRoute>
                <NotificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          {/* projects */}
          <Route
            path="projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetailsPage />
              </ProtectedRoute>
            }
          >
            <Route
              path="overview"
              element={
                <ProtectedRoute>
                  <ProjectOverviewTab />
                </ProtectedRoute>
              }
            />
            <Route
              path="tasks"
              element={
                <ProtectedRoute>
                  <TasksTab />
                </ProtectedRoute>
              }
            />
            <Route
              path="progress"
              element={
                <ProtectedRoute>
                  <ProgressTab />
                </ProtectedRoute>
              }
            />
            <Route
              path="timeline"
              element={
                <ProtectedRoute>
                  <TimelineTab />
                </ProtectedRoute>
              }
            />
            <Route
              path="files"
              element={
                <ProtectedRoute>
                  <FilesTab />
                </ProtectedRoute>
              }
            />
            <Route
              path="update"
              element={
                <ProtectedRoute>
                  <ProjectUpdateTab />
                </ProtectedRoute>
              }
            />
            <Route
              path="material"
              element={
                <ProtectedRoute>
                  <MaterialsTab />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* materials */}
          <Route
            path="materials"
            element={
              <ProtectedRoute>
                <MaterialsPage />
              </ProtectedRoute>
            }
          >
            <Route
              path="items"
              element={
                <ProtectedRoute>
                  <MaterialList />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute>
                  <MaterialDetailsPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/add-user"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
