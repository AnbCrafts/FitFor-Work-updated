import React, { useContext, useEffect, useState } from "react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building2, 
  UploadCloud, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

// --- Reusable UI Components ---

const InputField = ({ label, type = "text", value, onChange, icon: Icon, placeholder }) => (
  <div className="space-y-1.5 ">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg shadow-sm 
                   focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 
                   transition-all duration-200 pl-10 py-2.5 ${Icon ? "pl-10 pr-4" : "px-4"}`}
        placeholder={placeholder}
      />
    </div>
  </div>
); 

const TextareaField = ({ label, value, onChange, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <div className="relative group">
       {Icon && (
        <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg shadow-sm 
                   focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 
                   transition-all duration-200 py-2.5 min-h-[80px] ${Icon ? "pl-10 pr-4" : "px-4"}`}
        placeholder="Enter your full address..."
      />
    </div>
  </div>
);

const ImageUpload = ({ img, handleImageChange }) => (
  <div className="space-y-1.5">
    <span className="text-sm font-medium text-slate-700">Profile Picture</span>
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-all">
      {img ? (
        <img src={img} alt="Preview" className="w-full h-full rounded-xl object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
          <UploadCloud className="w-8 h-8 mb-2 text-indigo-500" />
          <p className="text-xs">
            <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
          </p>
        </div>
      )}
      <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
    </label>
  </div>
);

