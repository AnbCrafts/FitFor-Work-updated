import  { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import SHA256 from 'crypto-js/sha256';
import { assets } from "../Authority/assets/assets";

 

export const WorkContext = createContext();

export const WorkContextProvider = ({ children }) => {
  const serverURL = "http://localhost:9000/api";
 
  // *********************** USER ROUTES *************************************************************************************


// --- Clean States ---
const [user, setUser] = useState(null); // Holds the full user object (role, name, etc.)
const [seekerProfile, setSeekerProfile] = useState(null);
const [authorityProfile, setAuthorityProfile] = useState(null);
const [registerIndicator, setRegisterIndicator] = useState(false);
const [isLoggedIn, setIsLoggedIn] = useState(false);
const navigate = useNavigate();

// --- Auth Function (Cookie Based) ---
const registerUser = async (data, path) => {
  try {
    const response = await axios.post(
      `${serverURL}/user/auth/${path}`,
      data,
      { withCredentials: true } // CRITICAL: Allows browser to receive/set the HttpOnly cookie
    );

    if (response?.data?.success) {
      const userData = response.data.user;
      
      // Update State
      setUser(userData);
      setRegisterIndicator(true);

      // No more localStorage.setItem("userToken") -> The cookie is now in the browser's jar.

      // Navigate using the secureHash from the backend
      navigate(`/auth/${userData.role.toLowerCase()}/${userData?.username}`);
      
      console.log(response.data.message);
    } else {
      console.error(response.data.message || "Registration failed");
    }
  } catch (error) {
    console.error("Error while registering the user:", error.response?.data?.message || error.message);
  }
};

// --- Profile Fetcher (Self-Correction) ---
const [loading, setLoading] = useState(true); // To prevent flickering on refresh

// --- The "Source of Truth" Function ---
const checkAuthStatus = async () => {
  try {
    // This hits your verifyJWT protected route
    const response = await axios.get(`${serverURL}/user/me`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setUser(response.data.user);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  } catch (error) {
    setIsLoggedIn(false);
    setUser(null);
  } finally {
    setLoading(false); // Stop showing the loading spinner
  }
};

// --- Run on App Load ---
useEffect(() => {
  checkAuthStatus();
}, []);

// --- The Hash Secret Helper (Keep if needed for URL generation) ---
const getHashSecret = (fixedTime = '') => {
  const part1 = "Yy9!Ffwk_+@54$+trackForge@secret__2025!@";
  const time = fixedTime || Date.now().toString().slice(-4);
  const part2 = "XyZ123!#$_@" + time;
  return [...part1].map((ch, i) => ch + (part2[i] || '')).join('');
};

  //get all users end-point ----->
  const [allUsersList,setAllUsersList] = useState(null);
  const getAllUsersList = async()=>{
    try {
      const response = await axios.get(`${serverURL}/user/list/all`);
      if(response && response.data.success){
        const data = response.data.users;
        console.log(data);
        setAllUsersList(data);
      }
    } catch (error) {
      console.log(error);
    }
  }
 useEffect(()=>{
    setAllUsersList(allUsersList);
  },[allUsersList])

  //user data by id end-point ----->
  // --- Essential State ---
const [userData, setUserData] = useState(null);

// --- Corrected Function ---
const getUserData = async () => {
  try {
    // 1. We remove the ID param because verifyJWT on the backend 
    // already knows who "Me" is from the cookie.
    const response = await axios.get(`${serverURL}/user/me`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setUserData(response.data.user);
    } else {
      console.error("Session invalid or user not found");
      setUserData(null);
    }
  } catch (error) {
    console.error("Error fetching user data:", error.response?.data?.message || error.message);
    setUserData(null);
  }
};

// --- Note: If you REALLY need to fetch a DIFFERENT user by ID (e.g. Admin view) ---
const getOtherUserDataById = async (id) => {
  try {
    const response = await axios.get(`${serverURL}/user/list/all/${id}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      return response.data.user; // Usually better to return it than set global state
    }
  } catch (error) {
    console.error("Fetch by ID failed", error);
  }
};

  // remove user by id end-point -------->
  const removeUserByID = async(id)=>{
    try {
      if(!id){
        console.log("Id is required");
      }else{
        const response = await axios.delete(`${serverURL}/user/list/all/remove/${id}`)
        if(response && response.data.success){
          console.log(response.data.message);
          await getAllUsersList();
        }else{
          console.log("Cannot delete user");

        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  // block user end-point ------------->
  const blockUserByID = async (id)=>{
   try {
      if(!id){
        console.log("Id is required");
      }else{
        const response = await axios.put(`${serverURL}/user/list/all/${id}/block`)
        if(response && response.data.success){
          console.log(response.data.message);
          
        }else{
          console.log("Cannot block user");

        }
      }
    } catch (error) {
      console.log(error)
    }

  }

  // --- Clean State ---
const [singleUserData, setSingleUserData] = useState(null);

// --- Corrected Function ---
const getUserDataBySeekerId = async (id) => {
  // If no ID is passed, we can't fetch a specific profile
  if (!id) return console.error("Seeker ID is required to fetch details");

  try {
    const response = await axios.get(
      `${serverURL}/user/list/all/seeker/${id}`, 
      { withCredentials: true } // MANDATORY for cookie-based sessions
    );

    if (response?.data?.success) {
      // Direct assignment to state
      setSingleUserData(response.data.user);
    } else {
      console.warn("Could not retrieve user data for seeker:", id);
      setSingleUserData(null);
    }
  } catch (error) {
    // Handle 401 (Unauthorized) or 404 (Not Found) specifically if needed
    console.error("Error fetching seeker-user data:", error.response?.data?.message || error.message);
    setSingleUserData(null);
  }
};

  //yet to implement
  const editProfile = async(id,data)=>{
    try {
      const response = await axios.put(`${serverURL}/user/profile/edit`)
      
    } catch (error) {
      console.log(error);
      console.log("Internal Server Error");
    }
  }





  // ************************ SEEKER ROUTES ************************************************************************************

//  create profile end-point
// --- Clean States ---
const [initProfileData, setInitProfileData] = useState(null);
const [allSeekersList, setAllSeekersList] = useState([]); // Initialize as array to avoid .map errors

// --- Create Seeker Profile (With Cookie & Multi-part) ---
const createSeekerProfile = async (formData) => {
  try {
    const response = await axios.post(
      `${serverURL}/applicant/profile/create`, 
      formData, 
      {
        withCredentials: true, // MANDATORY: Sends the auth cookie with the form data
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response?.data?.success) {
      const seekerData = response.data.seeker;
      setInitProfileData(seekerData);
      console.log("Profile Created:", response.data.message);
      return true; // Useful for navigating away after success
    } 
  } catch (error) {
    console.error("Profile Creation Error:", error.response?.data?.message || error.message);
    return false;
  }
};

// --- Get All Seekers (Public or Admin List) ---
const getAllSeekersList = async () => {
  try {
    const response = await axios.get(
      `${serverURL}/applicant/profile/list/all`,
      { withCredentials: true } // Assuming this route is protected
    );

    if (response?.data?.success) {
      setAllSeekersList(response.data.seeker);
    }
  } catch (error) {
    console.error("Error fetching seekers:", error.response?.data?.message || error.message);
  }
};

  //seeker data by id end-point ----->
  // --- Clean States ---
const [seekerData, setSeekerData] = useState(null); // For looking up other seekers (e.g., by Employer)
const [userSeekerData, setUserSeekerData] = useState(null); // The logged-in user's seeker profile

// --- Get Seeker by ID (For Employer/Admin View) ---
const getSeekerDataById = async (id) => {
  if (!id) return console.warn("Seeker ID is required.");
  
  try {
    const response = await axios.get(
      `${serverURL}/applicant/profile/list/all/${id}`,
      { withCredentials: true }
    );

    if (response?.data?.success) {
      setSeekerData(response.data.seeker);
    }
  } catch (error) {
    console.error("Error fetching seeker by ID:", error.response?.data?.message || error.message);
  }
};

// --- Get "MY" Seeker Profile (Automatic via Cookie) ---
const getMySeekerProfile = async () => {
  try {
    // Note: Removed the 'id' parameter. The backend identifies you via Cookie.
    const response = await axios.get(
      `${serverURL}/applicant/profile/me`, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      setUserSeekerData(response.data.seeker);
    }
  } catch (error) {
    console.error("Error fetching your seeker profile:", error.response?.data?.message || error.message);
  }
};

// --- Lifecycle: Auto-fetch profile if logged in ---
// useEffect(() => {
//   // Instead of checking localStorage, we check if we have a base 'user' state
//   // or just attempt to fetch the profile on mount.
//   if (isLoggedIn) {
//     getMySeekerProfile();
//   }
// }, [isLoggedIn]);


  // remove user by id end-point -------->
  const removeSeekerByID = async(id)=>{
    try {
      if(!id){
        console.log("Id is required");
      }else{
        const response = await axios.delete(`${serverURL}/applicant/profile/list/all/${id}remove`)
        if(response && response.data.success){
          console.log(response.data.message);
          await getAllSeekersList();
        }else{
          console.log("Cannot delete seeker");

        }
      }
    } catch (error) {
      console.log(error)
    }
  }

 const [wantedAuth, setWantedAuth] = useState({
  totalMatches: 0,
  currentPage: null,
  totalPages: 0,
  authorities: [],
});

const getWantedAuthorities = async (seekerId, i, j) => {
  if (!seekerId) {
    console.log("Provide Seeker ID");
    return;
  }

  try {
    const page = i || 1;
    const limit = j || 10;
    const response = await axios.get(
      `${serverURL}/applicant/profile/list/all/${seekerId}/authorities/matching?page=${page}&limit=${limit}`
    );

    if (response?.data?.success) {
      const {
        totalMatches,
        currentPage,
        totalPages,
        authorities = [],
      } = response.data;

      setWantedAuth({
        totalMatches,
        currentPage,
        totalPages,
        authorities,
      });
    } else {
      console.log(response.data.message || "Could not get a positive response");
    }
  } catch (error) {
    console.log("Internal Server Error");
    console.log(error);
  }
};



// --- Essential State ---
const [dashboardData, setDashboardData] = useState(null);

// --- Corrected Function ---
const getSeekerDashboardData = async () => {
  try {
    // 1. Removed the ID from the URL. 
    // 2. The backend route should now be something like '/applicant/profile/me/dashboard'
    const response = await axios.get(
      `${serverURL}/applicant/profile/me/dashboard-data`, 
      { withCredentials: true } // MANDATORY: Sends the session cookie
    );

    if (response?.data?.success) {
      const data = response.data.userDashboard;
      setDashboardData(data);
      console.log("User Dashboard Loaded:", data);
    } else {
      // If the seeker profile doesn't exist yet for this user
      setDashboardData("No Profile");
    }
  } catch (error) {
    console.error("Dashboard Fetch Error:", error.response?.data?.message || error.message);
    setDashboardData(null);
  }
};

// --- Lifecycle: Trigger when user is confirmed logged in ---
useEffect(() => {
  if (isLoggedIn) {
    getSeekerDashboardData();
  }
}, [isLoggedIn]);




  // *********************** AUTHORITY ROUTES *************************************************************************************
  

  // --- [STATES: AUTHORITY] ---
const [authData, setAuthData] = useState(null); // The Company Profile

// --- [METHODS: AUTHORITY] ---

// 1. Register Authority (Multi-part Logo + Cookie)
const registerForAuthority = async (formData) => {
  try {
    const response = await axios.post(
      `${serverURL}/authority/register/new`, 
      formData, 
      {
        withCredentials: true, // MANDATORY: Links the company to the logged-in user
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response?.data?.success) {
      console.log("Authority Registered:", response.data.message);
      // Optional: Re-fetch company data to update UI
      getMyCompanyProfile(); 
      return true;
    } 
  } catch (error) {
    console.error("Authority Registration Error:", error.response?.data?.message || error.message);
    return false;
  }
};

// 2. Get "MY" Company Profile (Automatic via Cookie)
const getMyCompanyProfile = async () => {
  try {
    // Note: No 'id' param needed. The backend uses verifyJWT to find the owner.
    const response = await axios.get(
      `${serverURL}/authority/profile/my-company`, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      setAuthData(response.data.authority);
    }
  } catch (error) {
    console.error("Error fetching company profile:", error.response?.data?.message || error.message);
  }
};

// --- [LIFECYCLE EXECUTIONS] ---
useEffect(() => {
  // Automatically load company data if the user is logged in as an Authority
  if (isLoggedIn && user?.role === "Authority") {
    getMyCompanyProfile();
  }
}, [isLoggedIn, user?.role]);

// --- [FINAL EXPORT] ---

// --- [STATES: AUTHORITY DISCOVERY] ---
const [allAuthorities, setAllAuthorities] = useState([]); // Array-first to prevent crashes
const [oneAuthData, setOneAuthData] = useState(null);

// --- [METHODS: AUTHORITY DISCOVERY] ---

// 1. Get All Companies (Public List)
const getAllAuthorities = async () => {
  try {
    const response = await axios.get(
      `${serverURL}/authority/list/all`,
      { withCredentials: true } // Lets backend know if we are logged in
    );

    if (response?.data?.success) {
      setAllAuthorities(response.data.authorities);
    }
  } catch (error) {
    console.error("Error fetching all authorities:", error.response?.data?.message || error.message);
  }
};

// 2. Get Single Company by ID (Public Detail View)
const getAuthorityByID = async (id) => {
  if (!id) return console.warn("Authority ID is missing");

  try {
    const response = await axios.get(
      `${serverURL}/authority/list/all/${id}`,
      { withCredentials: true }
    );

    if (response?.data?.success) {
      setOneAuthData(response.data.authority);
    } else {
      setOneAuthData(null);
    }
  } catch (error) {
    console.error("Error fetching authority detail:", error.response?.data?.message || error.message);
    setOneAuthData(null);
  }
};

// --- [FINAL EXPORT] ---


  // --- [STATES: AUTHORITY MATCHING] ---
const [matchedData, setMatchedData] = useState({
  totalMatches: 0,
  matchedSkills: [],
  seekers: [],
});

// --- [METHODS: AUTHORITY] ---

// 1. Get Matching Seekers (AI/Skill Match for Employer)
const getMatchedData = async (id) => {
  // If your backend is updated, you won't even need this 'id' param
  const targetId = id || authData?._id; 
  if (!targetId) return console.warn("Authority ID is required for matching");

  try {
    const response = await axios.get(
      `${serverURL}/authority/list/all/seekers/matching-skills/${targetId}`,
      { withCredentials: true } // Sends the session cookie
    );

    if (response?.data?.success) {
      setMatchedData({
        matchedSkills: response.data.matchedSkills || [],
        seekers: response.data.seekers || [],
        totalMatches: response.data.totalMatches || 0
      });
    }
  } catch (error) {
    console.error("Matching Error:", error.response?.data?.message || "Internal Server Error");
  }
};

// 2. Edit Authority Profile (Cookie-Based & Secure)
const editAuthProfile = async (formData) => {
  // We remove the 'id' param because the backend identifies the owner via Cookie
  if (!formData) return console.warn("Provide profile data to update");

  try {
    const response = await axios.put(
      `${serverURL}/authority/profile/edit/me`, // Changed to a /me endpoint for security
      formData,
      {
        withCredentials: true, // Replaces manual Authorization header
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response?.data?.success) {
      console.log("Profile updated successfully!");
      // Refresh the local authData state with the new details
      setAuthData(response.data.authority);
      return response.data;
    }
  } catch (error) {
    console.error("Edit profile error:", error.response?.data?.message || "Internal Server Error");
  }
};

// --- [FINAL EXPORT] ---

// --- [STATES: AUTHORITY NAMES] ---
const [allCompanies, setAllCompanies] = useState([]); // Array-first for safe .map()

// --- [METHODS: AUTHORITY NAMES] ---

// 1. Get All Company Names (Lightweight for Dropdowns/Filters)
const getAllCompanyNames = async () => {
  try {
    const response = await axios.get(
      `${serverURL}/authority/all/names`,
      { withCredentials: true } // Best practice even for public routes
    );

    if (response?.data?.success) {
      // Assuming companyNames is the array from backend
      setAllCompanies(response.data.companyNames || []);
    }
  } catch (error) {
    console.error("Error fetching company names:", error.response?.data?.message || error.message);
  }
};

// --- [FINAL EXPORT] ---





 
  // *********************** JOB ROUTES *************************************************************************************
 
 // --- [STATES: JOBS & MARKETPLACE] ---
const [jobs, setJobs] = useState([]); // Jobs for a specific Authority
const [allJobs, setAllJobs] = useState([]); // Global Marketplace
const [singleJob, setSingleJob] = useState(null); // Detailed view
const [applicantId, setApplicantId] = useState(null); // Last application status

// --- [METHODS: JOBS & MARKETPLACE] ---

// 1. Create a New Job (Authority Only)
const createJob = async (jobData) => {
  if (!jobData) return console.warn("Provide Job Data");
  try {
    const response = await axios.post(`${serverURL}/job/create/new`, jobData, { withCredentials: true });
    if (response?.data?.success) {
      console.log("Job Posted Successfully");
      await getJobByAuthority(); // Refresh the list
      return true;
    }
  } catch (error) {
    console.error("Create Job Error:", error.response?.data?.message || error.message);
  }
};

// 2. Get Jobs by Authority (My Postings)
const getJobByAuthority = async () => {
  try {
    // Note: No ID needed, backend finds jobs by owner cookie
    const response = await axios.get(`${serverURL}/job/list/all/authority/me`, { withCredentials: true });
    if (response?.data?.success) {
      setJobs(response.data.jobs || []);
    }
  } catch (error) {
    console.error("Error fetching your jobs:", error.response?.data?.message);
  }
};

// 3. Get Global Jobs (Marketplace)
const getAllJobsFromDB = async () => {
  try {
    const response = await axios.get(`${serverURL}/job/list/all`, { withCredentials: true });
    if (response?.data?.success) {
      setAllJobs(response.data.jobs || []);
    }
  } catch (error) {
    console.error("Marketplace Error:", error.message);
  }
};

// 4. Delete Job
const deleteJob = async (id) => {
  if (!id) return;
  try {
    const response = await axios.delete(`${serverURL}/job/list/all/${id}/remove`, { withCredentials: true });
    if (response?.data?.success) {
      console.log("Job deleted successfully");
      setAllJobs((prev) => prev.filter(job => job._id !== id));
      setJobs((prev) => prev.filter(job => job._id !== id));
    }
  } catch (error) {
    console.error("Deletion Failed:", error.response?.data?.message);
  }
};

// 5. Get Single Job Details
const getSingleJobById = async (id) => {
  if (!id) return;
  try {
    const response = await axios.get(`${serverURL}/job/list/all/${id}`, { withCredentials: true });
    if (response?.data?.success) {
      setSingleJob(response.data.job);
    }
  } catch (error) {
    console.error("Fetch Single Job Error:", error.message);
  }
};

// 6. Apply for Job (Seeker Only)
const applyForJob = async (jobId) => {
  // seekerId is removed - backend identifies Seeker via Cookie
  if (!jobId) return;
  try {
    const response = await axios.post(`${serverURL}/job/${jobId}/apply`, {}, { withCredentials: true });
    if (response?.data?.success) {
      const data = response.data.applicantId;
      setApplicantId(data);
      console.log("Application Successful:", data);
      return true;
    }
  } catch (error) {
    console.error("Application Failed:", error.response?.data?.message || error.message);
  }
};

// --- [FINAL CONSOLIDATED EXPORT] ---

  // *********************** APPLICANT ROUTES *************************************************************************************
 // --- [STATES: APPLICANTS & HIRING] ---
const [allApplicants, setAllApplicants] = useState([]);
const [singleApplicantData, setSingleApplicantData] = useState(null);
const [jobApplicants, setJobApplicants] = useState([]);

// --- [METHODS: APPLICANTS & HIRING] ---

// 1. Get All Applicants (Admin/Global View)
const getAllApplicants = async () => {
  try {
    const response = await axios.get(`${serverURL}/job-applicant/list/all`, { withCredentials: true });
    if (response?.data?.success) {
      setAllApplicants(response.data.applicants || []);
    }
  } catch (error) {
    console.error("Error fetching all applicants:", error.message);
  }
};

// 2. Flexible Applicant Fetch (by ID, Seeker, or Company)
const getApplicantById = async (id, indicator) => {
  if (!id || !indicator) return console.warn("ID and Indicator are required");
  
  let endpoint = "";
  if (indicator === 1) endpoint = `/job-applicant/list/all/${id}`;
  else if (indicator === 2) endpoint = `/job-applicant/list/all/seeker/${id}`;
  else if (indicator === 3) endpoint = `/job-applicant/list/all/company/${id}`;
  else return console.warn("Invalid indicator");

  try {
    const response = await axios.get(`${serverURL}${endpoint}`, { withCredentials: true });
    if (response?.data?.success) {
      setSingleApplicantData(response.data.applicant);
    }
  } catch (error) {
    console.error("Error fetching applicant details:", error.message);
  }
};

// 3. Get Applicants for a Specific Job (Employer Dashboard)
const getApplicantsByJobId = async (id) => {
  if (!id) return;
  try {
    const response = await axios.get(`${serverURL}/job-applicant/list/all/job/${id}`, { withCredentials: true });
    if (response?.data?.success) {
      setJobApplicants(response.data.applicants || []);
    }
  } catch (error) {
    console.error("Error fetching applicants for job:", error.message);
  }
};

// 4. Decision Engine: Accept or Reject Applicant
const approveApplicant = async (applicantId, jobId, actionText) => {
  const action = actionText.toLowerCase(); // 'accept' or 'reject'
  if (!['accept', 'reject'].includes(action)) return console.error("Invalid action");

  try {
    const response = await axios.post(
      `${serverURL}/job-applicant/list/all/applicant/${applicantId}/job/${jobId}/${action}`,
      {},
      { withCredentials: true }
    );

    if (response?.data?.success) {
      console.log(`Applicant ${action}ed successfully`);
      
      // Update local state to reflect the decision immediately
      setJobApplicants((prev) => 
        prev.map(app => app._id === applicantId ? { ...app, status: action === 'accept' ? 'Accepted' : 'Rejected' } : app)
      );
      
      // Refresh global list if necessary
      await getAllApplicants();
    }
  } catch (error) {
    console.error(`Error during applicant ${action}:`, error.response?.data?.message || error.message);
  }
};

// --- [FINAL CONSOLIDATED EXPORT] ---


  // *********************** ADMIN ROUTES *************************************************************************************

  // --- [STATES: ADMIN] ---
const [adminData, setAdminData] = useState(null);
const [allAdmins, setAllAdmins] = useState([]);

// --- [METHODS: ADMIN] ---

// 1. Admin Login (Cookie-Based)
const loginAdmin = async (data) => {
  try {
    const response = await axios.post(`${serverURL}/admin/existing/login`, data, {
      withCredentials: true, // MANDATORY: Allows browser to receive the HttpOnly session cookie
    });

    if (response?.data?.success) {
      const admin = response.data.admin;
      
      // Update Global State
      setAdminData(admin);
      setIsLoggedIn(true);
      setUser(admin); // Assuming admin is a type of user

      // Navigation: Using the hash from backend purely for URL structure
      const hash = admin.secureHash;
      navigate(`/auth/admin/${hash}`);
      
      console.log("Admin logged in successfully");
    } else {
      console.warn("False Login Attempt");
    }
  } catch (error) {
    console.error("Failed to login admin:", error.response?.data?.message || error.message);
  }
};

// 2. List All Admins (Protected View)
const getAllAdmins = async () => {
  try {
    const response = await axios.get(`${serverURL}/admin/list/all`, {
      withCredentials: true, // Only an admin cookie should allow this
    });

    if (response?.data?.success) {
      setAllAdmins(response.data.admins || []);
    }
  } catch (error) {
    console.error("Error fetching admins:", error.message);
  }
};

// --- [FINAL CONSOLIDATED EXPORT] ---


  // *********************** EMPLOYEE ROUTES *************************************************************************************
  
  const [allEmployees, setAllEmployees] = useState(null);
  const getAllEmployee = async()=>{
        try {
          const response = await axios.get(`${serverURL}/employee/list/all`);
          if(response && response.data.success){
            const data = response.data.employees;
            setAllEmployees(data);
            console.log(data);
          }else{
            console.log("Cannot get positive response");
          }
        } catch (error) {
          console.log(error);
        }
  }
  const [singleEmployee,setSingleEmployee] = useState(null);
 const getEmployeeById = async (id) => {
  if (!id) {
    console.log("Please provide a valid Employee ID.");
    return; // ✅ prevent continuing execution
  }

  try {
    const response = await axios.get(`${serverURL}/employee/list/all/${id}`);

    if (response?.data?.success && response.data.employee) {
      setSingleEmployee(response.data.employee);
      console.log("✅ Employee data fetched:", response.data.employee);
    } else {
      console.warn("⚠️ Employee not found or unsuccessful response.");
    }
  } catch (error) {
    console.error("❌ Error fetching employee:", error.message);
    console.log("An error occurred while fetching employee data.");
  }
};

  const removeEmployee = async(id)=>{
    if(!id){
      console.log("Provide ID")
    }
    try {
      const response = await axios.delete(`${serverURL}/employee/list/all/${id}/remove`);
      if(response && response.data.success){
        console.log("Employee Deleted Successfully");
      }else{
        console.log("Could not get positive response")
      }

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    setAllEmployees(allEmployees);
  },[allEmployees])

  useEffect(()=>{
    setSingleEmployee(singleEmployee);
  },[singleEmployee]) 


  const [thisJobEmployee,setThisJobEmployee] = useState(null);
  const getEmployeeByJobId = async(id)=>{
     if(!id){
      console.log("Provide ID")
    }
    
    try {
        
      const response = await axios.get(`${serverURL}/employee/list/all/job/${id}`);
      
       if(response && response.data.success){
            const data = response.data.employee;
            setThisJobEmployee(data);
            console.log("this job employee data -  ", data);
          }else{
            console.log("Cannot get positive response");
          }
    } catch (error) {
      console.log(error)
    }
  }

  const [empProfileData,setEmpProfileData] = useState(null);
  const getUserDataByEmpId = async(id)=>{
    try {
      const response = await axios.get(`${serverURL}/employee/profile-data/${id}`);
      if(response && response.data.success){
        const data = response.data.empData;
        setEmpProfileData(data);
      }else{
        console.log(response.data.message || "Cannot get response")
      }
      
    } catch (error) {
      console.log(error);
      console.log("Internal server error");

    }
  }
const [thisAuthAllEmployees,setThisAuthAllEmployees] = useState(null);

const getEmployeeByCompany = async(id)=>{
  if(!id){
    console.log("Provide ID");
  }
  try {
    const response = await axios.get(`${serverURL}/employee/list/all/company/${id}`);
    if(response && response.data.success){
      const data = response.data.employee;
      setThisAuthAllEmployees(data);

    }else{
      console.log(response.data.message || "Cannot get response");
    }
  } catch (error) {
    console.log(error);
    console.log("Internal Server Error");
  }
}
  
  
  // *********************** UTILITY *************************************************************************************
 function convertToStandardDateTime(isoString) {
  if (!isoString) return 'Invalid Date';

  const dateObj = new Date(isoString);

  // Format date
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObj.toLocaleDateString('en-US', options);

  // Format time
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  const formattedTime = `${hours}:${minutes} ${period}`;

  return `${formattedDate}, ${formattedTime}`;
}


// --- [STATES: DISCOVERY] ---
const [allCategories, setAllCategories] = useState([]); // Array-first for dropdowns

// --- [METHODS: DISCOVERY] ---

// 1. Get Unique Industry Categories (Extracted from Authority List)
const getAllCategories = async () => {
  try {
    const response = await axios.get(`${serverURL}/authority/list/all`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      const authorities = response.data.authorities || [];
      
      // Use a Set to ensure categories are unique (no duplicates in UI)
      const uniqueCategories = [
        ...new Set(authorities.map(item => item.industry).filter(Boolean))
      ];

      setAllCategories(uniqueCategories);
    }
  } catch (error) {
    console.error("Error extracting categories:", error.response?.data?.message || error.message);
  }
};

// --- [FINAL CONSOLIDATED EXPORT] ---



// --- [STATES: SAVED JOBS] ---
const [savedJobsForThisUser, setSavedJobsForThisUser] = useState([]); // Array-first for safe rendering

// --- [METHODS: SAVED JOBS] ---

// 1. Save/Bookmark a Job
const saveJob = async (jobId) => {
  // seekerId removed - backend identifies Seeker via Cookie
  if (!jobId) return console.warn("Job ID is required to save");

  try {
    const response = await axios.put(
      `${serverURL}/job/${jobId}/save`, // Simplified route
      {}, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      console.log("Job saved/unsaved successfully");
      // Optionally refresh the list to keep UI in sync
      await getAllSavedJobs();
    }
  } catch (error) {
    console.error("Save Job Error:", error.response?.data?.message || error.message);
  }
};

// 2. Get All Saved Jobs (Optimized Single Request)
const getAllSavedJobs = async () => {
  try {
    // We hit a 'me' endpoint so the backend knows which seeker's list to fetch
    const response = await axios.get(
      `${serverURL}/job/me/saved-list`, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      // We assume the backend now returns populated job objects, not just IDs
      const jobs = response.data.savedJobs || [];
      setSavedJobsForThisUser(jobs);
      console.log("✅ Saved jobs updated:", jobs);
    }
  } catch (error) {
    console.error("Error fetching saved jobs:", error.response?.data?.message || error.message);
    setSavedJobsForThisUser([]);
  }
};

// --- [LIFECYCLE] ---
useEffect(() => {
  if (isLoggedIn && user?.role === "Seeker") {
    getAllSavedJobs();
  }
}, [isLoggedIn, user?.role]);

// --- [FINAL CONSOLIDATED EXPORT] ---

const [typeNotifications, setTypeNotifications] = useState(null);

const getNotifications_ByType = async (typesArray) => {
  try {
    // Ensure typesArray is actually an array
    if (!Array.isArray(typesArray)) {
      console.error("❌ typesArray is not an array:", typesArray);
      return;
    }

    const requests = typesArray.map((type) =>
      axios.get(`${serverURL}/notification/list/all/${type}`)
    );

    const responses = await Promise.all(requests);

    const allNotifications = responses
      .filter((res) => res.data.success && res.data.notifications)
      .flatMap((res) => res.data.notifications);

    if (allNotifications.length > 0) {
      setTypeNotifications(allNotifications);
    } else {
      console.log("No notifications found for the provided types.");
    }

  } catch (error) {
    console.error("❌ Error fetching notifications:", error.message);
    console.log("Internal server error");
  }
};

const [singleNotificationData,setSingleNotificationData] = useState(null);

const getNotificationById = async(id)=>{
  try {
    const response = await axios.get(`${serverURL}/notification/list/all/${id}`);
    if(response && response.data.success){
      const data = response.data.notification;
      setSingleNotificationData(data);

    }else{
      console.log(response.data.message || "Cannot get response");
    }

    
  } catch (error) {
    console.log(error);
    console.log("Internal Server Error");
  }
  
}

// --- [STATES: DISCOVERY & FILTERS] ---
const [requirements, setRequirements] = useState([]); // Unique categories for dropdowns
const [customJobs, setCustomJobs] = useState([]); // Filtered search results

// --- [METHODS: DISCOVERY & SEARCH] ---

// 1. Get All Filter Requirements (Locations, Skills, Roles)
const getAllRequirementsForJob = async () => {
  try {
    const response = await axios.get(
      `${serverURL}/job/list/all/requirements`,
      { withCredentials: true }
    );

    if (response?.data?.success) {
      // Assuming 'categories' contains unique lists for filters
      setRequirements(response.data.categories || []);
    }
  } catch (error) {
    console.error("Filter Requirements Error:", error.response?.data?.message || "Internal Server Error");
  }
};

// 2. Get Custom Filtered Jobs (Search Engine)
const getCustomJobs = async (query) => {
  // query should be a string like "location=Kolkata&role=Developer"
  try {
    const response = await axios.get(
      `${serverURL}/job/list/all/custom-query?${query}`,
      { withCredentials: true }
    );

    if (response?.data?.success) {
      setCustomJobs(response.data.jobs || []);
    }
  } catch (error) {
    console.error("Custom Search Error:", error.response?.data?.message || "Internal Server Error");
    setCustomJobs([]); // Clear list on error
  }
};

// --- [FINAL CONSOLIDATED EXPORT] ---





 


const exitFromPlatform = ()=>{

  setUserId(null);
  setUserToken(null);
  setSeekerId(null);
  setSeekerToken(null);
  setAuthorityToken(null);
  setAuthorityId(null);
  setAdminData(null);
  setAdminId(null);
  setAdminToken(null);
  setUserData(null);
  setAllUsersList(null);
  setSingleUserData(null);
  setInitProfileData(null);
  setAllSeekersList(null);
  setSeekerData(null);
  setUser_SeekerData(null);
  setAuthData(null);
  setAllAuthorities(null);
  setAllApplicants(null);
  setOneAuthData(null);
  setAllCategories(null);
  setAllEmployees(null);
  setAllSeekersList(null);
  setApplicant_id(null);
  setAuthData(null);
  setAuthorityId(null);
  setAuthorityToken(null);
  setInitProfileData(null);
  setJobApplicants(null);
  setJobs(null);
  setOneAuthData(null);
  setRegisterIndicator(false);
  setSavedJobsForThisUser(null);
  setSeekerData(null);
  setUserId(null);
  setUserToken(null);
  setUser_SeekerData(null);
}

// --- [STATES: SKILLS & RECRUITMENT] ---
const [allSkills, setAllSkills] = useState([]); // List for seeker filter dropdowns
const [customSuggestions, setCustomSuggestions] = useState([]); // Filtered seeker search results
const [thisAuthAllApplicants, setThisAuthAllApplicants] = useState([]); // Employer-specific applicant list

// --- [METHODS: SKILLS & RECRUITMENT] ---

// 1. Get All Skills (For Dropdowns/Filters)
const getSkills = async () => {
  try {
    const response = await axios.get(
      `${serverURL}/applicant/profile/list/all/factors`,
      { withCredentials: true }
    );
    if (response?.data?.success) {
      setAllSkills(response.data.allSkills || []);
    }
  } catch (error) {
    console.error("Error fetching skills:", error.response?.data?.message || "Internal Server Error");
  }
};

// 2. Custom Seeker Search (For Recruiters)
const getCustomSuggestion = async (query) => {
  // query: "skills=React,Node&location=Delhi"
  try {
    const response = await axios.get(
      `${serverURL}/applicant/profile/list/all/factors/custom-query?${query}`,
      { withCredentials: true }
    );
    if (response?.data?.success) {
      setCustomSuggestions(response.data.seekers || []);
    }
  } catch (error) {
    console.error("Custom Suggestion Error:", error.response?.data?.message || "Internal Server Error");
    setCustomSuggestions([]);
  }
};

// 3. Get All Applicants for Logged-in Authority
const getAllApplicantsForThisAuth = async () => {
  try {
    // Note: Manual ownerId removed. Backend uses Cookie to find the Authority's applicants.
    const response = await axios.get(
      `${serverURL}/job-applicant/list/all/company/me/data`, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      setThisAuthAllApplicants(response.data.allApplicantData || []);
    }
  } catch (error) {
    console.error("Authority Applicant Fetch Error:", error.response?.data?.message || "Internal Server Error");
  }
};

// --- [FINAL CONSOLIDATED EXPORT] ---

const resetOnExit = () => {
  // ✅ Clear localStorage (tokens, IDs)
  localStorage.clear();

  // ✅ Reset authentication and identity states
  setUserId(null);
  setUserToken(null);
  setSeekerId(null);
  setAuthorityId(null);
  setAdminId(null);
  setSeekerToken(null);
  setAuthorityToken(null);
  setAdminToken(null);
  setRegisterIndicator(false);

  // ✅ Reset private user/company/admin data
  setUserData(null);
  setSeekerData(null);
  setUser_SeekerData(null);
  setSingleUserData(null);
  setAuthData(null);
  setOneAuthData(null);
  setAdminData(null);

  // ✅ Reset job application and hiring states
  setApplicant_id(null);
  setAllApplicants(null);
  setSingleApplicantData(null);
  setJobApplicants(null);
  setThisJobEmployee(null);
  setThisAuthAllEmployees(null);
  setSingleEmployee(null);
  setEmpProfileData(null);

  // ✅ Reset user-specific utility states
  setSavedJobsForThisUser(null);
  setTypeNotifications(null);
  setSingleNotificationData(null);

  // ✅ Optionally reset temporary or filtered job views
  setCustomJobs(null);

  
};








const [globalId,setGlobalId] = useState(null);

const getUserIdByToken = async()=>{
      const token = localStorage.getItem("userToken");
      if(token){
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        if(userId){
        setGlobalId(userId)
        }else{
          console.log("cannot get UserID")
        }



      }else{
          console.log("cannot get token")

      }

}

useEffect(()=>{
  setGlobalId(globalId);
},[globalId]);




// --- [STATES: ANALYTICS] ---
const [graphData, setGraphData] = useState({
  pie: null,     // Application Status
  bar: null,     // Applications by Category
  line: null,    // Applications by Date
  horBar: null,  // Applications by Location
  grade: null,   // Resume Score Breakdown (Radar)
  brief: null    // AI Summary/Briefing
});

// --- [HELPER: VALIDATION] ---
const validateResponse = async (response) => {
  if (response?.data?.success) {
    return response.data.data;
  } else {
    console.warn(response?.data?.message || "Data validation failed");
    return null;
  }
};

// --- [METHODS: ANALYTICS] ---

// 1. Fetch Pie Chart Data - Application Status
const fetchApplicationStatusPie = async () => {
  try {
    const response = await axios.get(`${serverURL}/graph/application/status/me`, { withCredentials: true });
    const data = await validateResponse(response);
    if (data) setGraphData((prev) => ({ ...prev, pie: data }));
  } catch (error) {
    console.error("Error fetching pie data:", error.message);
  }
};

// 2. Fetch Line Chart Data - Applications by Date
const fetchApplicationsByDate = async () => {
  try {
    const response = await axios.get(`${serverURL}/graph/application/status/me/date`, { withCredentials: true });
    const data = await validateResponse(response);
    if (data) setGraphData((prev) => ({ ...prev, line: data }));
  } catch (error) {
    console.error("Error fetching line data:", error.message);
  }
};

// 3. Fetch Bar Chart Data - Applications by Category
const fetchApplicationsByCategory = async () => {
  try {
    const response = await axios.get(`${serverURL}/graph/application/status/me/category`, { withCredentials: true });
    const data = await validateResponse(response);
    if (data) setGraphData((prev) => ({ ...prev, bar: data }));
  } catch (error) {
    console.error("Error fetching bar data:", error.message);
  }
};

// 4. Fetch Horizontal Bar Chart - Applications by Location
const fetchApplicationsByLocation = async () => {
  try {
    const response = await axios.get(`${serverURL}/graph/application/status/me/location`, { withCredentials: true });
    const data = await validateResponse(response);
    if (data) setGraphData((prev) => ({ ...prev, horBar: data }));
  } catch (error) {
    console.error("Error fetching horizontal bar data:", error.message);
  }
};

// 5. Fetch Radar Chart - Resume Score Breakdown
const fetchResumeGrade = async () => {
  try {
    const response = await axios.get(`${serverURL}/graph/applicant-profile/me/grade`, { withCredentials: true });
    const data = await validateResponse(response);
    if (data) setGraphData((prev) => ({ ...prev, grade: data }));
  } catch (error) {
    console.error("Error fetching radar data:", error.message);
  }
};

// --- [LIFECYCLE] ---
useEffect(() => {
  if (isLoggedIn && user?.role === "Seeker") {
    fetchApplicationStatusPie();
    fetchApplicationsByDate();
    fetchApplicationsByCategory();
    fetchApplicationsByLocation();
    fetchResumeGrade();
  }
}, [isLoggedIn, user?.role]);

// --- [FINAL CONSOLIDATED EXPORT] ---

// --- [STATES: RECOMMENDATIONS] ---
const [suggestedJobsForThisSeeker, setSuggestedJobsForThisSeeker] = useState({
  suggestedJobs: [],
  totalMatches: 0, 
});

// --- [METHODS: RECOMMENDATIONS] ---

// 1. Get Personalized Job Feed (AI/Skill Based)
const getSuggestedJobsForThisSeeker = async () => {
  // Manual seekerId removed - backend identifies Seeker via Cookie
  try {
    const response = await axios.get(
      `${serverURL}/dashboard/suggested-jobs/me`, 
      { withCredentials: true } // MANDATORY: Sends the auth cookie
    );

    if (response?.data?.success) {
      const { suggestedJobs, totalMatches } = response.data;

      setSuggestedJobsForThisSeeker({
        suggestedJobs: suggestedJobs || [],
        totalMatches: totalMatches || 0,
      });
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error.response?.data?.message || error.message);
    // Reset state on failure to avoid showing stale recommendations
    setSuggestedJobsForThisSeeker({ suggestedJobs: [], totalMatches: 0 });
  }
};

// --- [LIFECYCLE] ---
useEffect(() => {
  // Trigger suggestions as soon as the Seeker is verified
  if (isLoggedIn && user?.role === "Seeker") {
    getSuggestedJobsForThisSeeker();
  }
}, [isLoggedIn, user?.role]);

// --- [FINAL CONSOLIDATED EXPORT] ---


// AUTHORITY GRAPHS
// --- [STATES: AUTHORITY ANALYTICS] ---
const [authorityStats, setAuthorityStats] = useState({
  status: null,     // Pie: Accepted/Rejected/Pending
  weekly: null,     // Line: Application trends over time
  perJob: null,     // Bar: High-performing vs Low-performing posts
  location: null,   // Map/HorBar: Talent density by city
  role: null,       // Bar: Applications by Job Title
  type: null,       // Pie: Full-time vs Internship
  category: null    // Bar: Applications by Industry/Category
});

// --- [METHODS: AUTHORITY ANALYTICS] ---

const fetchAuthorityAnalytics = async (endpoint, key) => {
  try {
    const response = await axios.get(`${serverURL}/graph/job-applications/me/${endpoint}`, { 
      withCredentials: true 
    });
    
    if (response?.data?.success) {
      setAuthorityStats(prev => ({ ...prev, [key]: response.data.data }));
    }
  } catch (error) {
    console.error(`Error fetching ${key} stats:`, error.message);
  }
};

// Individual triggers (Wrappers for the generic fetcher)
const getApplicantsStatus = () => fetchAuthorityAnalytics('count/status', 'status');
const getApplicantsStatusWeekly = () => fetchAuthorityAnalytics('count/weekly', 'weekly');
const getApplicationCountPerJob = () => fetchAuthorityAnalytics('count', 'perJob');
const getApplicationsByLocations = () => fetchAuthorityAnalytics('count/location', 'location');
const getApplicationsByRoles = () => fetchAuthorityAnalytics('count/role', 'role');
const getApplicationsByTypes = () => fetchAuthorityAnalytics('count/type', 'type');
const getApplicationsByCategory = () => fetchAuthorityAnalytics('count/category', 'category');

// --- [LIFECYCLE] ---
useEffect(() => {
  // Automatically load the full dashboard if the user is an Authority
  if (isLoggedIn && user?.role === "Authority") {
    getApplicantsStatus();
    getApplicantsStatusWeekly();
    getApplicationCountPerJob();
    getApplicationsByLocations();
    getApplicationsByRoles();
    getApplicationsByTypes();
    getApplicationsByCategory();
  }
}, [isLoggedIn, user?.role]);

// --- [FINAL CONSOLIDATED EXPORT] ---


// *********************** <MEssage> ROutes *************************************************************************************
const [allMessages, setAllMessages] = useState([]);

const getMessages = async (sender, receiver) => {
  if (!sender || !receiver) {
    console.log("Sender or receiver not found");
    return;
  }

  try {
    const response = await axios.get(`${serverURL}/message/all/sender=${sender}&receiver=${receiver}`);

    if (response?.data?.success) {
      const messages = response.data.data;  // corrected key from `date` to `data`
      if (messages?.length > 0) {
        setAllMessages(messages);
      } else {
        console.log("No messages found");
        setAllMessages([]);
      }
    } else {
      console.log("Failed to fetch messages");
    }

  } catch (error) {
    console.error("Error while fetching messages:", error);
    console.log("Something went wrong while fetching the messages.");
  }
};

const sendMessage = async (sender, receiver, data) => {
  if (!sender || !receiver || !data) {
    console.log("Sender, receiver, or message content is missing.");
    return;
  }

  try {
    const response = await axios.post(`${serverURL}/message/send`, {
      ...data,
      sender,
      receiver
    });

    if (response?.data?.success) {
     await getMessages(sender, receiver);
    } else {
      console.log("Message sending failed");
    }

  } catch (error) {
    console.log("Internal Server Error:", error);
    console.log("Something went wrong while sending the message.");
  }
};

const [allPingsForThisUser, setAllPingsForThisUser] = useState(null);

const getAllPingsByUserId = async (receiver) => {
  if (!receiver) {
    console.log("Receiver not found");
    return;
  }

  try {
    const response = await axios.get(`${serverURL}/message/all-pings/receiver=${receiver}`);

    if (response?.data?.success) {
      const users = response.data.users;
      if (users?.length > 0) {
        setAllPingsForThisUser(users);
      } else {
        console.log("No users found");
        setAllPingsForThisUser(null);
      }
    } else {
      console.log("Failed to fetch users");
    }

  } catch (error) {
    console.error("Error while fetching messages:", error);
    console.log("Something went wrong while fetching the messages.");
  }
};

const readMessages = async(senderId,receiverId)=>{
  // 
   try {
    await axios.put(`${serverURL}/message/all/sender=${senderId}&receiver=${receiverId}/read`);
    await getMessages(senderId,receiverId)
    // Optionally update UI or unread count state here
  } catch (err) {
    console.error("Failed to mark messages as read",err);
  }

}





const [pendingAuthorities, setPendingAuthorities] = useState([]);
const [flaggedJobs, setFlaggedJobs] = useState([]);
const [adminTickets, setAdminTickets] = useState([]);
const [adminDashboardStats, setAdminDashboardStats] = useState(null);
const [userLogs, setUserLogs] = useState([]);



// --- Auth & Security ---
const updateAdminPassword = async (data) => {
  try {
    const response = await axios.patch(`${serverURL}/admin/update-password`, data, { withCredentials: true });
    if (response?.data?.success) console.log("Password updated successfully");
  } catch (error) {
    console.error("Password Update Error:", error.response?.data?.message);
  }
};

// --- User & Activity ---
const getUserActivityLogs = async (userId) => {
  try {
    const response = await axios.get(`${serverURL}/admin/users/${userId}/logs`, { withCredentials: true });
    if (response?.data?.success) setUserLogs(response.data.logs);
  } catch (error) {
    console.error("Error fetching user logs:", error.message);
  }
};

// --- Authority Moderation ---
const getPendingAuthorities = async () => {
  try {
    const response = await axios.get(`${serverURL}/admin/authorities/pending`, { withCredentials: true });
    if (response?.data?.success) setPendingAuthorities(response.data.authorities);
  } catch (error) {
    console.error("Error fetching pending authorities:", error.message);
  }
};

const verifyAuthority = async (id, status) => {
  try {
    const response = await axios.patch(`${serverURL}/admin/authorities/${id}/verify`, { status }, { withCredentials: true });
    if (response?.data?.success) await getPendingAuthorities(); // Refresh list
  } catch (error) {
    console.error("Verification Error:", error.message);
  }
};

// --- Job Moderation ---
const getFlaggedJobs = async () => {
  try {
    const response = await axios.get(`${serverURL}/admin/jobs/flagged`, { withCredentials: true });
    if (response?.data?.success) setFlaggedJobs(response.data.jobs);
  } catch (error) {
    console.error("Error fetching flagged jobs:", error.message);
  }
};

const updateJobStatus = async (jobId, status) => {
  try {
    const response = await axios.patch(`${serverURL}/admin/jobs/${jobId}/status`, { status }, { withCredentials: true });
    if (response?.data?.success) await getFlaggedJobs();
  } catch (error) {
    console.error("Status Update Error:", error.message);
  }
};

// --- Support & Global Comm ---
const getAllTickets = async () => {
  try {
    const response = await axios.get(`${serverURL}/admin/tickets`, { withCredentials: true });
    if (response?.data?.success) setAdminTickets(response.data.tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
  }
};

const broadcastNotification = async (notifData) => {
  try {
    const response = await axios.post(`${serverURL}/admin/notifications/broadcast`, notifData, { withCredentials: true });
    if (response?.data?.success) console.log("Broadcast successful");
  } catch (error) {
    console.error("Broadcast Error:", error.message);
  }
};

// --- Admin Analytics ---
const getAdminDashboardStats = async () => {
  try {
    const response = await axios.get(`${serverURL}/admin/stats/overview`, { withCredentials: true });
    if (response?.data?.success) setAdminDashboardStats(response.data.stats);
  } catch (error) {
    console.error("Stats Error:", error.message);
  }
};


const [companyApplicantsData, setCompanyApplicantsData] = useState([]);

// --- [APPLICANTS & HIRING REFINEMENTS] ---

// 1. Get ALL Applicants for a specific Company (By Company/Authority ID)
// Useful for Public/Admin views or cross-referencing
const getApplicantFromCompanyId = async (companyId) => {
  if (!companyId) return console.warn("Company ID is required");
  try {
    const response = await axios.get(`${serverURL}/job-applicant/list/all/company/${companyId}`, { withCredentials: true });
    if (response?.data?.success) {
      setCompanyApplicantsData(response.data.applicants || []);
    }
  } catch (error) {
    console.error("Error fetching applicants by company ID:", error.message);
  }
};

// 2. Get Detailed Applicant DATA from Company (The 'data' specific route)
// This usually returns more populated/statistical info for the dashboard
const getApplicantDATAFromCompanyId = async (companyId) => {
  // If we are the company, we use 'me', otherwise we use the provided ID
  const id = companyId || "me"; 
  try {
    const response = await axios.get(`${serverURL}/job-applicant/list/all/company/${id}/data`, { withCredentials: true });
    if (response?.data?.success) {
      setThisAuthAllApplicants(response.data.allApplicantData || []);
    }
  } catch (error) {
    console.error("Error fetching detailed company applicant data:", error.message);
  }
};

// 3. Get Applicants for a specific Job within a specific Company
const getApplicantFromCompanyIdAndJobId = async (companyId, jobId) => {
  if (!companyId || !jobId) return console.warn("Both Company and Job IDs are required");
  try {
    const response = await axios.get(`${serverURL}/job-applicant/list/all/company/${companyId}/job/${jobId}`, { withCredentials: true });
    if (response?.data?.success) {
      // Reusing singleApplicantData if it returns one, or jobApplicants if it's a list
      // Adjust based on your Controller's return type
      setSingleApplicantData(response.data.applicant); 
    }
  } catch (error) {
    console.error("Error fetching job-specific company applicants:", error.message);
  }
};



// --- [AUTHORITY ENTITY REFINEMENTS] ---

// 1. Remove/Delete Company (Admin or Owner)
const removeCompany = async (authorityId) => {
  if (!authorityId) return console.warn("Authority ID is required for removal");
  try {
    const response = await axios.delete(
      `${serverURL}/authority/list/all/${authorityId}/remove`, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      console.log("Company removed successfully");
      // Refresh the list after deletion
      await getAllAuthorities();
    }
  } catch (error) {
    console.error("Error removing company:", error.response?.data?.message || error.message);
  }
};

// 2. Update Authority Preferred Skills (AI Matching)
// Note: This matches your /list/all/update-skills route
const updateAuthoritiesPreferredSkills = async (skillsArray) => {
  if (!skillsArray) return console.warn("Skills array is required");
  try {
    const response = await axios.put(
      `${serverURL}/authority/list/all/update-skills`, 
      { skills: skillsArray }, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      console.log("Preferred skills updated for matching");
      // Update local authData to reflect new skills
      setAuthData(response.data.authority);
    }
  } catch (error) {
    console.error("Error updating preferred skills:", error.message);
  }
};

// 3. Get Company by Owner (Refining naming consistency)
// Your route uses :ownerId, but our 'getMyCompanyProfile' uses 'me'. 
// Use this version for Admin views or specific owner lookups.
const getCompanyByOwnerId = async (ownerId) => {
  if (!ownerId) return console.warn("Owner ID is required");
  try {
    const response = await axios.get(
      `${serverURL}/authority/list/all/owner/${ownerId}`, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      setOneAuthData(response.data.authority);
    }
  } catch (error) {
    console.error("Error fetching company by owner:", error.message);
  }
};


const [similarJobs, setSimilarJobs] = useState([]); // For "Jobs you might like"
const [reviewQueue, setReviewQueue] = useState([]); // For the Employer's "Review Queue"

// --- [JOB LIFECYCLE & MODERATION] ---

/**
 * 1. Toggle Job Status (Open/Close/Pause)
 * Path: /job/status/toggle/:jobId
 */
const toggleJobStatus = async (jobId) => {
  if (!jobId) return;
  try {
    const response = await axios.patch(`${serverURL}/job/status/toggle/${jobId}`, {}, { withCredentials: true });
    if (response?.data?.success) {
      console.log("Job status updated");
      // Refresh the specific job and the authority's list
      await getSingleJobById(jobId);
      await getJobByAuthority(); 
    }
  } catch (error) {
    console.error("Error toggling job status:", error.message);
  }
};

/**
 * 2. Get Similar Jobs (AI/Contextual matching)
 * Path: /job/list/all/similar/:jobId
 */
const getSimilarJobs = async (jobId) => {
  if (!jobId) return;
  try {
    const response = await axios.get(`${serverURL}/job/list/all/similar/${jobId}`);
    if (response?.data?.success) {
      setSimilarJobs(response.data.jobs || []);
    }
  } catch (error) {
    console.error("Error fetching similar jobs:", error.message);
  }
};

// --- [EMPLOYER REVIEW QUEUE] ---

/**
 * 3. Get Applicants for Review (Persistent Queue)
 * Path: /job/applicants/review/:jobId
 */
const getApplicantsForReview = async (jobId) => {
  if (!jobId) return;
  try {
    const response = await axios.get(`${serverURL}/job/applicants/review/${jobId}`, { withCredentials: true });
    if (response?.data?.success) {
      setReviewQueue(response.data.applicants || []);
    }
  } catch (error) {
    console.error("Error fetching review queue:", error.message);
  }
};

/**
 * 4. Update Application Status (Direct Decision)
 * Path: /job/applicant/decision/:applicantId
 */
const updateApplicationStatus = async (applicantId, status) => {
  // status: 'Accepted', 'Rejected', 'Interviewing', etc.
  try {
    const response = await axios.patch(
      `${serverURL}/job/applicant/decision/${applicantId}`, 
      { status }, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      console.log(`Applicant status updated to ${status}`);
      // Refresh the queue to show updated status badges
      setReviewQueue(prev => prev.map(app => app._id === applicantId ? { ...app, status } : app));
    }
  } catch (error) {
    console.error("Decision Update Error:", error.message);
  }
};

// --- [AUTH REFRESH & SESSION MANAGEMENT] ---

/**
 * 1. Refresh Access Token
 * Usually triggered by an Axios Interceptor on 401 errors.
 * Path: /auth/refresh-token
 */
const refreshSessionToken = async () => {
  try {
    const response = await axios.post(
      `${serverURL}/auth/refresh-token`, 
      {}, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      console.log("Session token refreshed successfully");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Session expired. Please log in again.");
    setIsLoggedIn(false);
    setUser(null);
    return false;
  }
};

useEffect(() => {
  const interceptor = axios.interceptors.response.use(
    (response) => response, // Pass through successful responses
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshed = await refreshSessionToken();

        if (refreshed) {
          // Retry the original request that failed
          return axios(originalRequest);
        }
      }
      return Promise.reject(error);
    }
  );

  return () => axios.interceptors.response.eject(interceptor);
}, []);

/**
 * 2. Logout / Exit Platform
 * Clears HttpOnly Cookies on the server and resets local state.
 * Path: /auth/logout (Ensure this route exists in your backend)
 */
// const exitFromPlatform = async () => {
//   try {
//     const response = await axios.post(
//       `${serverURL}/auth/logout`, 
//       {}, 
//       { withCredentials: true }
//     );

//     if (response?.data?.success) {
//       // 1. Reset all Auth States
//       setUser(null);
//       setIsLoggedIn(false);
//       setUserSeekerData(null);
//       setAuthData(null);
//       setAdminData(null);
      
//       // 2. Clear any lingering non-sensitive storage
//       localStorage.clear(); 
      
//       // 3. Redirect to landing/login
//       navigate("/");
//       console.log("Logged out safely.");
//     }
//   } catch (error) {
//     console.error("Logout failed:", error.message);
//     // Force local reset even if server call fails
//     setIsLoggedIn(false);
//     setUser(null);
//   }
// };



const [myApplications, setMyApplications] = useState([]); // List of jobs applied to
const [applicationDetails, setApplicationDetails] = useState(null); // Specific app status/feedback
const [resumeUpdateStatus, setResumeUpdateStatus] = useState(false);
const [matchedAuthorities, setMatchedAuthorities] = useState([]); // Companies looking for your skills
// *********************** Notification ROutes *************************************************************************************
// --- [SEEKER PROFILE & RESUME] ---

/**
 * 1. Update Resume (Multipart/Form-Data)
 * Path: /applicant/profile/resume-update
 */
const updateSeekerResume = async (formData) => {
  try {
    const response = await axios.patch(
      `${serverURL}/applicant/profile/resume-update`,
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    if (response?.data?.success) {
      setResumeUpdateStatus(true);
      await getMySeekerProfile(); // Refresh profile data
    }
  } catch (error) {
    console.error("Resume Update Error:", error.response?.data?.message);
  }
};

// --- [APPLICATIONS & TRACKING] ---


const getAppliedApplications = async () => {
  try {
    const response = await axios.get(`${serverURL}/applicant/applications`, { withCredentials: true });
    if (response?.data?.success) {
      setMyApplications(response.data.applications || []);
    }
  } catch (error) {
    console.error("Error fetching applications:", error.message);
  }
};

/**
 * 3. Get Specific Application Details (Feedback/Timeline)
 * Path: /applicant/applications/:id
 */
const getApplicationDetails = async (applicationId) => {
  try {
    const response = await axios.get(`${serverURL}/applicant/applications/${applicationId}`, { withCredentials: true });
    if (response?.data?.success) {
      setApplicationDetails(response.data.application);
    }
  } catch (error) {
    console.error("Error fetching application details:", error.message);
  }
};

// --- [AI & MATCHING] ---

/**
 * 4. Get Companies Matching Your Profile (Wanted Authorities)
 * Path: /applicant/authorities/matching/:seekerId
 */
// const getWantedAuthorities = async (seekerId) => {
//   const id = seekerId || userSeekerData?._id;
//   if (!id) return;
//   try {
//     const response = await axios.get(`${serverURL}/applicant/authorities/matching/${id}`, { withCredentials: true });
//     if (response?.data?.success) {
//       setMatchedAuthorities(response.data.authorities || []);
//     }
//   } catch (error) {
//     console.error("Matching Authorities Error:", error.message);
//   }
// };

/**
 * 5. Toggle Save Job (Unified Bookmark Method)
 * Path: /applicant/jobs/save/:jobId
 */
const toggleSaveJob = async (jobId) => {
  try {
    const response = await axios.patch(`${serverURL}/applicant/jobs/save/${jobId}`, {}, { withCredentials: true });
    if (response?.data?.success) {
      // Refresh the saved jobs list
      await getAllSavedJobs();
    }
  } catch (error) {
    console.error("Toggle Save Error:", error.message);
  }
};


const [userSessions, setUserSessions] = useState([]); // Active login sessions
const [publicProfile, setPublicProfile] = useState(null); // For viewing others
const [authError, setAuthError] = useState(null); // For specific login/reset feedback
// Assuming assets.img is your default logo placeholder (if needed)
// --- [ACCOUNT SECURITY & RECOVERY] ---

/**
 * 1. Forgot Password (Request Link)
 * Path: /user/auth/forgot-password
 */
const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${serverURL}/user/auth/forgot-password`, { email });
    if (response?.data?.success) console.log("Reset link sent to email");
  } catch (error) {
    setAuthError(error.response?.data?.message);
  }
};

/**
 * 2. Change Password (While Logged In)
 * Path: /user/change-password
 */
const updateAccountPassword = async (passwords) => {
  // passwords: { oldPassword, newPassword }
  try {
    const response = await axios.patch(`${serverURL}/user/change-password`, passwords, { withCredentials: true });
    if (response?.data?.success) console.log("Password changed successfully");
  } catch (error) {
    console.error("Change Password Error:", error.message);
  }
};

// --- [SESSION & IDENTITY] ---

/**
 * 3. Get Active User Sessions
 * Path: /user/auth/sessions
 */
const getUserSessions = async () => {
  try {
    const response = await axios.get(`${serverURL}/user/auth/sessions`, { withCredentials: true });
    if (response?.data?.success) {
      setUserSessions(response.data.sessions || []);
    }
  } catch (error) {
    console.error("Error fetching sessions:", error.message);
  }
};

/**
 * 4. Deactivate Account (Self-service)
 * Path: /user/deactivate
 */
const deactivateMyAccount = async () => {
  if (!window.confirm("Are you sure? This action is irreversible.")) return;
  try {
    const response = await axios.delete(`${serverURL}/user/deactivate`, { withCredentials: true });
    if (response?.data?.success) {
      await exitFromPlatform(); // Log out and clear state
    }
  } catch (error) {
    console.error("Deactivation Error:", error.message);
  }
};

// --- [PUBLIC DISCOVERY] ---

/**
 * 5. Get Public Profile (By Username)
 * Path: /user/profile/:username
 */
const getPublicUserProfile = async (username) => {
  try {
    const response = await axios.get(`${serverURL}/user/profile/${username}`);
    if (response?.data?.success) {
      setPublicProfile(response.data.user);
    }
  } catch (error) {
    console.error("Profile not found:", error.message);
  }
};
// const companyDataArray = [
//   {
//     owner: "68862d4f6c6f806d4c69e21c",
//     companyEmail: "recruit@innospark.in",
//     companyName: "InnoSpark Solutions",
//     companyLogo: assets.top,
//     companyWebsite: "https://www.innospark.in",
//     companySize: "201-500",
//     industry: "Cloud & AI",
//     location: "Kolkata",
//     contactNumber: "9876700003",
//     about: "Reimagining the future with AI & cloud computing.",
//     preferredSkills: ["AWS", "AI/ML", "Docker"],
//     preferredExperience: 4,
//     jobTypesOffered: ["Office", "Home"]
//   },
//   {
//     owner: "68862d7e6c6f806d4c69e21f",
//     companyEmail: "admin@microgrid.in",
//     companyName: "MicroGrid Systems",
//     companyLogo: assets.top,
//     companyWebsite: "https://www.microgrid.in",
//     companySize: "51-200",
//     industry: "Electronics & Embedded",
//     location: "Kolkata",
//     contactNumber: "9876790003",
//     about: "Smart hardware for a smarter world.",
//     preferredSkills: ["Embedded C", "IoT", "PCB Design"],
//     preferredExperience: 3,
//     jobTypesOffered: ["Office"]
//   },
//   {
//     owner: "68862da66c6f806d4c69e222",
//     companyEmail: "support@edunova.in",
//     companyName: "EduNova Learning",
//    companyLogo: assets.top,
//     companyWebsite: "https://www.edunova.in",
//     companySize: "11-50",
//     industry: "EdTech",
//     location: "Kolkata",
//     contactNumber: "9876760003",
//     about: "Innovating learning experiences for students across India.",
//     preferredSkills: ["HTML", "JavaScript", "Content Writing"],
//     preferredExperience: 2,
//     jobTypesOffered: ["Remote"]
//   },
//   {
//     owner: "68862dc46c6f806d4c69e225",
//     companyEmail: "hello@greenbyte.org",
//     companyName: "GreenByte Solutions",
//     companyLogo: assets.top,
//     companyWebsite: "https://www.greenbyte.org",
//     companySize: "1-10",
//     industry: "Sustainability Tech",
//     location: "Kolkata",
//     contactNumber: "9879760003",
//     about: "Green innovation for a sustainable planet.",
//     preferredSkills: ["Python", "IoT", "Analytics"],
//     preferredExperience: 1,
//     jobTypesOffered: ["Remote", "Home"]
//   },
//   {
//     owner: "68862dea6c6f806d4c69e228",
//     companyEmail: "info@designloom.in",
//     companyName: "DesignLoom Studio",
//     companyLogo: assets.top,
//     companyWebsite: "https://www.designloom.in",
//     companySize: "11-50",
//     industry: "UX/UI Design",
//     location: "Kolkata",
//     contactNumber: "9889760003",
//     about: "Designing seamless user experiences with passion.",
//     preferredSkills: ["Figma", "Adobe XD", "CSS"],
//     preferredExperience: 2,
//     jobTypesOffered: ["Remote"]
//   },
//   {
//     owner: "68862e0e6c6f806d4c69e22b",
//     companyEmail: "recruit@medionet.in",
//     companyName: "MedioNet Health",
//    companyLogo: assets.top,
//     companyWebsite: "https://www.medionet.in",
//     companySize: "201-500",
//     industry: "Health Tech",
//     location: "Kolkata",
//     contactNumber: "9849760003",
//     about: "Technology-driven healthcare access for all.",
//     preferredSkills: ["Java", "Cloud", "Security"],
//     preferredExperience: 3,
//     jobTypesOffered: ["Home", "Remote"]
//   },
//   {
//     owner: "68862e446c6f806d4c69e22f",
//     companyEmail: "admin@edgerise.com",
//     companyName: "EdgeRise Systems",
//     companyLogo: assets.top,
//     companyWebsite: "https://www.edgerise.com",
//     companySize: "500+",
//     industry: "FinTech",
//     location: "Kolkata",
//     contactNumber: "9846760003",
//     about: "Pushing financial services to the bleeding edge.",
//     preferredSkills: ["Blockchain", "Python", "Kubernetes"],
//     preferredExperience: 5,
//     jobTypesOffered: ["Office"]
//   }
// ];

// const jobData = [
//   {
//     "category": "Technology",
//     "title": "Software Developer",
//     "jobRole": "Backend Developer",
//     "description": "Work on backend infrastructure and development for our applications.",
//     "skillsRequired": ["Node.js", "MongoDB", "AWS"],
//     "experienceRequired": "2 years",
//     "jobType": "Full-Time",
//     "salaryRange": "₹5,00,000 - ₹7,00,000",
//     "location": "Westros",
//     "postedBy": "6881f4c78b859887f84a9b2d",
//     "status": "Open",
//     "totalSeats": 3,
//     "deadline": "2025-08-15"
//   },
//   {
//     "category": "Technology",
//     "title": "DevOps Engineer",
//     "jobRole": "Infrastructure Specialist",
//     "description": "Manage deployment pipelines and ensure smooth CI/CD processes.",
//     "skillsRequired": ["Docker", "Kubernetes", "Jenkins"],
//     "experienceRequired": "3 years",
//     "jobType": "Full-Time",
//     "salaryRange": "₹6,00,000 - ₹8,00,000",
//     "location": "Remote",
//     "postedBy": "6881f4c78b859887f84a9b2d",
//     "status": "Open",
//     "totalSeats": 2,
//     "deadline": "2025-08-18"
//   },
//   {
//     "category": "Technology",
//     "title": "System Analyst",
//     "jobRole": "System Consultant",
//     "description": "Analyze and improve system performance and scalability.",
//     "skillsRequired": ["Linux", "Nginx", "Cloud Monitoring"],
//     "experienceRequired": "4 years",
//     "jobType": "Full-Time",
//     "salaryRange": "₹7,00,000 - ₹9,00,000",
//     "location": "Westros",
//     "postedBy": "6881f4c78b859887f84a9b2d",
//     "status": "Open",
//     "totalSeats": 1,
//     "deadline": "2025-08-22"
//   },
//   {
//     "category": "Technology",
//     "title": "AI Developer",
//     "jobRole": "ML Engineer",
//     "description": "Build and optimize machine learning pipelines for smart features.",
//     "skillsRequired": ["Python", "TensorFlow", "Scikit-learn"],
//     "experienceRequired": "3 years",
//     "jobType": "Full-Time",
//     "salaryRange": "₹9,00,000 - ₹12,00,000",
//     "location": "Westros",
//     "postedBy": "6881f4c78b859887f84a9b2d",
//     "status": "Open",
//     "totalSeats": 2,
//     "deadline": "2025-08-25"
//   },
//   {
//     "category": "Technology",
//     "title": "Security Engineer",
//     "jobRole": "Cybersecurity Analyst",
//     "description": "Ensure secure architecture and code audits.",
//     "skillsRequired": ["OWASP", "Burp Suite", "Firewalls"],
//     "experienceRequired": "4 years",
//     "jobType": "Full-Time",
//     "salaryRange": "₹8,00,000 - ₹10,00,000",
//     "location": "Remote",
//     "postedBy": "6881f4c78b859887f84a9b2d",
//     "status": "Open",
//     "totalSeats": 1,
//     "deadline": "2025-08-28"
//   },
//   {
//     "category": "Technology",
//     "title": "Data Engineer",
//     "jobRole": "ETL Developer",
//     "description": "Work with data pipelines and transformation logic.",
//     "skillsRequired": ["SQL", "Apache Airflow", "Hadoop"],
//     "experienceRequired": "2 years",
//     "jobType": "Full-Time",
//     "salaryRange": "₹6,50,000 - ₹8,00,000",
//     "location": "Westros",
//     "postedBy": "6881f4c78b859887f84a9b2d",
//     "status": "Open",
//     "totalSeats": 2,
//     "deadline": "2025-08-17"
//   },
//   {
//     "category": "Technology",
//     "title": "Database Administrator",
//     "jobRole": "DBA",
//     "description": "Maintain and optimize database systems for high performance.",
//     "skillsRequired": ["PostgreSQL", "MongoDB", "Redis"],
//     "experienceRequired": "3 years",
//     "jobType": "Full-Time",
//     "salaryRange": "₹7,00,000 - ₹9,50,000",
//     "location": "Remote",
//     "postedBy": "6881f4c78b859887f84a9b2d",
//     "status": "Open",
//     "totalSeats": 1,
//     "deadline": "2025-08-20"
//   },
//   {
//     "category": "Technology",
//     "title": "Cloud Architect",
//     "jobRole": "AWS Expert",
//     "description": "Design scalable cloud systems and optimize cost-efficiency.",
//     "skillsRequired": ["AWS", "Terraform", "CI/CD"],
//     "experienceRequired": "5 years",
//     "jobType": "Full-Time",
//     "salaryRange": "₹10,00,000 - ₹13,00,000",
//     "location": "Hybrid",
//     "postedBy": "6881f4c78b859887f84a9b2d",
//     "status": "Open",
//     "totalSeats": 1,
//     "deadline": "2025-09-01"
//   },
//   {
//     "category": "Technology",
//     "title": "Software QA Engineer",
//     "jobRole": "Test Automation Engineer",
//     "description": "Design and implement automated test systems.",
//     "skillsRequired": ["Selenium", "Cypress", "Mocha"],
//     "experienceRequired": "2 years",
//     "jobType": "Full-Time",
//     "salaryRange": "₹5,50,000 - ₹7,00,000",
//     "location": "Westros",
//     "postedBy": "6881f4c78b859887f84a9b2d",
//     "status": "Open",
//     "totalSeats": 2,
//     "deadline": "2025-08-26"
//   },
//   {
//     "category": "Technology",
//     "title": "Tech Support Engineer",
//     "jobRole": "Support Analyst",
//     "description": "Help troubleshoot and support application issues.",
//     "skillsRequired": ["Linux", "Shell Scripting", "Debugging"],
//     "experienceRequired": "1 year",
//     "jobType": "Full-Time",
//     "salaryRange": "₹4,00,000 - ₹5,50,000",
//     "location": "Remote",
//     "postedBy": "6881f4c78b859887f84a9b2d",
//     "status": "Open",
//     "totalSeats": 3,
//     "deadline": "2025-08-19"
//   }
// ]




// const uploadAll = async()=>{
//   try {
//     await Promise.all(
//       jobData.map(async (job) => {

//         await     createJob(job);
//       })
//     );
//   } catch (error) {
//     console.log(error);
//   }
// }

// uploadAll();




 

 
  // *********************** ALL EXPORTS *************************************************************************************

   const contextObj = {
  // --- [1. USER & AUTH CORE] ---
  user, isLoggedIn, loading, globalId, registerIndicator,
  checkAuthStatus, registerUser, getUserIdByToken, exitFromPlatform, resetOnExit,

  // --- [2. SEEKER ENTITY] ---
  userSeekerData, seekerData, allSeekersList, dashboardData, initProfileData, 
  singleUserData, suggestedJobsForThisSeeker, savedJobsForThisUser,
  getMySeekerProfile, createSeekerProfile, getSeekerDataById, getSeekerDashboardData, 
  getAllSeekersList, getUserDataBySeekerId, saveJob, getAllSavedJobs, getSuggestedJobsForThisSeeker,seekerProfile,authorityProfile,userData,getUserData,getOtherUserDataById,editProfile,

  // --- [3. AUTHORITY (EMPLOYER) ENTITY] ---
  authData, oneAuthData, allAuthorities, allCompanies, matchedData, 
  allSkills, allCategories, wantedAuth,
  registerForAuthority, getMyCompanyProfile, editAuthProfile, getAuthorityByID, 
  getAllAuthorities, getAllCompanyNames, getMatchedData, getSkills, 
  getWantedAuthorities, getAllCategories,removeCompany,
  updateAuthoritiesPreferredSkills,
  getCompanyByOwnerId,

  // --- [4. EMPLOYEE ENTITY] ---
  allEmployees, singleEmployee, thisJobEmployee, empProfileData, thisAuthAllEmployees,
  getAllEmployee, getEmployeeById, removeEmployee, getEmployeeByJobId, 
  getEmployeeByCompany, getUserDataByEmpId,

  // --- [5. JOB MARKETPLACE] ---
  jobs, allJobs, singleJob, customJobs, requirements,
  createJob, getJobByAuthority, getAllJobsFromDB, deleteJob, 
  getSingleJobById, applyForJob, getCustomJobs, getAllRequirementsForJob,similarJobs,
  reviewQueue,

  // Methods
  toggleJobStatus,
  getSimilarJobs,
  getApplicantsForReview,
  updateApplicationStatus,

  // --- [6. APPLICANTS & HIRING] ---
  allApplicants, singleApplicantData, jobApplicants, applicantId, 
  thisAuthAllApplicants, customSuggestions,
  getAllApplicants, getApplicantById, getApplicantsByJobId, 
  approveApplicant, getAllApplicantsForThisAuth, getCustomSuggestion,
  companyApplicantsData,

  // Methods
  getApplicantFromCompanyId,
  getApplicantDATAFromCompanyId,
  getApplicantFromCompanyIdAndJobId,

  // --- [7. ADMIN & MODERATION] ---
  adminData, allAdmins, allUsersList,
  loginAdmin, getAllAdmins, getAllUsersList, removeUserByID, 
  blockUserByID, removeSeekerByID,pendingAuthorities, flaggedJobs, adminTickets, adminDashboardStats, userLogs,

  // Methods
  updateAdminPassword, getUserActivityLogs, getPendingAuthorities, 
  verifyAuthority, getFlaggedJobs, updateJobStatus, 
  getAllTickets, broadcastNotification, getAdminDashboardStats,

  // --- [8. MESSAGING & NOTIFICATIONS] ---
  allMessages, allPingsForThisUser, typeNotifications, singleNotificationData,
  sendMessage, getMessages, readMessages, getAllPingsByUserId, 
  getNotifications_ByType, getNotificationById,

  // --- [9. ANALYTICS & GRAPHS] ---
  graphData, authorityStats,
  fetchApplicationStatusPie, fetchApplicationsByCategory, fetchApplicationsByDate, 
  fetchApplicationsByLocation, fetchResumeGrade, getApplicantsStatus, 
  getApplicantsStatusWeekly, getApplicationCountPerJob, getApplicationsByLocations, 
  getApplicationsByRoles, getApplicationsByTypes, getApplicationsByCategory,

  // --- [10. UTILITIES] ---
  convertToStandardDateTime,refreshSessionToken,
  myApplications,
  applicationDetails,
  resumeUpdateStatus,
  matchedAuthorities,

  // Methods
  updateSeekerResume,
  getAppliedApplications,
  getApplicationDetails,
  
  toggleSaveJob,userSessions,
  publicProfile,
  authError,

  // Methods
  requestPasswordReset,
  updateAccountPassword,
  getUserSessions,
  deactivateMyAccount,
  getPublicUserProfile
};



  return (
    <WorkContext.Provider value={contextObj}>{children}</WorkContext.Provider>
  );
};
