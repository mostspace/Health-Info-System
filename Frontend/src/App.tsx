import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeAuth } from './features/auth/authInit';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Client from './pages/Client';
import NewClient from './pages/Register';
// import EditClient from './pages/EditClient';
// import ClientPrograms from './pages/ClientPrograms';
import Home from './pages/Home';
import ProgramManagement from './pages/Program';
// import MyPrograms from './pages/MyPrograms';
import Dashboard from './pages/Dashboard';
import { Footer } from './components/Footer';

function App() {
    useEffect(() => {
        initializeAuth();
    }, []);

    return (
        <Provider store={store}>
            <Router>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <div className="sticky top-0 z-50">
                        <Navbar />
                    </div>
                    <main className="flex-1 max-w-7xl mx-auto w-full py-6 sm:px-6 lg:px-8">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/clients"
                                element={
                                    <ProtectedRoute>
                                        <Client />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/clients/new"
                                element={
                                    <ProtectedRoute>
                                        <NewClient />
                                    </ProtectedRoute>
                                }
                            />
                            {/* <Route
                                path="/clients/edit/:userId"
                                element={
                                    <ProtectedRoute>
                                        <EditClient />
                                    </ProtectedRoute>
                                }
                            /> */}
                            {/* <Route
                                path="/clients/programs/:userId"
                                element={
                                    <ProtectedRoute>
                                        <ClientPrograms />
                                    </ProtectedRoute>
                                }
                            /> */}
                            <Route 
                                path="/programs"
                                element={
                                    <ProtectedRoute>
                                        <ProgramManagement />
                                    </ProtectedRoute>
                                }
                            />
                            {/* <Route
                                path="/my-programs"
                                element={
                                    <ProtectedRoute>
                                        <MyPrograms />
                                    </ProtectedRoute>
                                }
                            /> */}
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </Provider>
    );
}

export default App;