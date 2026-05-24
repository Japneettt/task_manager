import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useEffect } from "react";
 
const AcceptInvite = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
 
  useEffect(() => {
    const accept = async () => {
      const res = await api.patch(`/teams/invites/${inviteId}/accept`);
      navigate(`/teams/${res.data.team_id}`);
    };
 
    accept();
  }, []);
 
  return <h2>Joining team...</h2>;
};
 
export default AcceptInvite;
 