const RoleCard = ({ selected, type, onClick, icon: Icon, title }) => (
  <div 
    onClick={() => onClick(type)}
    className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 flex-1
      ${selected === type 
        ? "bg-indigo-50 border-indigo-500 shadow-sm" 
        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
  >
    <div className={`p-2 rounded-full mb-2 ${selected === type ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
      <Icon size={20} />
    </div>
    <span className={`text-sm font-medium ${selected === type ? "text-indigo-900" : "text-slate-600"}`}>
      {title}
    </span>
  </div>
);

// --- Main Component ---

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
    userToken,
    loginAdmin,
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
    role: "Seeker", // Default role
    address: "",
    picture: "",
  });

  const [loginUserData, setLoginUserData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const [adminForm, setAdminForm] = useState({
    adminName:"",
    secretCode:""
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
      Object.keys(userData).forEach(key => {
        if(userData[key]) formData.append(key, userData[key]);
      });
      registerUser(formData, "new");
    } else {
      const loginData = {
        username: loginUserData.username,
        email: loginUserData.email,
        password: loginUserData.password,
        role: loginUserData.role || userData.role, 
      };
      registerUser(loginData, "login");
    }
  };

  const loginAdminHandler = async(e) => {
    e.preventDefault();
    await loginAdmin(adminForm);
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

      setUserData({
        firstName: "", lastName: "", phone: "", username: "",
        email: "", password: "", role: "Seeker", picture: "", address: "",
      });
      setImg(null);
      setRegisterIndicator(false);
    }
  }, [registerIndicator, userData.role, userId, userToken, securePath]);

  useEffect(() => {
    setLoginUserData({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role,
    });
  }, [userData]);

  return (
    <div className="w-full min-h-screen flex bg-slate-50 font-sans">
      
      {/* --- LEFT PANEL: Branding & Visuals --- */}
      <div className="hidden md:flex flex-col justify-between p-12 w-[45%] lg:w-[40%] 
                      bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-80 h-80 bg-purple-400/20 rounded-full blur-3xl bottom-10 right-10"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-white font-bold text-2xl tracking-wide flex items-center gap-2">
            <Briefcase className="text-purple-300" /> FitForWork
          </h2>
        </div>

        <div className="relative z-10 mb-20">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Start your journey <br/> with us today.
          </h1>
          <p className="text-indigo-100 text-lg max-w-md leading-relaxed">
            Connect with top employers or find the best talent. Our platform bridges the gap between skill and opportunity.
          </p>
        </div>

        <div className="relative z-10 text-indigo-200 text-sm">
          © 2024 FitForWork Inc. All rights reserved.
        </div>
      </div>

      {/* --- RIGHT PANEL: Form Area --- */}
      <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col justify-center items-center p-6 md:p-12 overflow-y-auto">
        
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {adminLogin ? "Admin Access" : (existing ? "Welcome Back" : "Create Account")}
            </h2>
            <p className="text-slate-500 mt-2">
              {adminLogin 
                ? "Enter your secure credentials." 
                : (existing ? "Please enter your details to sign in." : "Get started with your free account.")}
            </p>
          </div>

          {/* --- ADMIN FORM --- */}
          {adminLogin ? (
            <form onSubmit={loginAdminHandler} className="space-y-6">
              <InputField
                label="Admin Identifier"
                icon={ShieldCheck}
                value={adminForm.adminName}
                onChange={(v) => setAdminForm({ ...adminForm, adminName: v })}
                placeholder="Admin ID"
              />
              <InputField
                label="Secret Key"
                type="password"
                icon={Lock}
                value={adminForm.secretCode}
                onChange={(v) => setAdminForm({ ...adminForm, secretCode: v })}
                placeholder="••••••••"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                Access Dashboard <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            /* --- USER FORM --- */
            <form onSubmit={submitHandler} className="space-y-5">
              
              {/* Role Selection (Only for Registration) */}
              {!existing && (
                <div className="flex gap-4 mb-6">
                  <RoleCard 
                    title="Job Seeker" 
                    type="Seeker" 
                    icon={User} 
                    selected={userData.role} 
                    onClick={(role) => setUserData({ ...userData, role })} 
                  />
                  <RoleCard 
                    title="Employer" 
                    type="Authority" 
                    icon={Building2} 
                    selected={userData.role} 
                    onClick={(role) => setUserData({ ...userData, role })} 
                  />
                </div>
              )}

              {/* Registration Specific Fields */}
              {!existing && (
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    placeholder="John"
                    value={userData.firstName}
                    onChange={(v) => setUserData({ ...userData, firstName: v })}
                  />
                  <InputField
                    label="Last Name"
                    placeholder="Doe"
                    value={userData.lastName}
                    onChange={(v) => setUserData({ ...userData, lastName: v })}
                  />
                </div>
              )}

              {/* Common Fields */}
              <InputField
                label="Username"
                icon={User}
                placeholder="johndoe123"
                value={userData.username}
                onChange={(v) => setUserData({ ...userData, username: v })}
              />

              <InputField
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="john@example.com"
                value={userData.email}
                onChange={(v) => setUserData({ ...userData, email: v })}
              />

              <InputField
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={userData.password}
                onChange={(v) => setUserData({ ...userData, password: v })}
              />

              {/* More Registration Fields */}
              {!existing && (
                <>
                  <InputField
                    label="Phone Number"
                    icon={Phone}
                    placeholder="+1 (555) 000-0000"
                    value={userData.phone}
                    onChange={(v) => setUserData({ ...userData, phone: v })}
                  />
                  <TextareaField
                    label="Address"
                    icon={MapPin}
                    value={userData.address}
                    onChange={(v) => setUserData({ ...userData, address: v })}
                  />
                  <ImageUpload img={img} handleImageChange={handleImageChange} />
                </>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all mt-4"
              >
                {existing ? "Sign In" : "Create Account"}
              </button>
            </form>
          )}

          {/* --- FOOTER LINKS --- */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* Toggle Login/Register */}
            {!adminLogin && (
              <p className="text-center text-sm text-slate-600">
                {existing ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setExisting(!existing)}
                  className="ml-2 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {existing ? "Sign up" : "Log in"}
                </button>
              </p>
            )}

            {/* Toggle Admin */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setAdminLogin(!adminLogin)}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                {adminLogin ? "← Back to User Login" : "Admin Access"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Enroll;