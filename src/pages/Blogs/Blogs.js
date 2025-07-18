import React, { useContext } from 'react';
import UserContext from '../../context/UserContext';
import UserView from '../../Components/UserView/UserView'; 
import AdminView from '../../Components/AdminView/AdminView'

export default function Blogs() {
  const { user } = useContext(UserContext); 

  if (!user) {
    return <div>Please log in to view blogs.</div>; 
  }

  return (
    <div>
      {user.isAdmin ? (
        <AdminView /> 
      ) : (
        <UserView /> 
      )}
    </div>
  );
}