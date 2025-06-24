import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage     from './pages/LoginPage';
import UserTaskPage  from './pages/UserTaskPage';
import AdminPage     from './pages/AdminPage';
import VerifyPage    from './pages/VerifyPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/"        element={<LoginPage />} />
      <Route path="/tasks"   element={<UserTaskPage />} />
      <Route path="/admin"   element={<AdminPage />} />
      <Route path="/verify"  element={<VerifyPage />} />
    </Routes>
  </BrowserRouter>
);
