import React from 'react';
import logo from './logo.svg';
import './App.css';
import Village from './features/village/ManageVillage';
import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from './app/layout/Header';


function App() {
  return (
    <><Header  />
    <Container>
      <Outlet />
    </Container></>
  );
}

export default App;
