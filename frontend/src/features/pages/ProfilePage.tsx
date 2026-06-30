import SecondaryEmailOtpModal from "./SecondayEmailOtpModel"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import {
  ArrowLeft,
  Camera,
  User as UserIcon,
  Mail,
  Briefcase,
  Loader2,
} from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [secondaryEmailInput, setSecondaryEmailInput] = useState("");
const [sendingOtp, setSendingOtp] = useState(false);
const [secondaryEmailError, setSecondaryEmailError] = useState("");
const [showOtpModal, setShowOtpModal] = useState(false);
const [pendingSecondaryEmail, setPendingSecondaryEmail] = useState("");

  useEffect(() => {
    api.get("/users/me").then((res) => setUser(res.data));
  }, []);

  // ✅ upload function — unchanged
  const uploadImage = async (file: File) => {
    if (!file) return;

    setUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await api.post("/users/upload-profile", data);

      setUser((prev: any) => ({
        ...prev,
        avatar: res.data.avatar + `?t=${Date.now()}`
      }));

      localStorage.setItem("refreshUser", "true");

    } catch (err) {
      console.error(err);
    }

    setUploading(false);
  };

  const uploadCover = async (file: File) => {
    if (!file) return;

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await api.post("/users/upload-cover", data);

      setUser((prev: any) => ({
        ...prev,
        cover_photo: res.data.cover + `?t=${Date.now()}`
      }));

    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async () => {
    console.log("SENDING DATA →", user);   // ✅ DEBUG
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/users/me", {
        first_name: user.first_name,
        last_name: user.last_name,
        gender: user.gender || null,
        professional_role: user.professional_role || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };
const sendSecondaryOtp = async () => {
  setSecondaryEmailError("");

  const email = secondaryEmailInput.trim();

  if (!email) {
    setSecondaryEmailError("Please enter an email");
    return;
  }

  setSendingOtp(true);

  try {
    await api.post("/users/send-secondary-otp", {
      email,
    });

    setPendingSecondaryEmail(email);
    setShowOtpModal(true);

  } catch (err: any) {
    setSecondaryEmailError(
      err?.response?.data?.detail ||
      "Failed to send OTP"
    );
  }

  setSendingOtp(false);
};
const handleSecondaryVerified = (updatedUser: any) => {
  setUser(updatedUser);
  setShowOtpModal(false);
  setSecondaryEmailInput("");
};
  if (!user) {
    return (
      <div className="loadingShell">
        <Loader2 className="spin" size={28} />
        <span>Loading profile…</span>
        <style>{`
          .loadingShell {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #475569;
            font-size: 14px;
            background: #f4f6fb;
          }
          .spin { animation: spin 0.9s linear infinite; color: #1e3a8a; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="profilePage">

      {/* TOP BAR */}
      <div className="topBar">
        <button className="backBtn" onClick={() => navigate("/dashboard")} aria-label="Back to dashboard">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <div className="topBarTitle">
          <h3>My Profile</h3>
          <p>Manage your personal information and account preferences</p>
        </div>
      </div>

      {/* COVER */}
      <div
        className="cover"
        style={{
          backgroundImage: user.cover_photo
            ? `url(http://localhost:8000/${user.cover_photo})`
            : undefined,
        }}
      >
        <div className="coverOverlay" />

        <input
          type="file"
          id="coverInput"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadCover(file);
          }}
        />
        <label htmlFor="coverInput" className="coverBtn">
          <Camera size={14} />
          Change Cover
        </label>
      </div>

      {/* WHITE OVERLAY PANEL */}
      <div className="profileContainer">

        {/* HEADER ROW */}
        <div className="profileHeader">
          <div className="avatarWrapper">
            <img
              src={
                user.avatar
                  ? `http://localhost:8000/${user.avatar}`
                  : "/default.png"
              }
              className="avatar"
              alt="Profile avatar"
            />

            <input
              type="file"
              id="avatarInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
              }}
            />

            <label htmlFor="avatarInput" className="cameraIcon" aria-label="Change profile photo">
              {uploading ? <Loader2 size={15} className="spin" /> : <Camera size={15} />}
            </label>
          </div>

          <div className="userInfo">
            <h2>{user.first_name} {user.last_name}</h2>
            <p className="userEmail">
              <Mail size={13} />
              {user.email}
            </p>
            {user.professional_role && (
              <span className="roleBadge">
                <Briefcase size={11} />
                {user.professional_role.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        {/* FORM */}
        <div className="formBox">
          <div className="formSectionHeader">
            <UserIcon size={15} />
            <span>Personal Information</span>
          </div>

          <div className="grid">
            <div className="fieldGroup">
              <label>First Name</label>
              <input
                value={user.first_name}
                onChange={(e) =>
                  setUser({ ...user, first_name: e.target.value })
                }
              />
            </div>

            <div className="fieldGroup">
              <label>Last Name</label>
              <input
                value={user.last_name}
                onChange={(e) =>
                  setUser({ ...user, last_name: e.target.value })
                }
              />
            </div>

            <div className="fieldGroup">
              <label>Email Address</label>
              <input value={user.email} disabled />
            </div>

            {/* <div className="fieldGroup">
              <label>Secondary Email <span className="optionalTag">Optional</span></label>
              <input placeholder="Add recovery email" />
            </div> */}
            <div className="fieldGroup">
  <label>
    Secondary Email
    <span className="optionalTag">Optional</span>
  </label>

  {user.secondary_email_verified ? (
    <div className="secondaryEmailRow">
      <input
        value={user.secondary_email}
        disabled
      />

      <span className="verifiedBadge">
        ✓ Verified
      </span>
    </div>
  ) : (
    <div className="secondaryEmailRow">
      <input
        placeholder="Add recovery email"
        value={secondaryEmailInput}
        onChange={(e) =>
          setSecondaryEmailInput(e.target.value)
        }
      />

      <button
        type="button"
        className="verifyBtn"
        onClick={sendSecondaryOtp}
        disabled={
          sendingOtp ||
          !secondaryEmailInput.trim()
        }
      >
        {sendingOtp
          ? "Sending..."
          : "Verify"}
      </button>
    </div>
  )}

  {secondaryEmailError && (
    <p className="fieldError">
      {secondaryEmailError}
    </p>
  )}
</div>

            <div className="fieldGroup">
              <label>Gender <span className="optionalTag">Optional</span></label>
              <select
                value={user.gender || ""}
                onChange={(e) =>
                  setUser({ ...user, gender: e.target.value })
                }
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="fieldGroup">
              <label>Professional Role <span className="optionalTag">Optional</span></label>
              <select
                value={user.professional_role || ""}
                onChange={(e) =>
                  setUser({ ...user, professional_role: e.target.value })
                }
              >
                <option value="">Select Role</option>
                <option value="developer">Developer</option>
                <option value="data_scientist">Data Scientist</option>
                <option value="engineer">Engineer</option>
                <option value="ui_ux_designer">UI/UX Designer</option>
                <option value="project_manager">Project Manager</option>
                <option value="business_analyst">Business Analyst</option>
                <option value="student">Student</option>
                <option value="researcher">Researcher</option>
                <option value="operations_manager">Operations Manager</option>
              </select>
            </div>
          </div>

          <div className="formFooter">
            {saved && <span className="savedNote">✓ Profile updated</span>}
            <button className="saveBtn" onClick={updateProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={15} className="spin" /> Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>

      </div>
      {showOtpModal && (
  <SecondaryEmailOtpModal
    email={pendingSecondaryEmail}
    onClose={() => setShowOtpModal(false)}
    onVerified={handleSecondaryVerified}
  />
)}

      {/* STYLES */}
      <style>{`

* { box-sizing: border-box; }

.profilePage {
  padding: 24px;
  background: #f4f6fb;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.spin { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* TOP BAR */
.topBar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  max-width: 980px;
  margin-left: auto;
  margin-right: auto;
}
.backBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px 8px 10px;
  border-radius: 10px;
  border: 1px solid #dbe3ef;
  background: #fff;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(15,23,42,0.05);
  transition: 0.2s;
  flex-shrink: 0;
}
.backBtn:hover {
  background: #eef2ff;
  border-color: #1e3a8a33;
  transform: translateX(-1px);
}
.topBarTitle h3 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #0b1120;
  letter-spacing: -0.2px;
}
.topBarTitle p {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: #64748b;
}

/* COVER — dark navy / deep indigo instead of lavender */
.cover {
  height: 190px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0b1120 0%, #1e3a8a 55%, #312e81 100%);
  background-size: cover;
  background-position: center;
  position: relative;
  margin-bottom: 64px;
  max-width: 980px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
  box-shadow: 0 14px 30px rgba(15,23,42,0.16);
}
.coverOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11,17,32,0.05) 0%, rgba(11,17,32,0.45) 100%);
}
.coverBtn {
  position: absolute;
  bottom: 18px;
  right: 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(6px);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
  color: #1e293b;
  z-index: 2;
  transition: 0.18s;
}
.coverBtn:hover { background: #fff; transform: translateY(-1px); }

/* PROFILE CONTAINER */
.profileContainer {
  max-width: 980px;
  margin: 0 auto;
}

.profileHeader {
  display: flex;
  align-items: flex-end;
  gap: 22px;
  margin-top: -86px;
  margin-bottom: 26px;
  padding: 0 8px;
  position: relative;
  z-index: 3;
}

.avatarWrapper {
  position: relative;
  width: 132px;
  height: 132px;
  flex-shrink: 0;
}
.avatar {
  width: 132px;
  height: 132px;
  border-radius: 22px;
  object-fit: cover;
  border: 4px solid #f4f6fb;
  box-shadow: 0 10px 28px rgba(15,23,42,0.18);
  background: #e2e8f0;
}
.cameraIcon {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #1e3a8a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #f4f6fb;
  box-shadow: 0 4px 10px rgba(30,58,138,0.35);
  transition: 0.18s;
}
.cameraIcon:hover { background: #1d4ed8; }

.userInfo {
  padding-bottom: 6px;
  min-width: 0;
}
.userInfo h2 {
  margin: 0 0 4px;
  font-size: 21px;
  font-weight: 700;
  color: #0b1120;
  letter-spacing: -0.3px;
}
.userEmail {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px;
  font-size: 13px;
  color: #64748b;
}
.roleBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eef2ff;
  color: #1e3a8a;
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: capitalize;
}

/* FORM CARD */
.formBox {
  background: #fff;
  border: 1px solid #e7ebf3;
  padding: 26px 28px 22px;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(15,23,42,0.06);
}

.formSectionHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eef1f7;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 22px;
}

.fieldGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
}
.optionalTag {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

input, select {
  width: 100%;
  padding: 11px 13px;
  border-radius: 10px;
  border: 1px solid #dbe3ef;
  outline: none;
  transition: 0.18s;
  font-size: 13.5px;
  color: #0b1120;
  background: #f8fafc;
}
input:disabled {
  color: #94a3b8;
  cursor: not-allowed;
  background: #f1f5f9;
}
input:focus, select:focus {
  border-color: #1e3a8a;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(30,58,138,0.12);
}
select { background: #f8fafc; cursor: pointer; }

.formFooter {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #eef1f7;
}
.savedNote {
  font-size: 12.5px;
  font-weight: 600;
  color: #15803d;
}

.saveBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  background: linear-gradient(90deg, #1e3a8a, #312e81);
  color: #fff;
  border: none;
  border-radius: 11px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 700;
  box-shadow: 0 10px 22px rgba(30,58,138,0.25);
  transition: 0.18s;
}
.saveBtn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(30,58,138,0.32); }
.saveBtn:disabled { opacity: 0.7; cursor: not-allowed; }

@media (max-width: 720px) {
  .grid { grid-template-columns: 1fr; }
  .profileHeader { flex-direction: column; align-items: flex-start; margin-top: -60px; }
}
.secondaryEmailRow {
  display: flex;
  gap: 8px;
  align-items: center;
}

.secondaryEmailRow input {
  flex: 1;
}

.verifyBtn {
  padding: 0 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg,#1e3a8a,#312e81);
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.verifyBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.verifiedBadge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  padding: 0 12px;
  min-width: 90px;
  height: 42px;
}

.fieldError {
  color: #ef4444;
  margin-top: 6px;
  font-size: 12px;
}

      `}</style>
    </div>
  );
};

export default ProfilePage;

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../services/api";

// const ProfilePage = () => {
//   const navigate = useNavigate();

//   const [user, setUser] = useState<any>(null);
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     api.get("/users/me").then((res) => setUser(res.data));
//   }, []);

//   // ✅ upload function
//   const uploadImage = async (file: File) => {
//     if (!file) return;

//     setUploading(true);

//     try {
//       const data = new FormData();
//       data.append("file", file);

//       const res = await api.post("/users/upload-profile", data);

//       setUser((prev: any) => ({
//         ...prev,
//         avatar: res.data.avatar + `?t=${Date.now()}`
//       }));

//       localStorage.setItem("refreshUser", "true");

//     } catch (err) {
//       console.error(err);
//     }

//     setUploading(false);
//   };
//   const uploadCover = async (file: File) => {
//   if (!file) return;

//   try {
//     const data = new FormData();
//     data.append("file", file);

//     const res = await api.post("/users/upload-cover", data);

//     setUser((prev: any) => ({
//       ...prev,
//       cover_photo: res.data.cover + `?t=${Date.now()}`
//     }));

//   } catch (err) {
//     console.error(err);
//   }
// };

//   const updateProfile = async () => {
//     console.log("SENDING DATA →", user);   // ✅ DEBUG
//     await api.put("/users/me", {
//       first_name: user.first_name,
//       last_name: user.last_name,
      
// gender: user.gender || null,
//   professional_role: user.professional_role || null,

//     });

//     alert("Profile updated ✅");
//   };

//   if (!user) return <p>Loading...</p>;

//   return (
//     <div className="profilePage">

//       {/* BACK BUTTON */}
//       <div className="topBar">
//         <span className="backBtn" onClick={() => navigate("/dashboard")}>
//           ←
//         </span>
//         <h3>Profile</h3>
//       </div>

//       {/* COVER */}
//       {/* <div className="cover">
//         <button className="coverBtn">📷 Change Cover</button>
//       </div> */}
//       <div
//   className="cover"
//   style={{
//     backgroundImage: user.cover_photo
//       ? `url(http://localhost:8000/${user.cover_photo})`
//       : "linear-gradient(135deg,#4f46e5,#3b82f6)",
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//   }}
// >
//   <input
//     type="file"
//     id="coverInput"
//     style={{ display: "none" }}
//     onChange={(e) => {
//       const file = e.target.files?.[0];
//       if (file) uploadCover(file);
//     }}
//   />

//   <label htmlFor="coverInput" className="coverBtn">
//     📷 Change Cover
//   </label>
// </div>

//       {/* ✅ WHITE OVERLAY PANEL */}
//       <div className="profileContainer">

//         {/* HEADER ROW */}
//         <div className="profileHeader">

//           {/* AVATAR */}
//           <div className="avatarWrapper">
//             <img
//               src={
//                 user.avatar
//                   ? `http://localhost:8000/${user.avatar}`
//                   : "/default.png"
//               }
//               className="avatar"
//             />

//             <input
//               type="file"
//               id="avatarInput"
//               onChange={(e) => {
//                 const file = e.target.files?.[0];
//                 if (file) uploadImage(file);
//               }}
//             />

//             <label htmlFor="avatarInput" className="cameraIcon">
//               📷
//             </label>
//           </div>

//           {/* USER INFO (LEFT SIDE ✅) */}
//           <div className="userInfo">
//             <h2>{user.first_name} {user.last_name}</h2>
//             <p>{user.email}</p>
//           </div>

//         </div>

//         {/* FORM */}
//         <div className="formBox">

//           <div className="grid">

//             <div>
//               <label>First Name</label>
//               <input
//                 value={user.first_name}
//                 onChange={(e) =>
//                   setUser({ ...user, first_name: e.target.value })
//                 }
//               />
//             </div>

//             <div>
//               <label>Last Name</label>
//               <input
//                 value={user.last_name}
//                 onChange={(e) =>
//                   setUser({ ...user, last_name: e.target.value })
//                 }
//               />
//             </div>

//             <div>
//               <label>Email</label>
//               <input value={user.email} disabled />
//             </div>

//             <div>
//               <label>Secondary Email</label>
//               <input placeholder="Add recovery email" />
//             </div>

//             {/* GENDER */}
// <div>
//   <label>Gender (Optional)</label>
//   <select
//     value={user.gender || ""}
//     onChange={(e) =>
//       setUser({ ...user, gender: e.target.value })
//     }
//   >
//     <option value="">Select Gender</option>
//     <option value="male">Male</option>
//     <option value="female">Female</option>
//   </select>
// </div>

// {/* PROFESSIONAL ROLE */}
// <div>
//   <label>Professional Role (Optional)</label>
//   <select
//     value={user.professional_role || ""}
//     onChange={(e) =>
//       setUser({ ...user, professional_role: e.target.value })
//     }
//   >
//     <option value="">Select Role</option>
//     <option value="developer">Developer</option>
//     <option value="data_scientist">Data Scientist</option>
//     <option value="engineer">Engineer</option>
//     <option value="ui_ux_designer">UI/UX Designer</option>
//     <option value="project_manager">Project Manager</option>
//     <option value="business_analyst">Business Analyst</option>
//     <option value="student">Student</option>
//     <option value="researcher">Researcher</option>
//     <option value="operations_manager">Operations Manager</option>
//   </select>
// </div>

//           </div>

//           <button className="saveBtn" onClick={updateProfile}>
//             Save Changes
//           </button>

//         </div>

//       </div>

//       {/* STYLES */}
//       <style>{`

// .profilePage {
//   padding:20px;
//   background:#f8fafc;
// }

// /* HEADER */
// .topBar {
//   display:flex;
//   align-items:center;
//   gap:10px;
//   margin-bottom:15px;
// }

// .backBtn {
//   font-size:20px;
//   cursor:pointer;
// }

// /* COVER */
// .cover {
//   height:180px;
//   border-radius:12px;
//   background:linear-gradient(135deg,#4f46e5,#3b82f6);
//   position:relative;
//   margin-bottom:60px; 
// }

// .coverBtn {
//   position:absolute;
//   bottom:20px;
//   right:20px;
//   padding:8px 12px;
//   background:white;
//   border:none;
//   border-radius:8px;
//   cursor:pointer;
// }

// /* PROFILE CARD */
// .profileCard {
//   display:flex;
//   align-items:flex-end;
//   gap:10px;
//   margin-bottom:30px;
// }

// /* AVATAR */
// .avatarWrapper {
//   position:relative;
//   width:150px;
//   height:150px;
//   margin-top:-75px;
// }

// .avatar {
//   width:150px;
//   height:150px;
//   border-radius:50%;
//   object-fit:cover;
//   border:5px solid white;
//   box-shadow: 0 8px 25px rgba(0,0,0,0.15);
// }

// /* HIDE INPUT */
// #avatarInput {
//   display:none;
// }

// /* CAMERA */
// .cameraIcon {
//   position:absolute;
//   bottom:5px;
//   right:5px;
//   width:36px;
//   height:36px;
//   border-radius:50%;
//   background:#6366f1;
//   color:white;
//   display:flex;
//   align-items:center;
//   justify-content:center;
//   cursor:pointer;
//   border:2px solid white;
// }

// /* FORM */
// .formBox {
//   background:white;
//   padding:20px;
//   margin-top:20px;
//   border-radius:12px;
// }

// .grid {
//   display:grid;
//   grid-template-columns:1fr 1fr;
//   gap:20px;
// }

// label {
//   font-size:12px;
//   color:#64748b;
// }

// input {
//   width:100%;
//   padding:12px;
//   border-radius:10px;
//   border:1px solid #d1d5db;
//   margin-top:5px;
//   outline:none;
//   transition:0.2s;
// }
//   select {
//   width:100%;
//   padding:12px;
//   border-radius:10px;
//   border:1px solid #d1d5db;
//   margin-top:5px;
//   outline:none;
//   transition:0.2s;
//   background:white;
// }

// select:focus {
//   border-color:#6366f1;
//   box-shadow:0 0 0 3px rgba(99,102,241,0.2);
// }

// /* BLUE FOCUS */
// input:focus {
//   outline:none;
//   border-color:#6366f1;
//   box-shadow:0 0 0 3px rgba(99,102,241,0.2);
// }

// .saveBtn {
//   margin-top:20px;
//   padding:12px;
//   background:#6366f1;
//   color:white;
//   border:none;
//   border-radius:10px;
//   cursor:pointer;
// }

//       `}</style>
//     </div>
//   );
// };

// export default ProfilePage;