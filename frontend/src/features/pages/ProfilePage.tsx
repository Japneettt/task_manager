import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/users/me").then((res) => setUser(res.data));
  }, []);

  // ✅ upload function
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
    await api.put("/users/me", {
      first_name: user.first_name,
      last_name: user.last_name,
      
gender: user.gender || null,
  professional_role: user.professional_role || null,

    });

    alert("Profile updated ✅");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profilePage">

      {/* BACK BUTTON */}
      <div className="topBar">
        <span className="backBtn" onClick={() => navigate("/dashboard")}>
          ←
        </span>
        <h3>Profile</h3>
      </div>

      {/* COVER */}
      {/* <div className="cover">
        <button className="coverBtn">📷 Change Cover</button>
      </div> */}
      <div
  className="cover"
  style={{
    backgroundImage: user.cover_photo
      ? `url(http://localhost:8000/${user.cover_photo})`
      : "linear-gradient(135deg,#4f46e5,#3b82f6)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  <input
    type="file"
    id="coverInput"
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) uploadCover(file);
    }}
  />

  <label htmlFor="coverInput" className="coverBtn">
    📷 Change Cover
  </label>
</div>

      {/* ✅ WHITE OVERLAY PANEL */}
      <div className="profileContainer">

        {/* HEADER ROW */}
        <div className="profileHeader">

          {/* AVATAR */}
          <div className="avatarWrapper">
            <img
              src={
                user.avatar
                  ? `http://localhost:8000/${user.avatar}`
                  : "/default.png"
              }
              className="avatar"
            />

            <input
              type="file"
              id="avatarInput"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
              }}
            />

            <label htmlFor="avatarInput" className="cameraIcon">
              📷
            </label>
          </div>

          {/* USER INFO (LEFT SIDE ✅) */}
          <div className="userInfo">
            <h2>{user.first_name} {user.last_name}</h2>
            <p>{user.email}</p>
          </div>

        </div>

        {/* FORM */}
        <div className="formBox">

          <div className="grid">

            <div>
              <label>First Name</label>
              <input
                value={user.first_name}
                onChange={(e) =>
                  setUser({ ...user, first_name: e.target.value })
                }
              />
            </div>

            <div>
              <label>Last Name</label>
              <input
                value={user.last_name}
                onChange={(e) =>
                  setUser({ ...user, last_name: e.target.value })
                }
              />
            </div>

            <div>
              <label>Email</label>
              <input value={user.email} disabled />
            </div>

            <div>
              <label>Secondary Email</label>
              <input placeholder="Add recovery email" />
            </div>

            {/* GENDER */}
<div>
  <label>Gender (Optional)</label>
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

{/* PROFESSIONAL ROLE */}
<div>
  <label>Professional Role (Optional)</label>
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

          <button className="saveBtn" onClick={updateProfile}>
            Save Changes
          </button>

        </div>

      </div>

      {/* STYLES */}
      <style>{`

.profilePage {
  padding:20px;
  background:#f8fafc;
}

/* HEADER */
.topBar {
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:15px;
}

.backBtn {
  font-size:20px;
  cursor:pointer;
}

/* COVER */
.cover {
  height:180px;
  border-radius:12px;
  background:linear-gradient(135deg,#4f46e5,#3b82f6);
  position:relative;
  margin-bottom:60px; 
}

.coverBtn {
  position:absolute;
  bottom:20px;
  right:20px;
  padding:8px 12px;
  background:white;
  border:none;
  border-radius:8px;
  cursor:pointer;
}

/* PROFILE CARD */
.profileCard {
  display:flex;
  align-items:flex-end;
  gap:10px;
  margin-bottom:30px;
}

/* AVATAR */
.avatarWrapper {
  position:relative;
  width:150px;
  height:150px;
  margin-top:-75px;
}

.avatar {
  width:150px;
  height:150px;
  border-radius:50%;
  object-fit:cover;
  border:5px solid white;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

/* HIDE INPUT */
#avatarInput {
  display:none;
}

/* CAMERA */
.cameraIcon {
  position:absolute;
  bottom:5px;
  right:5px;
  width:36px;
  height:36px;
  border-radius:50%;
  background:#6366f1;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  border:2px solid white;
}

/* FORM */
.formBox {
  background:white;
  padding:20px;
  margin-top:20px;
  border-radius:12px;
}

.grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:20px;
}

label {
  font-size:12px;
  color:#64748b;
}

input {
  width:100%;
  padding:12px;
  border-radius:10px;
  border:1px solid #d1d5db;
  margin-top:5px;
  outline:none;
  transition:0.2s;
}
  select {
  width:100%;
  padding:12px;
  border-radius:10px;
  border:1px solid #d1d5db;
  margin-top:5px;
  outline:none;
  transition:0.2s;
  background:white;
}

select:focus {
  border-color:#6366f1;
  box-shadow:0 0 0 3px rgba(99,102,241,0.2);
}

/* BLUE FOCUS */
input:focus {
  outline:none;
  border-color:#6366f1;
  box-shadow:0 0 0 3px rgba(99,102,241,0.2);
}

.saveBtn {
  margin-top:20px;
  padding:12px;
  background:#6366f1;
  color:white;
  border:none;
  border-radius:10px;
  cursor:pointer;
}

      `}</style>
    </div>
  );
};

export default ProfilePage;