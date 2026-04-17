import React, { useContext, useEffect } from 'react'
import Home from './Pages/Home'
import Navbar from './Components/Navbar'
import { Route, Routes } from 'react-router-dom' // Removed unused useParams
import Notification from './Pages/Notification'
import Application from './Pages/Application'
import Apply from './Pages/Apply'
import Profile from './Pages/Profile'
import Blogs from './Pages/Blogs'
import Enroll from './Pages/Enroll'
import Jobs from './Pages/Jobs'
import Settings from './Pages/Settings'
import About from '../Global/Pages/About'
import Services from '../Global/Pages/Services'
import Help from '../Global/Pages/Help'
import Contact_ from '../Global/Pages/Contact'
import SingleAppliedJob from './Components/SingleAppliedJob'
import SingleJob from './Components/SingleJob'
import { WorkContext } from '../ContextAPI/WorkContext' 
import SavedJobs from './Pages/SavedJobs'
import CustomJobs from './Pages/CustomJobs'
import Authorities from './Pages/Authorities'
import Dashboard from './Components/Dashboard'
import CompanyCard from './Components/Company'
import CoverLetter from './Pages/CoverLetter'
import ChatBox from '../Global/Pages/ChatBox'

const SeekerApp = () => {
  // Destructured corrected method name and login state
  const { getAllCategories, isLoggedIn } = useContext(WorkContext);

  useEffect(() => {
    // NEW LOGIC: If the user is logged in (verified via cookie), 
    // fetch the categories needed for the Seeker's job search filters.
    if (isLoggedIn) {
      getAllCategories();
    }
  }, [isLoggedIn, getAllCategories]);

  return (
    <div> 
      <Navbar /> 

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='about' element={<About />} />
        <Route path='service' element={<Services />} />
        <Route path='contact' element={<Contact_ />} />
        <Route path='help' element={<Help />} />
        <Route path='help/chat' element={<ChatBox />} />
        <Route path='notification' element={<Notification />} />
        <Route path='settings' element={<Settings />} />
        <Route path='apply' element={<Apply />} /> 
        <Route path='profile' element={<Profile />} />
        <Route path='profile/job/applied/:jobId' element={<SingleAppliedJob />} />
        <Route path='saved-jobs' element={<SavedJobs />} />
        <Route path='saved-jobs/detail/:jobId' element={<SingleJob />} />
        <Route path='profile/job/saved-jobs/:jobId' element={<SingleJob />} />
        <Route path='enroll' element={<Enroll />} /> 
        <Route path='jobs' element={<Jobs />} />
        <Route path='jobs/custom/:param' element={<CustomJobs />} />
        <Route path='jobs/custom/:param/detail/:jobId' element={<SingleJob />} />
        <Route path='jobs/detail/:jobId' element={<SingleJob />} />
        <Route path='career-advice-blogs' element={<Blogs />} />
        <Route path='my-applications' element={<Application />} />
        <Route path='my-applications/job/applied/:jobId' element={<SingleAppliedJob />} />
        <Route path='companies' element={<Authorities/>} />
        <Route path='companies/detail/:companyId' element={<CompanyCard/>} />
        <Route path='dashboard' element={<Dashboard/>} />
        <Route path='generate/cover-letter' element={<CoverLetter/>} />
      </Routes>
    </div>
  )
}

export default SeekerApp