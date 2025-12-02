import React, { useContext, useEffect, useState } from "react";
import PortalHeader from "../Components/PortalHeader";
import { Upload } from "lucide-react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { useNavigate } from "react-router-dom";


/* 2-col styled input */
const InputField = ({ label, type="text", value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-gray-600 text-sm">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl 
                 focus:border-purple-500 outline-none transition"
      placeholder={`Enter your ${label.toLowerCase()}`}
    />
  </div>
);

const TextareaField = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-gray-600 text-sm">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl 
                 focus:border-purple-500 outline-none h-24 transition"
    />
  </div>
);

const ImageUpload = ({ img, handleImageChange }) => (
  <label className="block cursor-pointer">
    <span className="text-gray-600 text-sm">Profile Picture</span>
    <div
      className={`mt-2 border border-gray-300 rounded-xl bg-gray-100 p-4 
                  flex items-center justify-center h-32`}
    >
      {img ? (
        <img src={img} alt="Preview" className="w-full h-full rounded-xl object-cover" />
      ) : (
        <span className="text-gray-500">Click to upload image</span>
      )}
    </div>
    <input type="file" className="hidden" onChange={handleImageChange} />
  </label>
);


const Enroll = () => {
  const [existing, setExisting] = useState(true);
  const [img, setImg] = useState(null);

  const [adminLogin, setAdminLogin] = useState(false);

  const {
    registerUser,
    registerIndicator,
    setRegisterIndicator,
    userId,   
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
    loginAdmin,
    adminData,
    securePath
  } = useContext(WorkContext);

  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    username: "",
    email: "",
    password: "",
    role: "",
    address: "",
    picture: "",
  });

  const [loginUserData, setLoginUserData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({ ...userData, picture: file });
      setImg(URL.createObjectURL(file));
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!existing) {
      const formData = new FormData();
      formData.append("firstName", userData.firstName);
      formData.append("lastName", userData.lastName);
      formData.append("phone", userData.phone);
      formData.append("address", userData.address);
      formData.append("username", userData.username);
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      formData.append("role", userData.role);
      if (userData.picture) {
        formData.append("picture", userData.picture);
      }
      console.log(formData);
      registerUser(formData, "new");
    } else {
      const loginData = {
  username: loginUserData.username,
  email: loginUserData.email,
  password: loginUserData.password,
  role: loginUserData.role || userData.role,   // backup
};

      registerUser(loginData, "login");
    }
  };

  useEffect(() => {
    if (registerIndicator) {
      if (userData.role === "Seeker" || loginUserData.role === "Seeker") {
        setSeekerToken(userToken);
        setSeekerId(userId);
      } else if (
        userData.role === "Authority" ||
        loginUserData.role === "Authority"
      ) {
        setAuthorityId(userId);
        setAuthorityToken(userToken);
      }

      // const id = localStorage.getItem("userId");


      setUserData({
        firstName: "",
        lastName: "",
        phone: "",
        username: "",
        email: "",
        password: "",
        role: "",
        picture: "",
        address: "",
      });
      setImg(null);
      setRegisterIndicator(false);
    }
  }, [registerIndicator, userData.role, userId, userToken,securePath]);

  useEffect(() => {
    setLoginUserData({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role,
    });
    console.log(loginUserData);
  }, [userData]);



  const [adminForm, setAdminForm] = useState({
    adminName:"",
    secretCode:""
  })

  const loginAdminHandler = async(e)=>{

    e.preventDefault();
      await loginAdmin(adminForm);
  
   
    }

 return (
  <div className="w-full min-h-screen flex bg-[#0A0A0C]">

    {/* LEFT WELCOME PANEL */}
    <div className="hidden md:flex flex-col justify-center px-16 w-[50%] 
                    bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400
                    text-white relative overflow-hidden">

      {/* Floating Shapes */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-40 h-40 bg-white/20 rounded-3xl blur-2xl -top-6 -left-6"></div>
        <div className="absolute w-32 h-32 bg-white/10 rounded-3xl blur-xl top-40 left-20"></div>
        <div className="absolute w-52 h-52 bg-white/20 rounded-3xl blur-3xl bottom-10 right-10"></div>
      </div>

      <div className="relative z-10">
        <h1 className="text-5xl font-extrabold leading-tight drop-shadow-lg">
          Welcome to <span className="text-white">FitForWork</span>
        </h1>
        <p className="mt-4 text-lg text-white/90 max-w-md">
          Your next opportunity begins here.  
          Explore jobs, connect with employers, and grow your career effortlessly.
        </p>
      </div>
    </div>

    {/* RIGHT FORM PANEL */}
    <div className="w-full md:w-[50%] bg-white py-16 px-8 md:px-16 flex flex-col justify-center">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          {existing ? "Login to Your Account" : "Create Your Account"}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          {existing
            ? "Welcome back! Please enter your details."
            : "Join FitForWork and unlock new opportunities."}
        </p>
      </div>

      {/* ADMIN LOGIN VIEW */}
      {adminLogin ? (
        <form onSubmit={loginAdminHandler} className="space-y-5">

          <InputField
            label="Admin Name"
            value={adminForm.adminName}
            onChange={(v) => setAdminForm({ ...adminForm, adminName: v })}
          />

          <InputField
            label="Secret Code"
            type="password"
            value={adminForm.secretCode}
            onChange={(v) => setAdminForm({ ...adminForm, secretCode: v })}
          />

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold shadow"
          >
            Login
          </button>
        </form>
      ) : (

        /* USER FORM (LOGIN + REGISTER) */
        <form onSubmit={submitHandler} className="space-y-5">

          {/* REGISTER ONLY INPUTS */}
          {!existing && (
            <>
              <InputField
                label="First Name"
                value={userData.firstName}
                onChange={(v) => setUserData({ ...userData, firstName: v })}
              />

              <InputField
                label="Last Name"
                value={userData.lastName}
                onChange={(v) => setUserData({ ...userData, lastName: v })}
              />

              <InputField
                label="Phone Number"
                value={userData.phone}
                onChange={(v) => setUserData({ ...userData, phone: v })}
              />
            </>
          )}

          {/* ALWAYS SHOWN INPUTS */}
          <InputField
            label="Username"
            value={userData.username}
            onChange={(v) => setUserData({ ...userData, username: v })}
          />

          <InputField
            label="Email"
            type="email"
            value={userData.email}
            onChange={(v) => setUserData({ ...userData, email: v })}
          />

          <InputField
            label="Password"
            type="password"
            value={userData.password}
            onChange={(v) => setUserData({ ...userData, password: v })}
          />

          {/* ADDRESS */}
          {!existing && (
            <TextareaField
              label="Address"
              value={userData.address}
              onChange={(v) => setUserData({ ...userData, address: v })}
            />
          )}

          {/* IMAGE UPLOAD */}
          {!existing && (
            <ImageUpload img={img} handleImageChange={handleImageChange} />
          )}

          {/* ROLE SELECT */}
          <div className="flex gap-6 text-gray-800 font-medium mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="Seeker"
                checked={userData.role === "Seeker"}
                onChange={(e) =>
                  setUserData({ ...userData, role: e.target.value })
                }
              />
              Job Seeker
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="Authority"
                checked={userData.role === "Authority"}
                onChange={(e) =>
                  setUserData({ ...userData, role: e.target.value })
                }
              />
              Employer
            </label>
          </div>

          {/* TOGGLE TEXT */}
          <div className="text-center text-sm text-gray-600">
            {existing ? "Don't have an account?" : "Already have an account?"}
            <span
              className="text-purple-600 font-semibold cursor-pointer ml-1 hover:text-purple-800"
              onClick={() => setExisting(!existing)}
            >
              {existing ? "Create one" : "Login instead"}
            </span>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold shadow mt-4"
          >
            {existing ? "Login" : "Create Account"}
          </button>

        </form>
      )}

      {/* ADMIN SWITCH */}
      <div className="text-center mt-8">
        <span
          onClick={() => setAdminLogin(!adminLogin)}
          className="text-gray-700 hover:text-purple-700 cursor-pointer px-4 py-1 font-semibold"
        >
          {adminLogin ? "I am a normal user" : "I am an Admin"}
        </span>
      </div>
    </div>
  </div>
);

}
export default Enroll;
