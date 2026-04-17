import  { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import SHA256 from 'crypto-js/sha256';
import { assets } from "../Authority/assets/assets";
// import { toast } from "react-hot-toast"; // or your specific library
  

export const WorkContext = createContext();

export const WorkContextProvider = ({ children }) => {
  const serverURL = "http://localhost:9000/api";
 
  // *********************** USER ROUTES *************************************************************************************


// --- Clean States ---
const [user, setUser] = useState(null); 
const [seekerProfile, setSeekerProfile] = useState(null);
const [authorityProfile, setAuthorityProfile] = useState(null);
const [registerIndicator, setRegisterIndicator] = useState(false);
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [loading, setLoading] = useState(true); 
const navigate = useNavigate();

// --- The "Source of Truth" Function ---
const checkAuthStatus = async () => {
  try {
    const response = await axios.get(`${serverURL}/user/me`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      const userData = response.data.user;
      setUser(userData);
      setIsLoggedIn(true);

      // --- CRITICAL: Sync profile IDs to states to prevent graph/suggestion errors ---
      // These are ObjectIds (strings) coming from the populated User document
      setSeekerProfile(userData.seekerProfile || null);
      setAuthorityProfile(userData.authorityProfile || null);

    } else {
      resetAuthStates();
    }
  } catch (error) {
    resetAuthStates();
  } finally {
    setLoading(false); 
  }
};

// Helper to clean up states on logout/fail
const resetAuthStates = () => {
  setIsLoggedIn(false);
  setUser(null);
  setSeekerProfile(null);
  setAuthorityProfile(null);
};

// --- Auth Function (Registration/Login) ---
const registerUser = async (data, path) => {
  try {
    // Path will be 'signup' or 'login' 
    const response = await axios.post(
      `${serverURL}/user/auth/${path}`,
      data,
      { withCredentials: true } 
    );

    if (response?.data?.success) {
      const userData = response.data.user;
      
      setUser(userData);
      setIsLoggedIn(true);
      setRegisterIndicator(true);

      // Sync IDs immediately after login/signup
      setSeekerProfile(userData.seekerProfile || null);
      setAuthorityProfile(userData.authorityProfile || null);

      // Navigate to dashboard: /auth/seeker/anubhaw
      navigate(`/auth/${userData.role.toLowerCase()}/${userData?.username}`);
      
      console.log(response.data.message);
    }
  } catch (error) {
    console.error("Auth Error:", error.response?.data?.message || error.message);
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
 const [allUsersList, setAllUsersList] = useState([]);
const [userData, setUserData] = useState(null);

// 1. GET ALL USERS (Admin View)
const getAllUsersList = async () => {
  try {
    // Route updated to match the Admin section of UserRouter
    const response = await axios.get(`${serverURL}/user/admin/all`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setAllUsersList(response.data.users);
    }
  } catch (error) {
    console.error("Error fetching user list:", error.response?.data?.message || error.message);
  }
};

// 2. GET SELF USER DATA (Implicit Identity)
const getUserData = async () => {
  try {
    const response = await axios.get(`${serverURL}/user/me`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setUserData(response.data.user);
    } else {
      setUserData(null);
    }
  } catch (error) {
    console.error("Error fetching self data:", error.response?.data?.message || error.message);
    setUserData(null);
  }
};

// 3. GET OTHER USER BY ID (Admin View)
const getOtherUserDataById = async (userId) => {
  try {
    const response = await axios.get(`${serverURL}/user/admin/user/${userId}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      return response.data.user; 
    }
  } catch (error) {
    console.error("Admin Fetch by ID failed:", error.response?.data?.message || error.message);
  }
};

// 4. REMOVE USER (Admin View)
// --- State for Admin Views ---
const [singleUserData, setSingleUserData] = useState(null);

// 1. REMOVE USER (Admin View)
// No Change needed here from your snippet, but ensuring it's in the final set.
const removeUserByID = async (userId) => {
  try {
    if (!userId) return console.log("User ID is required");

    const response = await axios.delete(`${serverURL}/user/admin/remove/${userId}`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      console.log(response.data.message);
      await getAllUsersList(); 
    }
  } catch (error) {
    console.error("Delete failed:", error.response?.data?.message || error.message);
  }
};

// 2. BLOCK USER (Admin View)
// No Change needed here, just maintaining consistency.
const blockUserByID = async (userId, reason = "Policy Violation") => {
  try {
    if (!userId) return console.log("User ID is required");

    const response = await axios.patch(
      `${serverURL}/user/admin/block/${userId}`, 
      { reason }, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      console.log(response.data.message);
      await getAllUsersList(); 
    }
  } catch (error) {
    console.error("Block failed:", error.response?.data?.message || error.message);
  }
};

// 3. GET USER DATA BY SEEKER ID (Admin View / Identity Resolved)
const getUserDataBySeekerId = async (id) => {
  // If we pass "me", the resolveIdentity middleware handles it.
  if (!id) return console.error("ID is required");

  try {
    const response = await axios.get(
      `${serverURL}/user/admin/seeker/${id}`, 
      { withCredentials: true } 
    );

    if (response?.data?.success) {
      setSingleUserData(response.data.user);
      return response.data.user; // Returning for flexible use in UI components
    }
  } catch (error) {
    console.error("Error fetching seeker-linked data:", error.response?.data?.message || error.message);
    setSingleUserData(null);
  }
};

// 4. EDIT PROFILE (Universal Handler)
const editProfile = async (data) => {
  try {
    // We hit 'update-me' which doesn't require an ID in the URL.
    // The backend uses req.user._id from the cookie.
    const response = await axios.patch(
      `${serverURL}/user/update-me`, 
      data, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      console.log("Profile updated successfully");
      await checkAuthStatus(); // Refresh the global 'user' state
      return true;
    }
  } catch (error) {
    console.error("Edit Profile Error:", error.response?.data?.message || error.message);
    return false;
  }
};


  // ************************ SEEKER ROUTES ************************************************************************************

//  create profile end-point
// --- Clean States ---
const [initProfileData, setInitProfileData] = useState(null);
const [allSeekersList, setAllSeekersList] = useState([]); 
const [seekerData, setSeekerData] = useState(null); // For looking up other seekers (Employer view)
const [userSeekerData, setUserSeekerData] = useState(null); // Logged-in user's seeker profile

// 1. CREATE SEEKER PROFILE (Cookie & Multi-part)
const createSeekerProfile = async (formData) => {
  try {
    const response = await axios.post(
      `${serverURL}/applicant/profile/create`, 
      formData, 
      {
        withCredentials: true, 
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (response?.data?.success) {
      const seekerData = response.data.seeker;
      setUserSeekerData(seekerData); // Sync local state immediately
      await checkAuthStatus(); // Refresh global user object to show seekerProfile ID
      return true;
    } 
  } catch (error) {
    console.error("Profile Creation Error:", error.response?.data?.message || error.message);
    return false;
  }
};

// 2. GET ALL SEEKERS (Discovery List)
const getAllSeekersList = async () => {
  try {
    // Route aligned with: SeekerRouter.get('/all', getAllSeekers);
    const response = await axios.get(`${serverURL}/applicant/all`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setAllSeekersList(response.data.seekers);
    }
  } catch (error) {
    console.error("Error fetching seekers:", error.response?.data?.message || error.message);
  }
};

// 3. GET SEEKER BY ID (Public/Employer View)
const getSeekerDataById = async (id) => {
  if (!id || id === "me") return; // Let getMySeekerProfile handle "me" cases
  
  try {
    // Route aligned with: SeekerRouter.get('/details/:seekerId', getSeekerById);
    const response = await axios.get(`${serverURL}/applicant/details/${id}`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setSeekerData(response.data.seeker);
    }
  } catch (error) {
    console.error("Error fetching seeker by ID:", error.response?.data?.message || error.message);
  }
};

// 4. GET "MY" SEEKER PROFILE (Implicit Identity)
const getMySeekerProfile = async () => {
  // GUARD: Don't fire if not logged in or doesn't have a profile yet to avoid 404 console errors
  if (!isLoggedIn || !user?.seekerProfile) {
    setUserSeekerData(null);
    return;
  }

  try {
    const response = await axios.get(`${serverURL}/applicant/profile/me`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setUserSeekerData(response.data.seeker);
    }
  } catch (error) {
    // Silent fail if it's just a 404 on a fresh account
    if (error.response?.status !== 404) {
        console.error("Error fetching your seeker profile:", error.message);
    }
    setUserSeekerData(null);
  }
};

// 5. UPDATE RESUME (Implicit Identity)
const updateResume = async (formData) => {
    try {
        const response = await axios.patch(
            `${serverURL}/applicant/profile/resume-update`,
            formData,
            {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            }
        );
        if (response.data.success) {
            await getMySeekerProfile(); // Refresh profile to get new resume URL
            return true;
        }
    } catch (error) {
        console.error("Resume Update Error:", error.message);
        return false;
    }
};

// --- Lifecycle: Optimized Seeker Profile Load ---
useEffect(() => {
  if (isLoggedIn && user?.seekerProfile) {
    getMySeekerProfile();
  } else {
    setUserSeekerData(null); // Clear state if logged out
  }
}, [isLoggedIn, user?.seekerProfile]);


  // remove user by id end-point -------->
  const [wantedAuth, setWantedAuth] = useState({
  totalMatches: 0,
  currentPage: null,
  totalPages: 0,
  authorities: [],
});
const [dashboardData, setDashboardData] = useState(null);

// 1. REMOVE SEEKER (Admin/Self with Resolved ID)
const removeSeekerByID = async (id) => {
  try {
    // id can be "me" or a specific ID; resolveIdentity handles it
    const targetId = id || "me";
    
    const response = await axios.delete(`${serverURL}/applicant/remove/${targetId}`, {
      withCredentials: true
    });

    if (response?.data?.success) {
      console.log(response.data.message);
      await getAllSeekersList(); // Refresh the list for Admin
      if (targetId === "me") await checkAuthStatus(); // Refresh user state if deleting self
    }
  } catch (error) {
    console.error("Delete seeker error:", error.response?.data?.message || error.message);
  }
};

// 2. GET WANTED AUTHORITIES (Matching Companies)
const getWantedAuthorities = async (i, j) => {
  // GUARD: Prevents calling matching logic if profile doesn't exist
  if (!isLoggedIn || !user?.seekerProfile) {
    setWantedAuth({ totalMatches: 0, currentPage: 1, totalPages: 0, authorities: [] });
    return;
  }

  try {
    const page = i || 1;
    const limit = j || 10;
    
    // We use the "me" alias which resolveIdentity converts to the real Seeker ID
    const response = await axios.get(
      `${serverURL}/applicant/authorities/matching/me?page=${page}&limit=${limit}`,
      { withCredentials: true }
    );

    if (response?.data?.success) {
      const { totalMatches, currentPage, totalPages, authorities = [] } = response.data;
      setWantedAuth({ totalMatches, currentPage, totalPages, authorities });
    }
  } catch (error) {
    console.error("Matching Authorities Error:", error.message);
  }
};

// 3. GET SEEKER DASHBOARD DATA (Implicit Identity)
const getSeekerDashboardData = async () => {
  // GUARD: If no profile, don't attempt to fetch dashboard metrics
  if (!isLoggedIn || !user?.seekerProfile) {
    setDashboardData("No Profile");
    return;
  }

  try {
    // Identity is resolved via "me" in the router
    const response = await axios.get(
      `${serverURL}/applicant/dashboard/me`, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      setDashboardData(response.data.seeker);
    } else {
      setDashboardData("No Profile");
    }
  } catch (error) {
    // Handle fresh accounts without profiles silently
    if (error.response?.status === 404) {
      setDashboardData("No Profile");
    } else {
      console.error("Dashboard Fetch Error:", error.message);
      setDashboardData(null);
    }
  }
};

// --- Lifecycle: Trigger when user is confirmed logged in and has a profile ---
useEffect(() => {
  if (isLoggedIn && user?.seekerProfile) {
    getSeekerDashboardData();
  } else if (isLoggedIn && !user?.seekerProfile) {
    setDashboardData("No Profile");
  }
}, [isLoggedIn, user?.seekerProfile]);

  // *********************** AUTHORITY ROUTES *************************************************************************************
  

  // --- [STATES: AUTHORITY] ---
const [authData, setAuthData] = useState(null); // The Company Profile
const [allAuthorities, setAllAuthorities] = useState([]); 
const [oneAuthData, setOneAuthData] = useState(null);
const [matchedData, setMatchedData] = useState({
  totalMatches: 0,
  matchedSkills: [],
  seekers: [],
});

// 1. REGISTER AUTHORITY (Multi-part Logo + Cookie)
const registerForAuthority = async (formData) => {
  try {
    const response = await axios.post(
      `${serverURL}/authority/register/new`, 
      formData, 
      {
        withCredentials: true, 
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (response?.data?.success) {
      console.log("Authority Registered:", response.data.message);
      await checkAuthStatus(); // Refresh user state to get authorityProfile ID
      return true;
    } 
  } catch (error) {
    console.error("Authority Registration Error:", error.response?.data?.message || error.message);
    return false;
  }
};

// 2. GET "MY" COMPANY PROFILE (Implicit Identity)
const getMyCompanyProfile = async () => {
  // GUARD: Don't fetch if no user or no authority profile exists yet
  if (!isLoggedIn || !user?.authorityProfile) {
    setAuthData(null);
    return;
  }

  try {
    // Aligned with resolveIdentity handling "me"
    const response = await axios.get(
      `${serverURL}/authority/profile/edit/me`, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      setAuthData(response.data.authority);
    }
  } catch (error) {
    if (error.response?.status !== 404) {
      console.error("Error fetching company profile:", error.message);
    }
    setAuthData(null);
  }
};

// 3. GET ALL COMPANIES (Public Discovery)
const getAllAuthorities = async () => {
  try {
    const response = await axios.get(`${serverURL}/authority/list/all`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setAllAuthorities(response.data.authorities);
    }
  } catch (error) {
    console.error("Error fetching authorities:", error.message);
  }
};

// 4. GET SINGLE COMPANY BY ID (Public Detail View)
const getAuthorityByID = async (id) => {
  if (!id || id === "me") return;

  try {
    const response = await axios.get(`${serverURL}/authority/list/all/${id}`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setOneAuthData(response.data.authority);
    }
  } catch (error) {
    console.error("Error fetching authority detail:", error.message);
    setOneAuthData(null);
  }
};

// 5. GET MATCHING SEEKERS (Uses Resolved ID)
const getMatchedData = async () => {
  // GUARD: Don't attempt matching if company profile isn't set up
  if (!isLoggedIn || !user?.authorityProfile) return;

  try {
    // Calling with "me" tells the backend to resolve to THIS company
    const response = await axios.get(
      `${serverURL}/authority/list/all/seekers/matching-skills/me`,
      { withCredentials: true }
    );

    if (response?.data?.success) {
      setMatchedData({
        matchedSkills: response.data.matchedSkills || [],
        seekers: response.data.seekers || [],
        totalMatches: response.data.totalMatches || 0
      });
    }
  } catch (error) {
    console.error("Matching Error:", error.response?.data?.message || "Error");
  }
};

// 6. EDIT AUTHORITY PROFILE (Cookie-Based & Secure)
const editAuthProfile = async (formData) => {
  if (!formData) return;

  try {
    // Uses "me" endpoint which uses resolveIdentity + verifyJWT
    const response = await axios.put(
      `${serverURL}/authority/profile/edit/me`, 
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response?.data?.success) {
      setAuthData(response.data.authority);
      return response.data;
    }
  } catch (error) {
    console.error("Edit profile error:", error.response?.data?.message || "Error");
  }
};

// --- Lifecycle: Authority Data Sync ---
useEffect(() => {
  if (isLoggedIn && user?.authorityProfile) {
    getMyCompanyProfile();
    getMatchedData(); // Load matches as soon as the dashboard/context is ready
  } else {
    setAuthData(null);
    setMatchedData({ totalMatches: 0, matchedSkills: [], seekers: [] });
  }
}, [isLoggedIn, user?.authorityProfile]);

// --- [FINAL EXPORT] ---

// --- [STATES: AUTHORITY NAMES] ---
const [allCompanies, setAllCompanies] = useState([]); 
const [jobs, setJobs] = useState([]); // Authority's specific postings
const [allJobs, setAllJobs] = useState([]); // Global Marketplace
const [singleJob, setSingleJob] = useState(null); 
const [applicantId, setApplicantId] = useState(null); 

// 1. GET ALL COMPANY NAMES (Discovery/Filters)
const getAllCompanyNames = async () => {
  try {
    const response = await axios.get(`${serverURL}/authority/all/names`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setAllCompanies(response.data.companyNames || []);
    }
  } catch (error) {
    console.error("Error fetching company names:", error.message);
  }
};

// 2. CREATE A NEW JOB (Authority Only)
const createJob = async (jobData) => {
  if (!jobData) return;
  // GUARD: Ensure only an Authority with a profile can post
  if (!user?.authorityProfile) {
    console.warn("You must create an Authority profile before posting jobs.");
    return false;
  }

  try {
    const response = await axios.post(`${serverURL}/job/create/new`, jobData, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      console.log("Job Posted Successfully");
      await getJobByAuthority(); // Refresh the list
      return true;
    }
  } catch (error) {
    console.error("Create Job Error:", error.response?.data?.message || error.message);
    return false;
  }
};

// 3. GET JOBS BY AUTHORITY (My Postings)
const getJobByAuthority = async () => {
  // GUARD: Prevent 404/Cast errors if company profile is missing
  if (!isLoggedIn || !user?.authorityProfile) {
    setJobs([]);
    return;
  }

  try {
    // Route aligned with: JobRouter.get("/my-listings", verifyJWT, getAllJobsByAuthorityId);
    const response = await axios.get(`${serverURL}/job/my-listings`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setJobs(response.data.jobs || []);
    }
  } catch (error) {
    console.error("Error fetching your jobs:", error.message);
  }
};

// 4. GET GLOBAL JOBS (Marketplace)
/**
 * Fetches jobs from the database with support for pagination and filtering.
 * @param {Object} queryParams - Optional filters like { page: 1, limit: 10, category: 'IT' }
 */
// Ensure you have these states defined in your Context Provider
const [totalJobPages, setTotalJobPages] = useState(1);
const [currentJobPage, setCurrentJobPage] = useState(1);

const getAllJobsFromDB = async (queryParams = {}) => {
  try {
    const params = new URLSearchParams(queryParams).toString();
    const response = await axios.get(`${serverURL}/job/list/all?${params}`, { withCredentials: true });

    if (response?.data?.success) {
      setAllJobs(response.data.jobs || []);
      
      // CRITICAL: Update these states from the backend response
      setTotalJobPages(response.data.totalPages || 1); 
      setCurrentJobPage(response.data.currentPage || 1);
    }
  } catch (error) {
    console.error("Marketplace Fetch Error:", error.message);
  }
};

// 5. DELETE JOB
const deleteJob = async (id) => {
  if (!id) return;
  try {
    // Route aligned with: JobRouter.delete("/remove/:jobId", verifyJWT, removeJob);
    const response = await axios.delete(`${serverURL}/job/remove/${id}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setAllJobs((prev) => prev.filter(job => job._id !== id));
      setJobs((prev) => prev.filter(job => job._id !== id));
      return true;
    }
  } catch (error) {
    console.error("Deletion Failed:", error.response?.data?.message);
  }
};

// 6. GET SINGLE JOB DETAILS
const getSingleJobById = async (id) => {
  if (!id) return;
  try {
    const response = await axios.get(`${serverURL}/job/list/all/${id}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setSingleJob(response.data.job);
    }
  } catch (error) {
    console.error("Fetch Single Job Error:", error.message);
  }
};

// 7. APPLY FOR JOB (Seeker Only)
const applyForJob = async (jobId) => {
  try {
    const response = await axios.post(`${serverURL}/job/apply/${jobId}`, {}, { 
      withCredentials: true // MANDATORY: Sends the JWT cookie to the server
    });

    if (response.data.success) {
      toast.success("Applied successfully!");
      // Optionally refresh the single job data to update applicant count
      getSingleJobById(jobId);
      return true;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to apply";
    console.error("Apply Error:", errorMsg);
    toast.error(errorMsg);
    return false;
  }
};

// --- Lifecycle Sync ---
useEffect(() => {
  if (isLoggedIn && user?.authorityProfile) {
    getJobByAuthority();
  }
}, [isLoggedIn, user?.authorityProfile]);

// --- [FINAL CONSOLIDATED EXPORT] ---

  // *********************** APPLICANT ROUTES *************************************************************************************
 // --- [STATES: APPLICANTS & HIRING] ---
const [allApplicants, setAllApplicants] = useState([]);
const [singleApplicantData, setSingleApplicantData] = useState(null);
const [jobApplicants, setJobApplicants] = useState([]);
const [adminData, setAdminData] = useState(null);
const [allAdmins, setAllAdmins] = useState([]);

// --- [METHODS: APPLICANTS & HIRING] ---

// 1. Get All Applicants (Global Admin View)
const getAllApplicants = async () => {
  try {
    // Aligned with: ApplicantRouter.get('/list/all', getAllApplicant)
    const response = await axios.get(`${serverURL}/job-applicant/list/all`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setAllApplicants(response.data.applicants || []);
    }
  } catch (error) {
    console.error("Error fetching all applicants:", error.message);
  }
};

// 2. Flexible Applicant Fetch (by ID, Seeker, or Company)
const getApplicantById = async (id, indicator) => {
  if (!id || !indicator) return;
  
  // Logic updated to use the 'me' resolution where applicable
  let endpoint = "";
  if (indicator === 1) endpoint = `/job-applicant/list/all/${id}`; // Specific Applicant ID
  else if (indicator === 2) endpoint = `/job-applicant/list/all/seeker/${id}`; // "me" or SeekerID
  else if (indicator === 3) endpoint = `/job-applicant/list/all/company/${id}`; // "me" or CompanyID
  else return;

  try {
    const response = await axios.get(`${serverURL}${endpoint}`, { withCredentials: true });
    if (response?.data?.success) {
      setSingleApplicantData(response.data.applicant || response.data.applicants);
    }
  } catch (error) {
    console.error("Error fetching applicant details:", error.message);
  }
};

// 3. Get Applicants for a Specific Job (Employer Dashboard)
const getApplicantsByJobId = async (id) => {
  if (!id) return;
  try {
    // Aligned with: ApplicantRouter.get('/list/all/job/:jobId', getApplicantFromJobId)
    const response = await axios.get(`${serverURL}/job-applicant/list/all/job/${id}`, { 
      withCredentials: true 
    });
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
  if (!['accept', 'reject'].includes(action)) return;

  try {
    // Aligned with: ApplicantRouter.post('/list/all/applicant/:applicantId/job/:jobId/accept', acceptApplicant)
    const response = await axios.post(
      `${serverURL}/job-applicant/list/all/applicant/${applicantId}/job/${jobId}/${action}`,
      {},
      { withCredentials: true }
    );

    if (response?.data?.success) {
      console.log(`Applicant ${action}ed`);
      
      // Update local state immediately for UI responsiveness
      setJobApplicants((prev) => 
        prev.map(app => app._id === applicantId ? { ...app, status: action === 'accept' ? 'Accepted' : 'Rejected' } : app)
      );
      return true;
    }
  } catch (error) {
    console.error(`Error during applicant ${action}:`, error.response?.data?.message);
    return false;
  }
};

// --- [METHODS: ADMIN] ---

// 1. Admin Login (Cookie-Based)
const loginAdmin = async (data) => {
  try {
    const response = await axios.post(`${serverURL}/admin/existing/login`, data, {
      withCredentials: true,
    });

    if (response?.data?.success) {
      const admin = response.data.admin;
      setAdminData(admin);
      setIsLoggedIn(true);
      setUser(admin);

      // Backend secureHash used for URL structure
      navigate(`/auth/admin/${admin.username}`);
      console.log("Admin logged in");
    }
  } catch (error) {
    console.error("Admin login failed:", error.response?.data?.message);
  }
};

// 2. List All Admins (Protected)
const getAllAdmins = async () => {
  try {
    const response = await axios.get(`${serverURL}/admin/list/all`, {
      withCredentials: true,
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
  
  const [allEmployees, setAllEmployees] = useState([]);
const [singleEmployee, setSingleEmployee] = useState(null);
const [thisJobEmployee, setThisJobEmployee] = useState(null);
const [empProfileData, setEmpProfileData] = useState(null);
const [thisAuthAllEmployees, setThisAuthAllEmployees] = useState([]);
const [allCategories, setAllCategories] = useState([]);

// 1. GET ALL EMPLOYEES (Admin View)
const getAllEmployee = async () => {
  try {
    const response = await axios.get(`${serverURL}/employee/list/all`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setAllEmployees(response.data.employees);
    }
  } catch (error) {
    console.error("Error fetching all employees:", error.message);
  }
};

// 2. GET EMPLOYEE BY ID
const getEmployeeById = async (id) => {
  if (!id) return;
  try {
    const response = await axios.get(`${serverURL}/employee/list/all/${id}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setSingleEmployee(response.data.employee);
    }
  } catch (error) {
    console.error("Error fetching employee:", error.message);
  }
};

// 3. REMOVE EMPLOYEE
const removeEmployee = async (id) => {
  if (!id) return;
  try {
    const response = await axios.delete(`${serverURL}/employee/list/all/${id}/remove`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      console.log("Employee Deleted Successfully");
      setAllEmployees((prev) => prev.filter(emp => emp._id !== id));
    }
  } catch (error) {
    console.error("Delete Error:", error.message);
  }
};

// 4. GET EMPLOYEE BY JOB ID (Authority Dashboard)
const getEmployeeByJobId = async (id) => {
  if (!id) return;
  try {
    const response = await axios.get(`${serverURL}/employee/list/all/job/${id}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setThisJobEmployee(response.data.employee);
    }
  } catch (error) {
    console.error("Job Employee Fetch Error:", error.message);
  }
};

// 5. GET USER DATA LINKED TO EMPLOYEE ID
const getUserDataByEmpId = async (id) => {
  if (!id) return;
  try {
    const response = await axios.get(`${serverURL}/employee/profile-data/${id}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setEmpProfileData(response.data.empData);
    }
  } catch (error) {
    console.error("Employee Profile Data Error:", error.message);
  }
};

// 6. GET ALL EMPLOYEES FOR A COMPANY (Authority View)
const getEmployeeByCompany = async (id) => {
  // Use "me" for resolveIdentity or the passed ID
  const targetId = id || "me";
  
  // GUARD: Don't fetch if company profile doesn't exist yet
  if (targetId === "me" && !user?.authorityProfile) return;

  try {
    const response = await axios.get(`${serverURL}/employee/list/all/company/${targetId}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setThisAuthAllEmployees(response.data.employee || []);
    }
  } catch (error) {
    console.error("Company Employees Fetch Error:", error.message);
  }
};

// 7. GET UNIQUE CATEGORIES (Discovery)
const getAllCategories = async () => {
  try {
    const response = await axios.get(`${serverURL}/job/categories`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setAllCategories(response.data.categories);
    }
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }
};

// *********************** UTILITY *************************************************************************************

function convertToStandardDateTime(isoString) {
  if (!isoString) return 'Invalid Date';
  const dateObj = new Date(isoString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObj.toLocaleDateString('en-US', options);

  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${formattedDate}, ${hours}:${minutes} ${period}`;
}

// --- [FINAL CONSOLIDATED EXPORT] ---



// --- [STATES: SAVED JOBS] ---
const [savedJobsForThisUser, setSavedJobsForThisUser] = useState([]); 
const [typeNotifications, setTypeNotifications] = useState([]); // Array-first
const [singleNotificationData, setSingleNotificationData] = useState(null);
const [requirements, setRequirements] = useState([]); 
const [customJobs, setCustomJobs] = useState([]);

// 1. SAVE/BOOKMARK A JOB (Seeker Only)
const saveJob = async (jobId) => {
  if (!jobId) return;
  // GUARD: Only seekers with profiles can bookmark
  if (!user?.seekerProfile) {
    console.warn("Please complete your seeker profile to save jobs.");
    return;
  }

  try {
    // Aligned with JobRouter: .put("/save/:jobId", verifyJWT, saveJob)
    const response = await axios.put(
      `${serverURL}/job/save/${jobId}`, 
      {},  
      { withCredentials: true }
    );

    if (response?.data?.success) {
      console.log("Job bookmark toggled");
      await getAllSavedJobs(); // Refresh the list
    }
  } catch (error) {
    console.error("Save Job Error:", error.response?.data?.message || error.message);
  }
};

// 2. GET ALL SAVED JOBS (Implicit Identity)
const getAllSavedJobs = async () => {
  // GUARD: Don't fire if not a seeker or profile missing to prevent 404 spam
  if (!isLoggedIn || !user?.seekerProfile) {
    setSavedJobsForThisUser([]);
    return;
  }

  try {
    // Aligned with JobRouter: .get("/saved-list", verifyJWT, getSavedJobBySeekerId)
    const response = await axios.get(`${serverURL}/job/saved-list`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setSavedJobsForThisUser(response.data.savedJobs || []);
    }
  } catch (error) {
    // Silent fail for new accounts
    if (error.response?.status !== 404) {
      console.error("Error fetching saved jobs:", error.message);
    }
    setSavedJobsForThisUser([]);
  }
};

// 3. GET NOTIFICATIONS BY TYPE
const getNotifications_ByType = async (typesArray) => {
  if (!Array.isArray(typesArray) || !isLoggedIn) return;

  try {
    const requests = typesArray.map((type) =>
      axios.get(`${serverURL}/notification/list/all/${type}`, { withCredentials: true })
    );

    const responses = await Promise.all(requests);
    const allNotifications = responses
      .filter((res) => res.data.success && res.data.notifications)
      .flatMap((res) => res.data.notifications);

    setTypeNotifications(allNotifications);
  } catch (error) {
    console.error("Notification Fetch Error:", error.message);
  }
};

// 4. GET NOTIFICATION BY ID
const getNotificationById = async (id) => {
  if (!id) return;
  try {
    const response = await axios.get(`${serverURL}/notification/list/all/${id}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setSingleNotificationData(response.data.notification);
    }
  } catch (error) {
    console.error("Notification Detail Error:", error.message);
  }
};

// 5. GET FILTER REQUIREMENTS (Locations, Skills, Roles)
const getAllRequirementsForJob = async () => {
  try {
    const response = await axios.get(`${serverURL}/job/list/all/requirements`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setRequirements(response.data.categories || []);
    }
  } catch (error) {
    console.error("Requirements Error:", error.message);
  }
};

// 6. GET CUSTOM FILTERED JOBS (Search Engine)
const getCustomJobsList = async (query) => {
  try {
    // query is passed as "location=Kolkata&role=Developer"
    const response = await axios.get(`${serverURL}/job/list/all/custom-query?${query}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setCustomJobs(response.data.jobs || []);
    }
  } catch (error) {
    console.error("Search Error:", error.message);
    setCustomJobs([]);
  }
};

// --- Lifecycle Sync ---
useEffect(() => {
  if (isLoggedIn && user?.seekerProfile) {
    getAllSavedJobs();
  }
}, [isLoggedIn, user?.seekerProfile]);

// --- [FINAL CONSOLIDATED EXPORT] ---





 

// --- [STATES: SKILLS & RECRUITMENT] ---
const [allSkills, setAllSkills] = useState([]);
const [customSuggestions, setCustomSuggestions] = useState([]); 
const [thisAuthAllApplicants, setThisAuthAllApplicants] = useState([]); 

// 1. LOGOUT (The "Final Exit" - Cookie Based)
const logout = async () => {
  try {
    // 1. Hit the backend to clear cookies
    await axios.post(`${serverURL}/user/auth/logout`, {}, { withCredentials: true });
    
    // 2. Clear all local states
    setUser(null);
    setIsLoggedIn(false);
    setUserSeekerData(null);
    setAuthData(null);
    setAdminData(null);
    setAllUsersList([]);
    setAllSeekersList([]);
    setJobs([]);
    setSavedJobsForThisUser([]);
    setThisAuthAllApplicants([]);
    setRegisterIndicator(false);
    
    // 3. Clear storage (if you still use it for non-sensitive theme settings etc.)
    localStorage.clear();

    // 4. Redirect to login
    navigate("/login");
    console.log("✅ Successfully logged out and session cleared.");
  } catch (error) {
    console.error("Logout failed:", error.message);
    // Force local clear even if server call fails
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  }
};

// 2. GET ALL SKILLS (Discovery/Filters)
const getSkills = async () => {
  try {
    // Aligned with SeekerRouter factors endpoint
    const response = await axios.get(`${serverURL}/applicant/factors`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      // Accessing the aggregated skills list
      setAllSkills(response.data.factors.skills || []);
    }
  } catch (error) {
    console.error("Error fetching skills:", error.message);
  }
};

// 3. CUSTOM SEEKER SEARCH (Recruiter Tool)
const getCustomSuggestion = async (query) => {
  try {
    // Aligned with SeekerRouter search endpoint
    const response = await axios.get(`${serverURL}/applicant/search?${query}`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setCustomSuggestions(response.data.seekers || []);
    }
  } catch (error) {
    console.error("Search Error:", error.message);
    setCustomSuggestions([]);
  }
};

// 4. GET ALL APPLICANTS FOR THIS AUTHORITY (Implicit Identity)
const getAllApplicantsForThisAuth = async () => {
  // GUARD: Don't fire if no company profile exists
  if (!isLoggedIn || !user?.authorityProfile) return;

  try {
    // Aligned with ApplicantRouter: .get('/data/me', verifyJWT, getApplicantDATAFromCompanyId)
    // Note: This endpoint provides the "Enriched" seeker details for the review dashboard
    const response = await axios.get(`${serverURL}/job-applicant/data/me`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setThisAuthAllApplicants(response.data.allApplicantData || []);
    }
  } catch (error) {
    // Silent fail for new authorities
    if (error.response?.status !== 404) {
      console.error("Authority Applicant Fetch Error:", error.message);
    }
  }
};

// --- Lifecycle Sync ---
useEffect(() => {
  if (isLoggedIn && user?.authorityProfile) {
    getAllApplicantsForThisAuth();
  }
}, [isLoggedIn, user?.authorityProfile]);




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
    // Return null silently to avoid cluttering console for non-profile users
    return null;
  }
};

// --- [METHODS: ANALYTICS - SEEKER FOCUS] ---

// 1. Fetch Pie Chart Data - Application Status
const fetchApplicationStatusPie = async () => {
  if (!isLoggedIn || !user?.seekerProfile) return;
  try {
    const response = await axios.get(`${serverURL}/graph/seeker/status`, { withCredentials: true });
    const data = await validateResponse(response);
    if (data) setGraphData((prev) => ({ ...prev, pie: data }));
  } catch (error) {
    console.error("Pie data error:", error.message);
  }
};

// 2. Fetch Line Chart Data - Applications by Date
const fetchApplicationsByDate = async () => {
  if (!isLoggedIn || !user?.seekerProfile) return;
  try {
    const response = await axios.get(`${serverURL}/graph/seeker/status/date`, { withCredentials: true });
    const data = await validateResponse(response);
    if (data) setGraphData((prev) => ({ ...prev, line: data }));
  } catch (error) {
    console.error("Line data error:", error.message);
  }
};

// 3. Fetch Bar Chart Data - Applications by Category
const fetchApplicationsByCategory = async () => {
  if (!isLoggedIn || !user?.seekerProfile) return;
  try {
    const response = await axios.get(`${serverURL}/graph/seeker/status/category`, { withCredentials: true });
    const data = await validateResponse(response);
    if (data) setGraphData((prev) => ({ ...prev, bar: data }));
  } catch (error) {
    console.error("Bar data error:", error.message);
  }
};

// 4. Fetch Horizontal Bar Chart - Applications by Location
const fetchApplicationsByLocation = async () => {
  if (!isLoggedIn || !user?.seekerProfile) return;
  try {
    const response = await axios.get(`${serverURL}/graph/seeker/status/location`, { withCredentials: true });
    const data = await validateResponse(response);
    if (data) setGraphData((prev) => ({ ...prev, horBar: data }));
  } catch (error) {
    console.error("Location data error:", error.message);
  }
};

// 5. Fetch Radar Chart - Resume Score Breakdown
const fetchResumeGrade = async () => {
  if (!isLoggedIn || !user?.seekerProfile) return;
  try {
    const response = await axios.get(`${serverURL}/graph/seeker/profile-grade`, { withCredentials: true });
    const data = await validateResponse(response);
    if (data) setGraphData((prev) => ({ ...prev, grade: data }));
  } catch (error) {
    console.error("Grade data error:", error.message);
  }
};

// --- [LIFECYCLE] ---
useEffect(() => {
  // Only trigger fetches if the user is a Seeker AND has a profile
  if (isLoggedIn && user?.role === "Seeker" && user?.seekerProfile) {
    fetchApplicationStatusPie();
    fetchApplicationsByDate();
    fetchApplicationsByCategory();
    fetchApplicationsByLocation();
    fetchResumeGrade();
  } else {
    // Reset data if logged out or no profile
    setGraphData({ pie: null, bar: null, line: null, horBar: null, grade: null, brief: null });
  }
}, [isLoggedIn, user?.role, user?.seekerProfile]);

// --- [STATES: RECOMMENDATIONS] ---
const [suggestedJobsForThisSeeker, setSuggestedJobsForThisSeeker] = useState({
  suggestedJobs: [],
  totalMatches: 0, 
});

const [authorityStats, setAuthorityStats] = useState({
  status: null,   
  weekly: null,   
  perJob: null,   
  location: null, 
  role: null,     
  type: null,     
  category: null  
});

// --- [METHODS: RECOMMENDATIONS] ---

// 1. Get Personalized Job Feed (Implicit Identity)
const getSuggestedJobsForThisSeeker = async () => {
  // GUARD: Don't fire if seeker profile doesn't exist to prevent 404/Cast errors
  if (!isLoggedIn || !user?.seekerProfile) {
    setSuggestedJobsForThisSeeker({ suggestedJobs: [], totalMatches: 0 });
    return;
  }

  try {
    const response = await axios.get(
      `${serverURL}/dashboard/suggested-jobs/me`, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      const { suggestedJobs, totalMatches } = response.data;
      setSuggestedJobsForThisSeeker({
        suggestedJobs: suggestedJobs || [],
        totalMatches: totalMatches || 0,
      });
    }
  } catch (error) {
    // Silent fail for profile-less accounts
    if (error.response?.status !== 404) {
      console.error("Error fetching recommendations:", error.message);
    }
    setSuggestedJobsForThisSeeker({ suggestedJobs: [], totalMatches: 0 });
  }
};

// --- [METHODS: AUTHORITY ANALYTICS] ---

const fetchAuthorityAnalytics = async (endpoint, key) => {
  // GUARD: Don't fire if authority profile doesn't exist
  if (!isLoggedIn || !user?.authorityProfile) return;

  try {
    // Aligned with GraphRouter: /graph/authority/...
    const response = await axios.get(`${serverURL}/graph/authority/${endpoint}`, { 
      withCredentials: true 
    });
    
    if (response?.data?.success) {
      setAuthorityStats(prev => ({ ...prev, [key]: response.data.data }));
    }
  } catch (error) {
    console.error(`Error fetching ${key} stats:`, error.message);
  }
};

// Wrapper triggers
const getApplicantsStatus = () => fetchAuthorityAnalytics('count/status', 'status');
const getApplicantsStatusWeekly = () => fetchAuthorityAnalytics('count/weekly', 'weekly');
const getApplicationCountPerJob = () => fetchAuthorityAnalytics('count', 'perJob');
const getApplicationsByLocations = () => fetchAuthorityAnalytics('count/location', 'location');
const getApplicationsByRoles = () => fetchAuthorityAnalytics('count/role', 'role');
const getApplicationsByTypes = () => fetchAuthorityAnalytics('count/type', 'type');
const getApplicationsByCategory = () => fetchAuthorityAnalytics('count/category', 'category');

// --- [LIFECYCLE] ---
useEffect(() => {
  if (isLoggedIn && user?.role === "Seeker" && user?.seekerProfile) {
    getSuggestedJobsForThisSeeker();
  }
}, [isLoggedIn, user?.role, user?.seekerProfile]);

useEffect(() => {
  if (isLoggedIn && user?.role === "Authority" && user?.authorityProfile) {
    getApplicantsStatus();
    getApplicantsStatusWeekly();
    getApplicationCountPerJob();
    getApplicationsByLocations();
    getApplicationsByRoles();
    getApplicationsByTypes();
    getApplicationsByCategory();
  } else {
    // Reset stats if logged out or role changed
    setAuthorityStats({ status: null, weekly: null, perJob: null, location: null, role: null, type: null, category: null });
  }
}, [isLoggedIn, user?.role, user?.authorityProfile]);
// --- [FINAL CONSOLIDATED EXPORT] ---


// *********************** <MEssage> ROutes *************************************************************************************
const [allMessages, setAllMessages] = useState([]);
const [allPingsForThisUser, setAllPingsForThisUser] = useState([]);
const [pendingAuthorities, setPendingAuthorities] = useState([]);
const [flaggedJobs, setFlaggedJobs] = useState([]);
const [userLogs, setUserLogs] = useState([]);

// --- [METHODS: MESSAGING - IMPLICIT IDENTITY] ---

// 1. Get Messages between Me and another User
const getMessages = async (otherUserId) => {
  if (!otherUserId) return;

  try {
    // The backend uses req.user._id (from cookie) as the sender/receiver 
    // and the param as the counterpart.
    const response = await axios.get(`${serverURL}/message/all/${otherUserId}`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setAllMessages(response.data.data || []);
    }
  } catch (error) {
    console.error("Fetch Messages Error:", error.message);
    setAllMessages([]);
  }
};

// 2. Send Message
const sendMessage = async (receiverId, messageContent) => {
  if (!receiverId || !messageContent) return;

  try {
    const response = await axios.post(`${serverURL}/message/send`, 
      { receiverId, text: messageContent }, 
      { withCredentials: true }
    );

    if (response?.data?.success) {
      await getMessages(receiverId); // Refresh conversation
      return true;
    }
  } catch (error) {
    console.error("Send Message Error:", error.message);
    return false;
  }
};

// 3. Get All Pings (Chat List/Inbox)
const getAllPings = async () => {
  if (!isLoggedIn) return;
  try {
    // Backend identifies "Me" via cookie and finds all users I have chats with
    const response = await axios.get(`${serverURL}/message/inbox`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setAllPingsForThisUser(response.data.users || []);
    }
  } catch (error) {
    console.error("Inbox Fetch Error:", error.message);
  }
};

// 4. Mark Messages as Read
const markAsRead = async (senderId) => {
  try {
    await axios.put(`${serverURL}/message/read/${senderId}`, {}, { 
      withCredentials: true 
    });
    await getMessages(senderId);
  } catch (err) {
    console.error("Read status update failed", err);
  }
};

// --- [METHODS: ADMIN MODERATION] ---

// 1. Update Admin Password (Implicit Identity)
const updateAdminPassword = async (data) => {
  try {
    const response = await axios.patch(`${serverURL}/admin/update-password`, data, { 
      withCredentials: true 
    });
    if (response?.data?.success) console.log("Password updated successfully");
  } catch (error) {
    console.error("Password Update Error:", error.response?.data?.message);
  }
};

// 2. Get User Activity Logs (Admin Only)
const getUserActivityLogs = async (userId) => {
  try {
    const response = await axios.get(`${serverURL}/admin/users/${userId}/logs`, { 
      withCredentials: true 
    });
    if (response?.data?.success) setUserLogs(response.data.logs || []);
  } catch (error) {
    console.error("Error fetching user logs:", error.message);
  }
};

// 3. Authority Moderation
const getPendingAuthorities = async () => {
  try {
    const response = await axios.get(`${serverURL}/admin/authorities/pending`, { 
      withCredentials: true 
    });
    if (response?.data?.success) setPendingAuthorities(response.data.authorities || []);
  } catch (error) {
    console.error("Error fetching pending authorities:", error.message);
  }
};

const verifyAuthority = async (id, status) => {
  try {
    const response = await axios.patch(`${serverURL}/admin/authorities/${id}/verify`, 
      { status }, 
      { withCredentials: true }
    );
    if (response?.data?.success) await getPendingAuthorities();
  } catch (error) {
    console.error("Verification Error:", error.message);
  }
};

// 4. Job Moderation
const getFlaggedJobs = async () => {
  try {
    const response = await axios.get(`${serverURL}/admin/jobs/flagged`, { 
      withCredentials: true 
    });
    if (response?.data?.success) setFlaggedJobs(response.data.jobs || []);
  } catch (error) {
    console.error("Error fetching flagged jobs:", error.message);
  }
};

// --- Support & Global Comm ---
const [adminTickets, setAdminTickets] = useState([]);
const [adminDashboardStats, setAdminDashboardStats] = useState(null);
const [companyApplicantsData, setCompanyApplicantsData] = useState([]);

// --- [ADMIN MODERATION & TICKETS] ---

// 1. Get All Admin Support Tickets
const getAllTickets = async () => {
  try {
    const response = await axios.get(`${serverURL}/admin/tickets`, { withCredentials: true });
    if (response?.data?.success) {
      setAdminTickets(response.data.tickets || []);
    }
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
  }
};

// 2. Broadcast Notification (Admin to All)
const broadcastNotification = async (notifData) => {
  if (!notifData) return;
  try {
    const response = await axios.post(`${serverURL}/admin/notifications/broadcast`, notifData, { withCredentials: true });
    if (response?.data?.success) console.log("📢 Broadcast successful");
  } catch (error) {
    console.error("Broadcast Error:", error.message);
  }
};

// 3. Admin Overview Analytics
const getAdminDashboardStats = async () => {
  try {
    const response = await axios.get(`${serverURL}/admin/stats/overview`, { withCredentials: true });
    if (response?.data?.success) {
      setAdminDashboardStats(response.data.stats);
    }
  } catch (error) {
    console.error("Stats Error:", error.message);
  }
};

// 4. THE MISSING ONE: Update Job Status (Moderation)
const updateJobStatus = async (jobId, status) => {
  if (!jobId || !status) return;
  try {
    // Matches: UserRouter -> /admin/jobs/:jobId/status
    const response = await axios.patch(
      `${serverURL}/admin/jobs/${jobId}/status`, 
      { status }, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      console.log(`Job status updated to ${status}`);
      await getFlaggedJobs(); // Refresh the moderation list
      return true;
    }
  } catch (error) {
    console.error("Status Update Error:", error.message);
    return false;
  }
};

// --- [APPLICANTS & HIRING REFINEMENTS] ---

// 1. Get ALL Applicants for a specific Company (Public/Admin view)
const getApplicantFromCompanyId = async (companyId) => {
  // Use resolveIdentity via "me" or a specific ID
  const targetId = companyId || "me";
  
  // GUARD: Don't fire if no company profile exists
  if (targetId === "me" && !user?.authorityProfile) return;

  try {
    const response = await axios.get(`${serverURL}/job-applicant/list/all/company/${targetId}`, { withCredentials: true });
    if (response?.data?.success) {
      setCompanyApplicantsData(response.data.applicants || []);
    }
  } catch (error) {
    console.error("Error fetching applicants by company ID:", error.message);
  }
};

// 2. Get ENRICHED Applicant DATA from Company (Employer Dashboard)
const getApplicantDATAFromCompanyId = async (companyId) => {
  const targetId = companyId || "me";
  
  if (targetId === "me" && !user?.authorityProfile) return;

  try {
    // This route usually returns full seeker profiles for the hiring desk
    const response = await axios.get(`${serverURL}/job-applicant/data/${targetId}`, { withCredentials: true });
    if (response?.data?.success) {
      setThisAuthAllApplicants(response.data.allApplicantData || []);
    }
  } catch (error) {
    console.error("Error fetching detailed company applicant data:", error.message);
  }
};

// 3. Get Applicants for a specific Job within a Company
const getApplicantFromCompanyIdAndJobId = async (companyId, jobId) => {
  const targetId = companyId || "me";
  if (!jobId) return;

  try {
    const response = await axios.get(
      `${serverURL}/job-applicant/list/all/company/${targetId}/job/${jobId}`, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      setSingleApplicantData(response.data.applicant); 
    }
  } catch (error) {
    console.error("Error fetching job-specific company applicants:", error.message);
  }
};

// --- [AUTHORITY ENTITY REFINEMENTS] ---

// 1. Remove/Delete Company (Admin or Owner)
const [similarJobs, setSimilarJobs] = useState([]);
const [reviewQueue, setReviewQueue] = useState([]);

// --- [AUTHORITY MANAGEMENT] ---

// 1. Remove Company (Admin View)
const removeCompany = async (authorityId) => {
  if (!authorityId) return;
  try {
    // Aligned with AuthorityRouter: /authority/remove/:authorityId
    const response = await axios.delete(
      `${serverURL}/authority/remove/${authorityId}`, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      console.log("Company removed");
      await getAllAuthorities(); // Refresh discovery list
    }
  } catch (error) {
    console.error("Removal Error:", error.response?.data?.message || error.message);
  }
};

// 2. Update Authority Preferred Skills (AI Matching)
const updateAuthoritiesPreferredSkills = async (skillsArray) => {
  if (!skillsArray) return;
  // GUARD: Don't fire if no authority profile exists
  if (!user?.authorityProfile) return;

  try {
    // Aligned with "me" resolution for current logged-in company
    const response = await axios.put(
      `${serverURL}/authority/profile/update-skills/me`, 
      { skills: skillsArray }, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      console.log("Skills updated for AI matching");
      setAuthData(response.data.authority);
    }
  } catch (error) {
    console.error("Skill Update Error:", error.message);
  }
};

// 3. Get Company by Owner ID (Admin/Specific Lookup)
const getCompanyByOwnerId = async (ownerId) => {
  if (!ownerId) return;
  try {
    const response = await axios.get(
      `${serverURL}/authority/owner/${ownerId}`, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      setOneAuthData(response.data.authority);
    }
  } catch (error) {
    console.error("Owner lookup error:", error.message);
  }
};

// --- [JOB LIFECYCLE & REVIEW] ---

// 4. Toggle Job Status (Open/Close/Pause)
const toggleJobStatus = async (jobId) => {
  if (!jobId) return;
  try {
    // Aligned with JobRouter: /job/status/toggle/:jobId
    const response = await axios.patch(
      `${serverURL}/job/status/toggle/${jobId}`, 
      {}, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      console.log("Job status toggled");
      await getSingleJobById(jobId);
      await getJobByAuthority(); 
    }
  } catch (error) {
    console.error("Toggle error:", error.message);
  }
};

// 5. Get Similar Jobs (AI Matching)
const getSimilarJobs = async (jobId) => {
  if (!jobId) return;
  try {
    const response = await axios.get(`${serverURL}/job/list/all/similar/${jobId}`);
    if (response?.data?.success) {
      setSimilarJobs(response.data.jobs || []);
    }
  } catch (error) {
    console.error("Similar Jobs error:", error.message);
  }
};

// 6. Get Applicants for Review (Authority Queue)
const getApplicantsForReview = async (jobId) => {
  if (!jobId) return;
  try {
    // Hits the job-applicant router for a specific job's applicants
    const response = await axios.get(
      `${serverURL}/job-applicant/list/all/job/${jobId}`, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      setReviewQueue(response.data.applicants || []);
    }
  } catch (error) {
    console.error("Review Queue error:", error.message);
  }
};

// 7. Update Application Status (Hiring Decision)
const updateApplicationStatus = async (applicantId, status) => {
  if (!applicantId || !status) return;
  try {
    // Hits the decision endpoint in the applicant router
    // status: 'Accepted', 'Rejected', 'Interviewing'
    const response = await axios.patch(
      `${serverURL}/job-applicant/decision/${applicantId}`, 
      { status }, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      console.log(`Decision: ${status}`);
      // Patch local state for immediate feedback
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
const [myApplications, setMyApplications] = useState([]); 
const [applicationDetails, setApplicationDetails] = useState(null); 
const [resumeUpdateStatus, setResumeUpdateStatus] = useState(false);
const [matchedAuthorities, setMatchedAuthorities] = useState([]); 
const [userSessions, setUserSessions] = useState([]); 
const [publicProfile, setPublicProfile] = useState(null); 
const [authError, setAuthError] = useState(null); 

// --- 1. SESSION REFRESH & INTERCEPTOR ---

const refreshSessionToken = async () => {
  try {
    const response = await axios.post(
      `${serverURL}/auth/refresh-token`, 
      {}, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      console.log("Session token refreshed");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Session expired.");
    resetAuthStates(); // Using the helper from earlier
    return false;
  }
};

useEffect(() => {
  const interceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshed = await refreshSessionToken();
        if (refreshed) return axios(originalRequest);
      }
      return Promise.reject(error);
    }
  );
  return () => axios.interceptors.response.eject(interceptor);
}, []);

// --- 2. SEEKER PROFILE & RESUME ---

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
      await getMySeekerProfile(); 
      console.log("Resume updated successfully");
    }
  } catch (error) {
    console.error("Resume Update Error:", error.response?.data?.message);
  }
};

// --- 3. APPLICATIONS & TRACKING (Implicit Identity) ---

const getAppliedApplications = async () => {
  if (!isLoggedIn || !user?.seekerProfile) return;
  try {
    const response = await axios.get(`${serverURL}/applicant/applications`, { withCredentials: true });
    if (response?.data?.success) {
      setMyApplications(response.data.applications || []);
    }
  } catch (error) {
    console.error("Error fetching applications:", error.message);
  }
};

const getApplicationDetails = async (applicationId) => {
  if (!applicationId) return;
  try {
    const response = await axios.get(`${serverURL}/applicant/applications/${applicationId}`, { withCredentials: true });
    if (response?.data?.success) {
      setApplicationDetails(response.data.application);
    }
  } catch (error) {
    console.error("Error fetching application details:", error.message);
  }
};

// --- 4. AI & MATCHING (Implicit Identity) ---


const toggleSaveJob = async (jobId) => {
  if (!jobId || !user?.seekerProfile) return;
  try {
    const response = await axios.patch(`${serverURL}/applicant/jobs/save/${jobId}`, {}, { withCredentials: true });
    if (response?.data?.success) {
      await getAllSavedJobs();
    }
  } catch (error) {
    console.error("Toggle Save Error:", error.message);
  }
};

// --- 5. ACCOUNT SECURITY ---

const requestPasswordReset = async (email) => {
  try {
    setAuthError(null);
    const response = await axios.post(`${serverURL}/user/auth/forgot-password`, { email });
    if (response?.data?.success) {
      console.log("Reset link/OTP sent");
      return true;
    }
  } catch (error) {
    setAuthError(error.response?.data?.message || "Failed to send reset email");
    return false;
  }
};
/**
 * 2. Change Password (While Logged In)
 * Path: /user/change-password
 */
// --- [ACCOUNT SECURITY & IDENTITY] ---

/**
 * 1. Update Account Password (Implicit Identity)
 * Backend uses req.user._id from cookie to identify the user
 */
const updateAccountPassword = async (passwords) => {
  // passwords: { oldPassword, newPassword }
  try {
    const response = await axios.patch(
      `${serverURL}/user/change-password`, 
      passwords, 
      { withCredentials: true }
    );
    if (response?.data?.success) {
      console.log("Password changed successfully");
      return true;
    }
  } catch (error) {
    console.error("Change Password Error:", error.response?.data?.message || error.message);
    return false;
  }
};

/**
 * 2. Get Active User Sessions
 * Path: /user/auth/sessions
 */
const getUserSessions = async () => {
  if (!isLoggedIn) return;
  try {
    const response = await axios.get(`${serverURL}/user/auth/sessions`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      setUserSessions(response.data.sessions || []);
    }
  } catch (error) {
    console.error("Error fetching sessions:", error.message);
  }
};

/**
 * 3. Deactivate Account (Self-service)
 */
const deactivateMyAccount = async () => {
  if (!window.confirm("Are you sure? This action will set your account to Inactive.")) return;
  try {
    // Route aligned with: UserRouter.delete('/deactivate', verifyJWT, deactivateAccount)
    const response = await axios.delete(`${serverURL}/user/deactivate`, { 
      withCredentials: true 
    });
    if (response?.data?.success) {
      console.log("Account deactivated.");
      await logout(); // Using the modernized logout function we built to clear cookies/state
    }
  } catch (error) {
    console.error("Deactivation Error:", error.response?.data?.message || error.message);
  }
};

// --- [PUBLIC DISCOVERY] ---

/**
 * 4. Get Public Profile (By Username)
 * No credentials needed for public-facing profiles
 */
const getPublicUserProfile = async (username) => {
  if (!username) return;
  try {
    // Route aligned with: UserRouter.get('/profile/:username', getPublicProfile)
    const response = await axios.get(`${serverURL}/user/profile/${username}`);
    if (response?.data?.success) {
      setPublicProfile(response.data.profile);
    }
  } catch (error) {
    console.error("Profile lookup failed:", error.message);
    setPublicProfile(null);
  }

};


// --- [1. STATE] ---
const [allJobCategories, setAllJobCategories] = useState([]);

// --- [2. METHOD] ---
/**
 * Fetches all unique job categories (Industries) from the database.
 * Used for marketplace filters and job posting dropdowns.
 */
const getAllJobCategories = async () => {
  try {
    // Aligned with JobRouter: /job/categories
    const response = await axios.get(`${serverURL}/job/categories`, { 
      withCredentials: true 
    });

    if (response?.data?.success) {
      setAllJobCategories(response.data.categories || []);
      console.log("✅ Job categories loaded:", response.data.categories);
    }
  } catch (error) {
    console.error("Error fetching job categories:", error.message);
    setAllJobCategories([]); // Default to empty array to prevent UI crashes
  }
};

// --- [3. LIFECYCLE SYNC] ---
useEffect(() => {
  // This is public/general data, so we can fetch it on load
  getAllJobCategories();
}, []);



// Add this helper outside your component or inside the context


// Inside your WorkContext component:
useEffect(() => {
  const interceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If we get a 401 and we haven't tried refreshing for THIS request yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; 
        
        const isRefreshed = await refreshSessionToken();

        if (isRefreshed) {
          // If refresh worked, retry the original failed call
          return axios(originalRequest);
        } else {
          // If refresh failed, wipe the state so the user is sent to login
          logout(); 
        }
      }
      return Promise.reject(error);
    }
  );

  return () => axios.interceptors.response.eject(interceptor);
}, []);
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
  user, isLoggedIn, loading, registerIndicator, authError, userSessions,
  checkAuthStatus, registerUser, logout, resetAuthStates, refreshSessionToken,
  requestPasswordReset, updateAccountPassword, getUserSessions, deactivateMyAccount,
 
  // --- [2. SEEKER ENTITY] ---
  userSeekerData, seekerData, allSeekersList, dashboardData, initProfileData, 
  singleUserData, suggestedJobsForThisSeeker, savedJobsForThisUser, seekerProfile,
  myApplications, applicationDetails, resumeUpdateStatus, matchedAuthorities,
  getMySeekerProfile, createSeekerProfile, getSeekerDataById, getSeekerDashboardData, 
  getAllSeekersList, getUserDataBySeekerId, saveJob, getAllSavedJobs, 
  getSuggestedJobsForThisSeeker, updateSeekerResume, getAppliedApplications, 
  getApplicationDetails, toggleSaveJob, getWantedAuthorities,

  // --- [3. AUTHORITY (EMPLOYER) ENTITY] ---
  authData, oneAuthData, allAuthorities, allCompanies, matchedData, 
  allSkills, allCategories, wantedAuth, authorityProfile,
  registerForAuthority, getMyCompanyProfile, editAuthProfile, getAuthorityByID, 
  getAllAuthorities, getAllCompanyNames, getMatchedData, getSkills, 
  getAllCategories, removeCompany, updateAuthoritiesPreferredSkills,
  getCompanyByOwnerId,

  // --- [4. EMPLOYEE ENTITY] ---
  allEmployees, singleEmployee, thisJobEmployee, empProfileData, thisAuthAllEmployees,
  getAllEmployee, getEmployeeById, removeEmployee, getEmployeeByJobId, 
  getEmployeeByCompany, getUserDataByEmpId,

  // --- [5. JOB MARKETPLACE] ---
  jobs, allJobs, singleJob, customJobs, requirements, similarJobs, allJobCategories,
  createJob, getJobByAuthority, getAllJobsFromDB, deleteJob, 
  getSingleJobById, applyForJob, getAllRequirementsForJob, getSimilarJobs,
  toggleJobStatus, getCustomJobsList, getAllJobCategories,totalJobPages,currentJobPage,setCurrentJobPage,

  // --- [6. APPLICANTS & HIRING] ---
  allApplicants, singleApplicantData, jobApplicants, applicantId, 
  thisAuthAllApplicants, customSuggestions, companyApplicantsData, reviewQueue,
  getAllApplicants, getApplicantById, getApplicantsByJobId, 
  approveApplicant, getAllApplicantsForThisAuth, getCustomSuggestion,
  getApplicantFromCompanyId, getApplicantDATAFromCompanyId, 
  getApplicantFromCompanyIdAndJobId, getApplicantsForReview, updateApplicationStatus,

  // --- [7. ADMIN & MODERATION] ---
  adminData, allAdmins, allUsersList, pendingAuthorities, flaggedJobs, 
  adminTickets, adminDashboardStats, userLogs,
  loginAdmin, getAllAdmins, getAllUsersList, removeUserByID, 
  blockUserByID, removeSeekerByID, updateAdminPassword, getUserActivityLogs, 
  getPendingAuthorities, verifyAuthority, getFlaggedJobs, updateJobStatus, 
  getAllTickets, broadcastNotification, getAdminDashboardStats,

  // --- [8. MESSAGING & NOTIFICATIONS] ---
  allMessages, allPingsForThisUser, typeNotifications, singleNotificationData,
  sendMessage, getMessages, getAllPings, markAsRead,
  getNotifications_ByType, getNotificationById,

  // --- [9. ANALYTICS & GRAPHS] ---
  graphData, authorityStats,
  fetchApplicationStatusPie, fetchApplicationsByCategory, fetchApplicationsByDate, 
  fetchApplicationsByLocation, fetchResumeGrade, getApplicantsStatus, 
  getApplicantsStatusWeekly, getApplicationCountPerJob, getApplicationsByLocations, 
  getApplicationsByRoles, getApplicationsByTypes, getApplicationsByCategory,

  // --- [10. UTILITIES & PUBLIC] ---
  convertToStandardDateTime, publicProfile, getPublicUserProfile, userData, 
  getUserData, getOtherUserDataById, editProfile
};



  return (
    <WorkContext.Provider value={contextObj}>{children}</WorkContext.Provider>
  );
};
