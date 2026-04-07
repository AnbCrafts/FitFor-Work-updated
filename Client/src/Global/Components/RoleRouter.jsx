import React from 'react'; 
import { useParams } from 'react-router-dom';
import SeekerApp from '../../Seeker/SeekerApp';
import AuthorityApp from '../../Authority/AuthorityApp';
import AdminApp from '../../Admin/AdminApp';

const RoleRouter = () => {
  const { role } = useParams(); 

  if (role === 'seeker') return <SeekerApp />;
  if (role === 'authority') return <AuthorityApp />;
  if (role === 'admin') return <AdminApp />;
  return <div>Invalid role specified.</div>;
};

export default RoleRouter;
