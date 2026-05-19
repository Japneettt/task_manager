import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
 
const AcceptInvite = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
 
  const email = params.get("email");
 
  const acceptInvite = async () => {
    const res = await api.post("/teams/invite/accept", null, {
      params: { email },
    });
 
    const teamId = res.data.team_id;
 
    navigate(`/teams/${teamId}`);
  };
 
  return (
    <div style={{ padding: "40px" }}>
      <h2>You’ve been invited 🎉</h2>
 
      <button onClick={acceptInvite}>
        Accept Invite
      </button>
    </div>
  );
};
 
export default AcceptInvite;