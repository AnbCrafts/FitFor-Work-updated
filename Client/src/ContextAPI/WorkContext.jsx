import  { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import SHA256 from 'crypto-js/sha256';
import { assets } from "../Authority/assets/assets";
// import { createHash } from "crypto";
//  import dotenv from 'dotenv';
//  dotenv.config(); 
 

export const WorkContext = createContext();

export const WorkContextProvider = ({ children }) => {
  const serverURL = "http://localhost:9000/api";
 
  // *********************** USER ROUTES *************************************************************************************

// const getHashSecret = (fixedTime = '') => {
  
//   const part1 = import.meta.env.VITE_HASH_SECRET || 'fallbackSecret123';
//   const time = fixedTime || Date.now().toString().slice(-4);
//   const part2 = 'XyZ123!#$_@' + time;
//   return [...part1].map((ch, i) => ch + (part2[i] || '')).join('');
// };
// FIXED — deterministic, stable secret generator
const getHashSecret = (fixedTime = '') => {
  const part1 = "Yy9!Ffwk_+@54$+trackForge@secret__2025!@";
  const time = fixedTime || Date.now().toString().slice(-4);
  const part2 = "XyZ123!#$_@" + time;
  return [...part1].map((ch, i) => ch + (part2[i] || '')).join('');
};



const navigate = useNavigate();
const [userId, setUserId] = useState(null);
const [userToken, setUserToken] = useState(null);
const [seekerId, setSeekerId] = useState(null);
const [authorityId, setAuthorityId] = useState(null);
const [adminId, setAdminId] = useState(null);
const [seekerToken, setSeekerToken] = useState(null);
const [authorityToken, setAuthorityToken] = useState(null);
const [adminToken, setAdminToken] = useState(null);

const [userData, setUserData] = useState(null);
const [registerIndicator, setRegisterIndicator] = useState(false);

const [securePath, setSecurePath] = useState(null);

const registerUser = async (data, path) => {
  try {
    const response = await axios.post(
      `${serverURL}/user/register/${path}`,
      data
    );

    if (!response) {
      alert("Missing response");
      return;
    }

    if (response.data.success === false) {
      alert("False response");
      return;
    }

    if (response?.data?.success) {
      const user = response.data.user;
      const id = user.id;
      const token = user.token;

      setRegisterIndicator(true);

      // Removed hash verification completely

      setUserData(user);
      setUserId(id);
      setUserToken(token);

      localStorage.setItem("userId", id);
      localStorage.setItem("userToken", token);

      // Navigate using _id instead of hash
      navigate(`/auth/${user.role.toLowerCase()}/${id}`);

      alert(response.data.message);
    } else {
      alert(response.data.message || "Authentication failed");
    }
  } catch (error) {
    alert("Error while registering the user");
    console.log(error);
  }
};





  useEffect(()=>{
    setSecurePath(securePath)
  },[securePath])

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
  const getUserDataById = async (id) => {
    try {
      const response = await axios.get(`${serverURL}/user/list/all/${id}`);

      if (response.data && response.data.success) {
        const data = response.data.user;
        setUserData(data);
      } else {
        console.log("cannot get userdata for this id", id);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(()=>{
    setUserData(userData);
  },[userData]);

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

  const [singleUserData,setSingleUserData] = useState(null);
  const getUserDataBySeekerId = async(id)=>{
    try {
      const response = await axios.get(`${serverURL}/user/list/all/seeker/${id}`);
      if(response && response.data.success){
        const data = response.data.user;
        setSingleUserData(data);

      }
      else{
        console.log("Cannot get user data from seeker data")
      }
    } catch (error) {
      console.log(error);
    }
  }

  //yet to implement
  const editProfile = async(id,data)=>{
    try {
      const response = await axios.put(`${serverURL}/user/profile/edit`)
      
    } catch (error) {
      console.log(error);
      alert("Internal Server Error");
    }
  }





  // ************************ SEEKER ROUTES ************************************************************************************

//  create profile end-point
const [initProfileData, setInitProfileData] = useState(null);
const createSeekerProfile = async(data)=>{
    try {
      const response = await axios.post(`${serverURL}/applicant/profile/create`,data,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if(!response){
        alert("Cannot get response")
      }
      if(response && response.data.success){
        console.log(response.data.message);
        const data = response.data.seeker;
        setInitProfileData(data);
      
      }else{
        alert("Failed to create your job seeker profile, got negative response")
      }
    } catch (error) {
      console.log(error);
    }
}

  //get all users end-point ----->
  const [allSeekersList,setAllSeekersList] = useState(null);
  const getAllSeekersList = async()=>{
    try {
      const response = await axios.get(`${serverURL}/applicant/profile/list/all`);
      if(response && response.data.success){
        const data = response.data.seeker;
        setAllSeekersList(data);
      }
    } catch (error) {
      console.log(error);
    }
  }
 useEffect(()=>{
    setAllSeekersList(allSeekersList);
  },[allSeekersList])

  //seeker data by id end-point ----->
  const [seekerData,setSeekerData] = useState(null);
  const getSeekerDataById = async (id) => {
    try {
      if(!id){
        console.log("Id not found")
      }
      const response = await axios.get(`${serverURL}/applicant/profile/list/all/${id}`);

      if (response.data && response.data.success) {
        const data = response.data.seeker;
       setSeekerData(data);
      } else {
        console.log("cannot get seekerData for this id", id);
      }
    } catch (error) {
      console.log(error);
    }
  }; 
  
  useEffect(()=>{
    setSeekerData(seekerData);
  },[seekerData])
  
  const [user_seekerData, setUser_SeekerData] = useState(null);
  const getSeekerDataByUserId = async (id) => {
  if (!id) {
    console.warn("User ID is required to fetch seeker data.");
    return;
  }

  try {
    const response = await axios.get(`${serverURL}/applicant/profile/list/all/user/${id}`);

    if (response?.data?.success) {
      const id = response.data.seeker._id;
      localStorage.setItem("seekerId",id);
      setUser_SeekerData(response.data.seeker);

    } else {
      console.warn("Seeker data not found for user ID:", id);
    }
  } catch (error) {
    console.error("Error fetching seeker data:", error);
  }
};

useEffect(()=>{
  const id = localStorage.getItem("userId");
  if(id){
    getSeekerDataByUserId(id);
  }
})


  useEffect(()=>{
    setUser_SeekerData(user_seekerData);
  },[user_seekerData])


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
    alert("Provide Seeker ID");
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
      alert(response.data.message || "Could not get a positive response");
    }
  } catch (error) {
    alert("Internal Server Error");
    console.log(error);
  }
};



const [dashboardData,setDashboardData] = useState(null);


const getSeekerDashboardData = async()=>{
      try {
        const id = localStorage.getItem("seekerId");
        const response = await axios.get(`${serverURL}/applicant/profile/list/all/${id}/dashboard-data`);
        if(!response){
          console.log("Cannot get response");

        }
        if(response && response.data.success){
          const data = response.data.userDashboard;
          setDashboardData(data);
          console.log("User Dashboard : ", data);
        }else{
          setDashboardData("No Profile");
        }
      } catch (error) {
        console.log(error);
      }
}


useEffect(()=>{
  const id = localStorage.getItem("seekerId");
  if(id){
    getSeekerDashboardData();
  }
},[])
useEffect(()=>{
  setDashboardData(dashboardData)
},[dashboardData])




  // *********************** AUTHORITY ROUTES *************************************************************************************
  

  const registerForAuthority = async (data) => {
    try {
      const response = await axios.post(
        `${serverURL}/authority/register/new`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response && response.data.success) {
        console.log(response.data.message);
      } else {
        console.log("Registration failed for authority");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [authData, setAuthData] = useState(null);

  const getCompanyByOwnerId = async(id)=>{
    try {
      const response = await axios.get(`${serverURL}/authority/list/all/owner/${id}`);
      if(response && response.data.success){
        const authority = response.data.authority;
        setAuthData(authority);
      }else{
        console.log("SOmething error occurred or false response")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setAuthData(authData);
  }, [authData]);

  const [allAuthorities, setAllAuthorities] = useState(null);
  const getAllAuthorities = async()=>{
     try {
      const response = await axios.get(`${serverURL}/authority/list/all`);
      if(response && response.data.success){
        const data = response.data.authorities;
       
        setAllAuthorities(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
setAllAuthorities(allAuthorities);
  },[allAuthorities])

   const [oneAuthData,setOneAuthData] = useState(null);
  const getAuthorityByID = async (id) => {
    try {
      if(!id){
        console.log("Id not found")
      }
      const response = await axios.get(`${serverURL}/authority/list/all/${id}`);

      if (response.data && response.data.success) {
        const data = response.data.authority;
       setOneAuthData(data);
      } else {
        console.log("cannot get OneAuthData for this id", id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [matchedData,setMatchedData] = useState({
    totalMatches: 0,
      matchedSkills: [],
      seekers: [],
  });

  const getMatchedData = async(id)=>{
    if(!id){
      alert("Authority ID Is required");
    }
    try {
      const response = await axios.get(`${serverURL}/authority/list/all/seekers/matching-skills/${id}`);
      if(response && response.data.success){
        const match = response.data.totalMatches;
        const skills = response.data.matchedSkills;
        const seekers = response.data.seekers;
        setMatchedData({
          matchedSkills:skills,
          seekers:seekers,
          totalMatches:match
        })

      }else{
        alert(response.data.message || "Cannot get response")
      }
      
    } catch (error) {
      alert("Internal Server Error");
      console.log(error);
    }

  }

 const editAuthProfile = async (id, data) => {
  if (!id || !data || Object.keys(data).length === 0) {
    alert("Provide valid ID and profile data");
    return;
  }

  try {
    const response = await axios.put(
      `${serverURL}/authority/profile/edit/${id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );

    if (response.data.success) {
      alert("Profile updated successfully!");
      return response.data;
    } else {
      alert(response.data.message || "Failed to update profile");
    }
  } catch (error) {
    console.error("Edit profile error:", error);
    alert("Internal Server Error");
  }
};

const [allCompanies,setAllCompanies] = useState(null);
const getAllCompanyNames  = async()=>{
  try {
      const response = await axios.get(`${serverURL}/authority/all/names`);
      if(response && response.data.success){
        setAllCompanies(response.data.companyNames);
      }else{
        alert("Cannot get positive response")
      }
    
  } catch (error) {
    alert("Internal Server Error");
    console.log(error);
  }
}






 
  // *********************** JOB ROUTES *************************************************************************************
 
  const [jobs,setJobs] = useState(null);
  const createJob = async(data)=>{
    if(!data){
      alert("Provide DATA")
    }
    try {
      const response = await axios.post(`${serverURL}/job/create/new`, data);
      if(!response){
        console.log("Found no response");
        alert("No Response");
      }
      if(response.data.success ===false){
        console.log("Found false response");
        alert("Found false response")
      }
      if(response && response.data.success){
        alert("Job Posted Successfully");
      }

      console.log("Posted data is -> ", data);


      
    } catch (error) {
      console.log(error)
    }

  }
  const getJobByAuthority = async(id)=>{
    try {
      const response = await axios.get(`${serverURL}/job/list/all/authority/${id}`);
      if(!id){
        alert("Cannot get id");
      }
      if(response && response.data.success){
          console.log("Got all the jobs for this id");
          const data = response.data.jobs;
          setJobs(data);
      }else{
          console.log("Cannot get the jobs for this id");

      }
      
    } catch (error) {
     console.log(error); 
    }

  }
  const[allJobs,setAllJobs] = useState(null);
  const getAllJobsFromDB = async()=>{
    try {
      const response = await axios.get(`${serverURL}/job/list/all`);
      if(response.data.success){
        const data = response.data.jobs;
        setAllJobs(data);

      }else{
      console.log("Cannot get all jobs");

      }
      
    } catch (error) {
      console.log(error);
    }

  }
  const deleteJob = async(id)=>{
    try {
      if(!id){
        console.log("cannot get id of the job");

      }
      const response = await axios.delete(`${serverURL}/job/list/all/${id}/remove`);
      if(response.data.success){
          console.log("Job deleted successfully")
          await getAllJobsFromDB();
      }else{
          console.log("Job deletion failed")

      }
      
    } catch (error) {
      console.log(error);
    }

  }
  
  const [singleJob,setSingleJob] = useState(null);

  const getSingleJobById = async(id)=>{
        try {
          const response = await axios.get(`${serverURL}/job/list/all/${id}`);
        if(response && response.data.success){
          const data = response.data.job;
          setSingleJob(data);

        }else{
          console.log("Could not get positive response")
        }
        } catch (error) {
          console.log(error);
        }
  }

  const [applicant_id, setApplicant_id] = useState(null);
  const applyForJob = async(jobId,seekerId)=>{
    try {
      const response = await axios.post(`${serverURL}/job/${jobId}/applicant/${seekerId}/apply`);
      if(response && response.data.success){
        const data = response.data.applicantId;
        setApplicant_id(data);

        alert("You have applied for this job successfully");
        alert(data);
      }
      else{
        console.log("Could not get positive response");
        alert(response.data.message || "Failed to apply")
      }
    } catch (error) {
      console.log(error)
      
    }
  }
 
  useEffect(()=>{
    setAllJobs(allJobs)
  },[allJobs]);



  useEffect(()=>{
    setSingleJob(singleJob);
  },[singleJob])

  // *********************** APPLICANT ROUTES *************************************************************************************
  const [allApplicants, setAllApplicants] = useState(null);
  const [singleApplicantData, setSingleApplicantData] = useState(null);
 const getAllApplicants = async () => {
  try {
    const response = await axios.get(`${serverURL}/job-applicant/list/all`);
    
    if (response?.data?.success) {
      const data = response.data.applicants;
      setAllApplicants(data);
      console.log("All Applicants - ", data);
    } else {
      console.log("Could not get positive response");
    }

  } catch (error) {
    console.error("Error in getAllApplicants:", error);
  }
}; 
 

  const getApplicantById = async (id, indicator) => {
  if (!id) {
    alert("Cannot get Id");
    return;
  }



  if (!indicator) {
    alert("Provide Indicator");
    return;
  }

  try {
    let response = "";

    if (indicator === 1) {
      response = await axios.get(`${serverURL}/job-applicant/list/all/${id}`);
    }  else if (indicator === 2) {
      response = await axios.get(`${serverURL}/job-applicant/list/all/seeker/${id}`);
    } else if (indicator === 3) {
      response = await axios.get(`${serverURL}/job-applicant/list/all/company/${id}`);
    } else {
      alert("No valid indicator provided");
      return;
    }


    
    if (response?.data?.success) {
      const data = response.data.applicant;
      // console.log(data);
      setSingleApplicantData(data);
      // console.log("API response:", response.data);

    } else {
      console.log("Could not get positive response");
    }
  } catch (error) {
    console.error("Error fetching applicant data:", error?.response?.data || error.message);
  }
};
  const getApplicantBySeekerId = async (id) => {
  if (!id) {
    alert("Cannot get Id");
    return;
  }

  try {
    
    
     const response = await axios.get(`${serverURL}/job-applicant/list/all/seeker/${id}`);
    
    if (response?.data?.success) {
      const data = response.data.applicant;
      console.log(data);
      setSingleApplicantData(data);
      console.log("API response:", response.data);

    } else {
      console.log("Could not get positive response");
    }
  } catch (error) {
    console.error("Error fetching applicant data:", error?.response?.data || error.message);
  }
};

const [jobApplicants,setJobApplicants] = useState(null);

const getApplicantsByJobId = async(id)=>{
  if (!id) {
    alert("Cannot get Id");
    return;
  }
  try {
    const response = await axios.get(`${serverURL}/job-applicant/list/all/job/${id}`);
    if(response && response.data.success){
      const data = response.data.applicants;
      setJobApplicants(data);

    }
    else{
      console.log("Cannot get positive response")
    }
  } catch (error) {
   console.log(error) 
  }
}


  const getApplicantByJobAndCompanyId = async(compId,jobId)=>{
      if(!compId){
        alert("Provide company ID");
      }
      if(!jobId){
        alert("Provide Job ID");
      }
      try {
        const response = await axios.get(`${serverURL}/list/all/company/${compId}/job/${jobId}`);
        if(response && response.data.success){
          const data = response.data.applicant;
          setSingleApplicantData(data);
          console.log(data);
        }
      } catch (error) {
        console.log(error)
      }
  }

  const approveApplicant = async (applicantId, jobId, text) => {
  try {
    let response = "";
    const action = text.toLowerCase();

    if (action === 'accept') {
      response = await axios.post(`${serverURL}/job-applicant/list/all/applicant/${applicantId}/job/${jobId}/accept`);
    } else if (action === 'reject') {
      response = await axios.post(`${serverURL}/job-applicant/list/all/applicant/${applicantId}/job/${jobId}/reject`);
    } else {
      alert("Invalid action text. Use 'accept' or 'reject'");
      return; // stop the function
    }

    if (response && response.data.success) {
      alert(`Applicant ${action}ed successfully`);
    } else {
      alert("Could not get positive response");
    }

    await getAllApplicants();

  } catch (error) {
    console.log(error);
    alert("An error occurred while processing the request");
  }
};



  useEffect(()=>{
    setAllApplicants(allApplicants)
  },[allApplicants])
  
  useEffect(()=>{
    setSingleApplicantData(singleApplicantData)
  },[singleApplicantData])


  // *********************** ADMIN ROUTES *************************************************************************************

  const [adminData, setAdminData] = useState(null);
  const loginAdmin = async(data)=>{
    try {
      const response = await axios.post(`${serverURL}/admin/existing/login`, data);
      if(response && response.data.success){

        alert(response.data.message);
        const data = response.data.admin;
        const token = response.data.token;
        const id = response.data.admin.id;
        
        const hash = response.data.admin.secureHash;
        const loginTime = response.data.admin.loginTime;
const userId = id;
const secret = getHashSecret(loginTime.toString().slice(-4));
const payload = userId.toString() + loginTime + secret;
const secureHash = SHA256(payload).toString();

        // const secureHash = createHash('sha256').update(payload).digest('hex');
 
        if(hash === secureHash){
          navigate(`/auth/admin/${hash}`);
          alert(response.data.message); 
          setAdminToken(token);
      setAdminId(id);
      localStorage.setItem("adminId",id);
      setAdminData(data);

        }
        else{
          alert("False Login Attempt")
        }
      
      } 
      
    } catch (error) {
      alert("Failed to login admin")
      console.log(error)
    }
  }

  const [allAdmins,setAllAdmins] = useState(null);
  const getAllAdmins = async()=>{
    try {
        const response = await axios.get(`${serverURL}/admin/list/all`);
        if(response && response.data.success){
          const data = response.data.admins;
          setAllAdmins(data);
          
        }
      } catch (error) {
        console.log(error)
      }
  }

  useEffect(()=>{
    setAllAdmins(allAdmins);

  },[allAdmins])






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
    alert("Please provide a valid Employee ID.");
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
    alert("An error occurred while fetching employee data.");
  }
};

  const removeEmployee = async(id)=>{
    if(!id){
      alert("Provide ID")
    }
    try {
      const response = await axios.delete(`${serverURL}/employee/list/all/${id}/remove`);
      if(response && response.data.success){
        alert("Employee Deleted Successfully");
      }else{
        alert("Could not get positive response")
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
      alert("Provide ID")
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
        alert(response.data.message || "Cannot get response")
      }
      
    } catch (error) {
      console.log(error);
      alert("Internal server error");

    }
  }
const [thisAuthAllEmployees,setThisAuthAllEmployees] = useState(null);

const getEmployeeByCompany = async(id)=>{
  if(!id){
    alert("Provide ID");
  }
  try {
    const response = await axios.get(`${serverURL}/employee/list/all/company/${id}`);
    if(response && response.data.success){
      const data = response.data.employee;
      setThisAuthAllEmployees(data);

    }else{
      alert(response.data.message || "Cannot get response");
    }
  } catch (error) {
    console.log(error);
    alert("Internal Server Error");
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


const [allCategories,setAllCategories] = useState(null);
const geAllCategories = async()=>{
  try {
    let dataArray = [];
    const response = await axios.get(`${serverURL}/authority/list/all`);
      if(response && response.data.success){
        const data = response.data.authorities;
        // console.log(data);
        data.forEach((item)=>{
          const category = item.industry;
          if(!category){
            console.log("No Categories found");
          }
          dataArray.push(category);
        })

        setAllCategories(dataArray);
      }
      else{
        alert("Failed to get all categories");
      }
    
  } catch (error) {
    console.log(error);
    alert("Failed due to internal server error")
  }

}



const [savedJobsForThisUser, setSavedJobsForThisUser] = useState(null);
const saveJob = async(seekerId,jobId)=>{
  if(!seekerId && !jobId){
    alert("Provide both ids")
  }
  try {
    const response = await axios.put(`${serverURL}/job/${jobId}/applicant/${seekerId}/save`);
    if(response && response.data.success){
      alert("Saved the job Successfully");
    }else{
      alert(response.data.message ||"Cannot save the job.");

    }
  } catch (error) {
    console.log(error);
    alert("Failed due tp internal server");
  }
}
 
const getAllSavedJobs = async (seekerId) => {
  if (!seekerId) {
    alert("Provide seeker ID");
    return;
  }

  console.log(`🔗 Hitting: ${serverURL}/job/applicant/${seekerId}/saved-list/all`);

  try {
    const response = await axios.get(`${serverURL}/job/applicant/${seekerId}/saved-list/all`);

    if (response?.data?.success && Array.isArray(response.data.savedJobs)) {
      console.log("✅ Saved job IDs:", response.data.savedJobs);

      const jobResponses = await Promise.all(
        response.data.savedJobs.map((jobId) =>
          axios
            .get(`${serverURL}/job/list/all/${jobId}`)
            .then((res) => {
              if (res.data.success) return res.data.job;
              console.log("❌ Failed to fetch job:", jobId);
              return null;
            })
            .catch((err) => {
              console.error(`⚠️ Error fetching job ${jobId}`, err);
              return null;
            })
        )
      );

      const validJobs = jobResponses.filter((job) => job !== null);
      console.log("✅ Final saved jobs:", validJobs);

      setSavedJobsForThisUser(validJobs);
    } else {
      alert(response?.data?.message || "No saved jobs found.");
    }
  } catch (error) {
    console.error("💥 Error in getAllSavedJobs:", error);
    alert("Internal server error while fetching saved jobs.");
  }
};

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
      alert("No notifications found for the provided types.");
    }

  } catch (error) {
    console.error("❌ Error fetching notifications:", error.message);
    alert("Internal server error");
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
      alert(response.data.message || "Cannot get response");
    }

    
  } catch (error) {
    console.log(error);
    alert("Internal Server Error");
  }
  
}

const [requirements,setRequirements] = useState(null);

const getAllRequirementsForJob = async()=>{
  try {
    const response = await axios.get(`${serverURL}/job/list/all/requirements`);
    if(response && response.data.success){
        const data = response.data.categories;
        setRequirements(data);

    }else{
      alert(response.data.message || "Cannot get positive response")
    }
    
  } catch (error) {
    alert("Internal Server error");
    console.log(error);
  }

}

const [customJobs, setCustomJobs] = useState(null);

const getCustomJobs = async(query)=>{
  try {
    const response = await axios.get(`${serverURL}/job/list/all/custom-query?${query}`);
    if(response && response.data.success){
      const data = response.data.jobs;
      setCustomJobs(data);
    }else{
      alert(response.data.message || "Cannot get positive response")
    }
  } catch (error) {
    console.log(error);
    alert("Internal server error")
  }
}






 


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

const [allSkills,setAllSkills] = useState(null);

const getSkills = async()=>{
  try {
      const response = await axios.get(`${serverURL}/applicant/profile/list/all/factors`);
      if(response && response.data.success){
        const data = response.data.allSkills;
        setAllSkills(data);
      }else{
        alert(response.data.message || "Cannot get positive response");
      }
    
  } catch (error) {
    console.log(error)
    alert("Internal Server Error");
  }

}

const [customSuggestions,setCustomSuggestions] = useState(null);
const getCustomSuggestion = async(query)=>{
  try {

const response = await axios.get(`${serverURL}/applicant/profile/list/all/factors/custom-query?${query}`);

    if(response && response.data.success){
      const data = response.data.seekers;
      setCustomSuggestions(data);

    }else{
      alert(response.data.message || "Cannot get positive response")
    }
    
  } catch (error) {
    alert("INternal Server error")
    console.log(error);

  }
}
useEffect(() => {
  console.log("Updated Suggestions:", customSuggestions);
  setCustomSuggestions(customSuggestions);
}, [customSuggestions]);

const [thisAuthAllApplicants,setThisAuthAllApplicants] = useState(null);
const getAllApplicantsForThisAuth = async(ownerId)=>{
  if(!ownerId){
    alert("Provide ID");
  }
  try {
    const response = await axios.get(`${serverURL}/job-applicant/list/all/company/${ownerId}/data`);
    if(response && response.data.success){
      const data = response.data.allApplicantData;
      setThisAuthAllApplicants(data);
    }else{
      alert(response.data.message || "Cannot get positive response")
    }
    
  } catch (error) {
    console.log(error);
    alert("Internal Server Error")
  }
}

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
          alert("cannot get UserID")
        }



      }else{
          alert("cannot get token")

      }

}

useEffect(()=>{
  setGlobalId(globalId);
},[globalId]);





const [graphData, setGraphData] = useState({
  pie: null,
  bar: null,
  line: null,
  horBar: null,
  grade: null,
  brief:null
});

// Validation function
const validateResponse = async (response) => {
  if (response && response.data?.success) {
    return response.data.data;
  } else {
    alert(response?.data?.message || "Something went wrong!");
    return null;
  }
};

// 1. Fetch Pie Chart Data - Application Status
const fetchApplicationStatusPie = async (seekerId) => {
  if (!seekerId) return alert("Seeker ID missing in fetchApplicationStatusPie");

  try {
    const response = await axios.get(`${serverURL}/graph/application/status/${seekerId}`);
    const data = await validateResponse(response);
    if (data) {
      setGraphData((prev) => ({ ...prev, pie: data }));
    }
  } catch (error) {
    console.error("Error in fetchApplicationStatusPie:", error?.response || error);
    alert("Error fetching application status (pie)");
  }
};

// 2. Fetch Line Chart Data - Applications by Date
const fetchApplicationsByDate = async (seekerId) => {
  if (!seekerId) return alert("Seeker ID missing in fetchApplicationsByDate");

  try {
    const response = await axios.get(`${serverURL}/graph/application/status/${seekerId}/date`);
    const data = await validateResponse(response);
    if (data) {
      setGraphData((prev) => ({ ...prev, line: data }));
    }
  } catch (error) {
    console.error("Error in fetchApplicationsByDate:", error?.response || error);
    // alert("Error fetching applications by date (line)");
  }
};

// 3. Fetch Bar Chart Data - Applications by Category
const fetchApplicationsByCategory = async (seekerId) => {
  if (!seekerId) return alert("Seeker ID missing in fetchApplicationsByCategory");

  try {
    const response = await axios.get(`${serverURL}/graph/application/status/${seekerId}/category`);
    const data = await validateResponse(response);
    if (data) {
      setGraphData((prev) => ({ ...prev, bar: data }));
    }
  } catch (error) {
    console.error("Error in fetchApplicationsByCategory:", error?.response || error);
    alert("Error fetching applications by category (bar)");
  }
};

// 4. Fetch Horizontal Bar Chart - Applications by Location
const fetchApplicationsByLocation = async (seekerId) => {
  if (!seekerId) return alert("Seeker ID missing in fetchApplicationsByLocation");

  try {
    const response = await axios.get(`${serverURL}/graph/application/status/${seekerId}/location`);
    const data = await validateResponse(response);
    if (data) {
      setGraphData((prev) => ({ ...prev, horBar: data }));
    }
  } catch (error) {
    console.error("Error in fetchApplicationsByLocation:", error?.response || error);
    alert("Error fetching applications by location (horizontal bar)");
  }
}; 

// 5. Fetch Radar Chart - Resume Score Breakdown
const fetchResumeGrade = async (seekerId) => {
  if (!seekerId) return alert("Seeker ID missing in fetchResumeGrade");

  try {
    const response = await axios.get(`${serverURL}/graph/applicant-profile/${seekerId}/grade`);
    const data = await validateResponse(response);
    if (data) {
      setGraphData((prev) => ({ ...prev, grade: data }));
    }
  } catch (error) {
    console.error("Error in fetchResumeGrade:", error?.response || error);
    alert("Error fetching resume grade (radar)");
  }
}; 
 

const [suggestedJobsForThisSeeker, setSuggestedJobsForThisSeeker] = useState({
  suggestedJobs: [],
  totalMatches: 0, 
});

const getSuggestedJobsForThisSeeker = async (seekerId) => {
  if (!seekerId) {
    alert("Seeker ID is required.");
    return;
  }

  try {
    const response = await axios.get(`${serverURL}/dashboard/suggested-jobs/${seekerId}`);

    if (response?.data?.success) {
      const { suggestedJobs, totalMatches } = response.data;

      setSuggestedJobsForThisSeeker({
        suggestedJobs,
        totalMatches,
      });
    } else {
      alert(response?.data?.message || "Failed to fetch suggested jobs.");
    }
  } catch (error) {
    console.error("Error fetching suggested jobs:", error);
    alert("Internal Server Error");
  }
};


// AUTHORITY GRAPHS
const [applicantStatus,setApplicantStatus] = useState(null);
const getApplicantsStatus = async(id)=>{
   if(!id){
    alert("Provide AUthority ID")
  }
  try {
    const response = await axios.get(`${serverURL}/graph/job-applications/${id}/count/status`);
    if(response && response.data.success){
      const data = response.data.data;
      setApplicantStatus(data);
    }else{
      alert(response.data.message || "Cannot get positive response")
    }
    
  } catch (error) {
    alert("Internal Server Error",error);
  }
}

const [applicantStatusWeekly,setApplicantStatusWeekly] = useState(null);
const getApplicantsStatusWeekly = async(id)=>{
  if(!id){
    alert("Provide AUthority ID")
  }
  try {
    const response = await axios.get(`${serverURL}/graph/job-applications/${id}/count/weekly`);
    if(response && response.data.success){
      const data = response.data.data;
      setApplicantStatusWeekly(data);
    }else{
      alert(response.data.message || "Cannot get positive response")
    }
    
  } catch (error) {
    alert("Internal Server Error",error);
  }
}

const [applicationCountPerJob,setApplicationCountPerJob] = useState(null);
const getApplicationCountPerJob = async(id)=>{
if(!id){
    alert("Provide AUthority ID")
  }
  try {
    const response = await axios.get(`${serverURL}/graph/job-applications/${id}/count`);
    if(response && response.data.success){
      const data = response.data.data;
      setApplicationCountPerJob(data);
    }else{
      alert(response.data.message || "Cannot get positive response")
    }
    
  } catch (error) {
    alert("Internal Server Error",error);
  }
}

const [applicationCountByLocation,setApplicationCountByLocation] = useState(null);
const getApplicationsByLocations = async(id)=>{
  if(!id){
    alert("Provide AUthority ID")
  }
  try {
    const response = await axios.get(`${serverURL}/graph/job-applications/${id}/count/location`);
    if(response && response.data.success){
      const data = response.data.data;
      setApplicationCountByLocation(data);
    }else{
      alert(response.data.message || "Cannot get positive response")
    }
    
  } catch (error) {
    alert("Internal Server Error",error);
  }
}

const [applicationCountByRole,setApplicationCountByRole] = useState(null);
const getApplicationsByRoles = async(id)=>{
  if(!id){
    alert("Provide AUthority ID")
  }
  try {
    const response = await axios.get(`${serverURL}/graph/job-applications/${id}/count/role`);
    if(response && response.data.success){
      const data = response.data.data;
      setApplicationCountByRole(data);
    }else{
      alert(response.data.message || "Cannot get positive response")
    }
    
  } catch (error) {
    alert("Internal Server Error",error);
  }
}

const [applicationCountByType,setApplicationCountByType] = useState(null);
const getApplicationsByTypes = async(id)=>{
  if(!id){
    alert("Provide AUthority ID")
  }
  try {
    const response = await axios.get(`${serverURL}/graph/job-applications/${id}/count/type`);
    if(response && response.data.success){
      const data = response.data.data;
      setApplicationCountByType(data);
    }else{
      alert(response.data.message || "Cannot get positive response")
    }
    
  } catch (error) {
    alert("Internal Server Error",error);
  }
}

const [applicationCountByCategory,setApplicationCountByCategory] = useState(null);
const getApplicationsByCategory = async(id)=>{
  if(!id){
    alert("Provide AUthority ID")
  }
  try {
    const response = await axios.get(`${serverURL}/graph/job-applications/${id}/count/category`);
    if(response && response.data.success){
      const data = response.data.data;
      setApplicationCountByCategory(data);
    }else{
      alert(response.data.message || "Cannot get positive response")
    }
    
  } catch (error) {
    alert("Internal Server Error",error);
  }
}




// *********************** <MEssage> ROutes *************************************************************************************
const [allMessages, setAllMessages] = useState([]);

const getMessages = async (sender, receiver) => {
  if (!sender || !receiver) {
    alert("Sender or receiver not found");
    return;
  }

  try {
    const response = await axios.get(`${serverURL}/message/all/sender=${sender}&receiver=${receiver}`);

    if (response?.data?.success) {
      const messages = response.data.data;  // corrected key from `date` to `data`
      if (messages?.length > 0) {
        setAllMessages(messages);
      } else {
        alert("No messages found");
        setAllMessages([]);
      }
    } else {
      alert("Failed to fetch messages");
    }

  } catch (error) {
    console.error("Error while fetching messages:", error);
    alert("Something went wrong while fetching the messages.");
  }
};

const sendMessage = async (sender, receiver, data) => {
  if (!sender || !receiver || !data) {
    alert("Sender, receiver, or message content is missing.");
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
      alert("Message sending failed");
    }

  } catch (error) {
    console.log("Internal Server Error:", error);
    alert("Something went wrong while sending the message.");
  }
};

const [allPingsForThisUser, setAllPingsForThisUser] = useState(null);

const getAllPingsByUserId = async (receiver) => {
  if (!receiver) {
    alert("Receiver not found");
    return;
  }

  try {
    const response = await axios.get(`${serverURL}/message/all-pings/receiver=${receiver}`);

    if (response?.data?.success) {
      const users = response.data.users;
      if (users?.length > 0) {
        setAllPingsForThisUser(users);
      } else {
        alert("No users found");
        setAllPingsForThisUser(null);
      }
    } else {
      alert("Failed to fetch users");
    }

  } catch (error) {
    console.error("Error while fetching messages:", error);
    alert("Something went wrong while fetching the messages.");
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










// *********************** Notification ROutes *************************************************************************************

// Assuming assets.img is your default logo placeholder (if needed)

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
 readMessages,  getAllPingsByUserId,allPingsForThisUser ,getAllAdmins,allAdmins,sendMessage,getMessages,allMessages,
    getUserDataBySeekerId,
    singleUserData,
    registerUser,
    userData,
    setUserData,
    registerIndicator,
    setRegisterIndicator,
    userId,
    setAdminId,
    setAdminToken,
    setAuthorityId,
    setAuthorityToken,
    setSeekerToken,
    setSeekerId,
    seekerId,
    seekerToken, 
    userToken,
    authorityToken,
    authorityId,
    adminId,
    adminToken,
    getUserDataById,
    registerForAuthority,
    authData,
    getCompanyByOwnerId,
    createJob,
    jobs,
    getJobByAuthority,
    getAllJobsFromDB,
    allJobs,
    deleteJob,
    getAllUsersList,
    allUsersList,
    removeUserByID,
    blockUserByID,
    createSeekerProfile,initProfileData,setInitProfileData,
    getAllSeekersList,
    seekerData,
    getSeekerDataById,
    allSeekersList,
    removeSeekerByID,
    getAllAuthorities,
    getMatchedData,matchedData,
    allAuthorities,
    getAuthorityByID,
    oneAuthData,
    loginAdmin,
    adminData,
    getSeekerDataByUserId,
    user_seekerData,
    securePath,
    // Job exports
    getSingleJobById,
    singleJob,
    applyForJob,
    applicant_id,
    // applicant exports
    getAllApplicants,allApplicants,getApplicantById,singleApplicantData,getApplicantByJobAndCompanyId,approveApplicant,getApplicantsByJobId,jobApplicants,getApplicantBySeekerId,
    // employee exports
    getAllEmployee,allEmployees,getEmployeeById,singleEmployee,removeEmployee,getEmployeeByJobId,thisJobEmployee,getUserDataByEmpId,empProfileData,getEmployeeByCompany,thisAuthAllEmployees,
    
    // UTILITY 
    convertToStandardDateTime,geAllCategories,allCategories,saveJob,savedJobsForThisUser,getAllSavedJobs,exitFromPlatform,getNotifications_ByType,typeNotifications,getNotificationById,singleNotificationData,getAllRequirementsForJob,requirements,getCustomJobs,customJobs,getSkills,allSkills,getCustomSuggestion,customSuggestions,setCustomSuggestions,
    getAllApplicantsForThisAuth,thisAuthAllApplicants,resetOnExit,getUserIdByToken,globalId,
    // GRAPHS
    fetchApplicationStatusPie,fetchApplicationsByCategory,fetchApplicationsByDate,fetchApplicationsByLocation,fetchResumeGrade,graphData,getSuggestedJobsForThisSeeker,suggestedJobsForThisSeeker,
    getApplicantsStatusWeekly,
    getApplicationsByLocations,
    getApplicationCountPerJob,
    getApplicantsStatus,
    getApplicationsByRoles,
    getApplicationsByTypes,
    getApplicationsByCategory,
    applicationCountByCategory,applicationCountByType,applicationCountByRole,applicationCountByLocation,applicantStatusWeekly,applicationCountPerJob,
applicantStatus,
editAuthProfile,
getWantedAuthorities,
wantedAuth,getAllCompanyNames,allCompanies,getSeekerDashboardData,dashboardData

  }; 

  return (
    <WorkContext.Provider value={contextObj}>{children}</WorkContext.Provider>
  );
};
