import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import Beds from '../pages/Beds';
import Equipment from '../pages/Equipment';
import Rooms from '../pages/Rooms';
import ActivityLog from '../pages/ActivityLog';
import Login from '../pages/Login';
import Register from '../pages/Register';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/beds" element={
        <ProtectedRoute>
          <Beds />
        </ProtectedRoute>
      } />
      
      <Route path="/equipment" element={
        <ProtectedRoute>
          <Equipment />
        </ProtectedRoute>
      } />
      
      <Route path="/rooms" element={
        <ProtectedRoute>
          <Rooms />
        </ProtectedRoute>
      } />
      
      <Route path="/logs" element={
        <ProtectedRoute>
          <ActivityLog />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
