import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
  id: string;
  name: string;
  type: string;
  description?: string;
  image_url?: string;
  member_count?: number;
  project_count?: number;
  last_activity?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const gradients = [
  "from-violet-500 to-purple-600",
  "from-indigo-500 to-blue-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-sky-600",
];

const getGradient = (name: string) =>
  gradients[name.charCodeAt(0) % gradients.length];

const timeAgo = (ts?: string) => {
  if (!ts) return "Recently active";
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (d < 1) return "Just now";
  if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
    <div className="h-32 bg-slate-100 animate-pulse" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-slate-100 rounded-full w-2/3 animate-pulse" />
      <div className="h-2.5 bg-slate-100 rounded-full w-full animate-pulse" />
    </div>
  </div>
);

// ─── Team Card ────────────────────────────────────────────────────────────────

const TeamCard: React.FC<{ team: Team; index: number; onClick: () => void }> = ({
  team,
  index,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const imageUrl = team.image_url
    ? `http://localhost:8000${team.image_url}`
    : null;
  const gradient = getGradient(team.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        boxShadow: hovered
          ? "0 16px 40px rgba(99,102,241,0.16), 0 0 0 1.5px rgba(99,102,241,0.22)"
          : "0 2px 16px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.05)",
        transition: "box-shadow 0.3s ease",
      }}
      className="rounded-2xl overflow-hidden bg-white cursor-pointer group relative"
    >
      {/* Cover — shorter height for 4-col layout */}
      <div className="relative h-32 overflow-hidden">
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={team.name}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} relative overflow-hidden`}
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-white/10 rounded-full" />
            {/* Large faint initials watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-white/20 select-none">
              {getInitials(team.name)}
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border border-white/25 ${
              team.type === "public"
                ? "bg-emerald-500/20 text-emerald-100"
                : "bg-violet-500/20 text-violet-100"
            }`}
          >
            {team.type === "public" ? "🌐 Public" : "🔒 Private"}
          </span>
        </div>

        {/* Avatar + Name at bottom of cover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end gap-2">
          {/* Avatar always shows gradient + initials */}
          <div
            className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white/30 flex-shrink-0`}
          >
            {getInitials(team.name)}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-bold text-sm leading-tight drop-shadow-sm truncate">
              {team.name}
            </h3>
            <p className="text-white/70 text-[10px] font-medium mt-0.5">
              {timeAgo(team.last_activity)}
            </p>
          </div>
        </div>
      </div>

      {/* Body — description only, no stats */}
      <div className="px-3 py-2.5">
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 min-h-[32px]">
          {team.description || "A collaborative workspace for your team."}
        </p>

        {/* Action button — fades in on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
          transition={{ duration: 0.2 }}
          className="mt-2"
        >
          <button
            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-shadow"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Open Team →
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="flex flex-col items-center justify-center py-28 px-8 text-center"
  >
    <div className="relative mb-8">
      <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-5xl shadow-inner">
        👥
      </div>
      <div className="absolute -top-2 -right-2 w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-base shadow-lg">
        ✦
      </div>
    </div>
    <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
      No teams yet
    </h2>
    <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
      Create your first team to start collaborating with your teammates.
    </p>
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onCreate}
      className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-violet-200 hover:shadow-violet-300 transition-shadow"
    >
      + Create your first team
    </motion.button>
  </motion.div>
);

// ─── Step Dot ─────────────────────────────────────────────────────────────────

const StepDot: React.FC<{ active: boolean; done: boolean; label: string }> = ({
  active,
  done,
  label,
}) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
        done
          ? "bg-violet-600 text-white"
          : active
          ? "bg-violet-600 text-white ring-4 ring-violet-100"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {done ? "✓" : active ? "●" : "○"}
    </div>
    <span
      className={`text-[10px] font-semibold ${
        active || done ? "text-violet-700" : "text-slate-400"
      }`}
    >
      {label}
    </span>
  </div>
);

// ─── Create Team Modal ────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: (teamId: string) => void;
}

const CreateTeamModal: React.FC<ModalProps> = ({ isOpen, onClose, onDone }) => {
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [teamType, setTeamType] = useState("private");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamImage, setTeamImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [createdTeamId, setCreatedTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep(1);
    setTeamName("");
    setTeamType("private");
    setTeamDesc("");
    setTeamImage(null);
    setImagePreview(null);
    setEmails([]);
    setInput("");
    setCreatedTeamId("");
    setLoading(false);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setTeamImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleCreate = async () => {
    if (!teamName.trim()) {
      setError("Team name is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      let res;
      if (teamImage) {
        const fd = new FormData();
        fd.append("name", teamName);
        fd.append("type", teamType);
        fd.append("description", teamDesc);
        fd.append("image", teamImage);
        res = await api.post("/teams", fd);
      } else {
        res = await api.post("/teams", {
          name: teamName,
          type: teamType,
          description: teamDesc,
        });
      }
      setCreatedTeamId(res.data.id);
      setStep(2);
    } catch {
      setError("Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    setLoading(true);
    try {
      if (emails.length > 0) {
        await api.post(`/teams/${createdTeamId}/invite`, { emails });
      }
      reset();
      onDone(createdTeamId);
    } catch {
      setError("Invites failed, but team was created.");
      onDone(createdTeamId);
    } finally {
      setLoading(false);
    }
  };

  const addEmail = () => {
    const trimmed = input.trim();
    if (!trimmed || emails.includes(trimmed)) return;
    setEmails([...emails, trimmed]);
    setInput("");
  };

  const removeEmail = (e: string) =>
    setEmails(emails.filter((x) => x !== e));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,10,40,0.55)", backdropFilter: "blur(14px)" }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs bg-white rounded-xl shadow-xl overflow-hidden"
            // className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.1)" }}
          >
            {/* Top gradient bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

            {/* Header */}
            {/* <div className="px-6 pt-5 pb-4"> */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-0.5">
                    {step === 1 ? "New Team" : "Invite Members"}
                  </p>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {step === 1 ? "Set up your team" : "Bring your team in"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {step === 1
                      ? "Give your workspace a name and identity."
                      : "Invite teammates by email. You can always do this later."}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 text-sm transition-colors mt-0.5"
                >
                  ✕
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <StepDot active={step === 1} done={step > 1} label="Details" />
                <div className="flex-1 h-px bg-slate-100" />
                <StepDot active={step === 2} done={false} label="Invite" />
              </div>
            </div>

            {/* Body */}
            {/* <div className="px-6 pb-6"> */}
            <div className="px-4 pb-4">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5"
                  >
                    {/* Image upload */}
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="group relative w-full h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-300 bg-slate-50 hover:bg-violet-50/50 cursor-pointer transition-all overflow-hidden flex items-center justify-center"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-xl mb-0.5">🖼️</div>
                          <p className="text-[11px] font-semibold text-slate-400 group-hover:text-violet-500 transition-colors">
                            Upload team cover image
                          </p>
                          <p className="text-[10px] text-slate-300 mt-0.5">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>

                    {/* Team name */}
                    <div className="space-y-1">
  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
    Team Name *
  </label>
  <input
    placeholder="e.g. Design Team, Engineering"
    value={teamName}
    onChange={(e) => {
      setTeamName(e.target.value);
      if (error) setError("");
    }}
    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
  />
</div>
                    

                    {/* Visibility */}
                    {/* <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                        Visibility
                      </label> */}
                      <div className="space-y-1">
  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
    Visibility
  </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["private", "public"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTeamType(t)}
                            className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all ${
                              teamType === t
                                ? "border-violet-500 bg-violet-50 text-violet-700"
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            {t === "private" ? "🔒 Private" : "🌐 Public"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
    Description
  </label>
  <textarea
    placeholder="What does this team do?"
    value={teamDesc}
    onChange={(e) => setTeamDesc(e.target.value)}
    rows={2}
    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
  />
</div>


                    {error && (
                      <p className="text-xs text-rose-500 font-semibold">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={handleCreate}
                      disabled={loading}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-all disabled:opacity-60 mt-1"
                    >
                      {loading ? "Creating…" : "Continue →"}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5"
                  >
                    {/* Add by email — properly aligned row */}
                    {/* <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                        Add by Email
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="colleague@company.com"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addEmail()}
                          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                        />
                        <button
                          onClick={addEmail}
                          className="px-4 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors flex-shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div> */}
                    <div className="space-y-1">
  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
    Add by Email
  </label>

  <div className="flex items-center gap-1.5">
    <input
      type="email"
      placeholder="colleague@company.com"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && addEmail()}
      className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
    />

    <button
      onClick={addEmail}
      className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 flex-shrink-0"
    >
      Add
    </button>
  </div>
</div>

                    {/* Email chips */}
                    {emails.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {emails.map((e) => (
                          <span
                            key={e}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-100"
                          >
                            {e}
                            <button
                              onClick={() => removeEmail(e)}
                              className="text-violet-400 hover:text-violet-700 ml-0.5 text-xs leading-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-4 text-center text-slate-400">
                        <span className="text-2xl mb-1">📬</span>
                        <p className="text-xs">No invites added yet. You can skip this step.</p>
                      </div>
                    )}

                    {error && (
                      <p className="text-xs text-rose-500 font-semibold">{error}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onDone(createdTeamId)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors"
                      >
                        Skip for now
                      </button>
                      <button
                        onClick={handleInvite}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-violet-200 hover:shadow-violet-300 transition-all disabled:opacity-60"
                      >
                        {loading ? "Sending…" : "Send invites ✓"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to fetch teams", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDone = (teamId: string) => {
    setModalOpen(false);
    fetchTeams();
    navigate(`/teams/${teamId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header — no "WORKSPACES" label */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Team Projects
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {teams.length} team{teams.length !== 1 ? "s" : ""} · All your collaborative workspaces
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-shadow"
          >
            <span className="text-base leading-none">+</span>
            New Team
          </motion.button>
        </div>

        {/* Grid — 4 columns */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <EmptyState onCreate={() => setModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {teams.map((team, i) => (
              <TeamCard
                key={team.id}
                team={team}
                index={i}
                onClick={() => navigate(`/teams/${team.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateTeamModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDone={handleDone}
      />
    </div>
  );
}
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../services/api";

// const TeamsPage = () => {
//   const [teams, setTeams] = useState<any[]>([]);
//   const navigate = useNavigate();
  
//   // ✅ CREATE TEAM MODAL STATE
// const [showCreateModal, setShowCreateModal] = useState(false);
// const [step, setStep] = useState(1);

// const [teamName, setTeamName] = useState("");
// const [teamType, setTeamType] = useState("private");
// const [teamDesc, setTeamDesc] = useState("");
// const [teamImage, setTeamImage] = useState<File | null>(null);

// const [emails, setEmails] = useState<string[]>([]);
// const [input, setInput] = useState("");

// const [createdTeamId, setCreatedTeamId] = useState("");

//   const fetchTeams = async () => {
//     const res = await api.get("/teams");
//     setTeams(res.data);
//   };

//   useEffect(() => {
//     fetchTeams();

//     const interval = setInterval(() => {
//       fetchTeams();
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);
  


//   const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
// const inputStyle = {
//   width: "100%",
//   padding: "10px",
//   marginTop: "10px",
//   borderRadius: "8px",
//   border: "1px solid #ddd",
// };

// const primaryBtn = {
//   marginTop: "15px",
//   width: "100%",
//   padding: "10px",
//   background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//   color: "white",
//   border: "none",
//   borderRadius: "8px",
//   cursor: "pointer",
// };
//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>My Team Projects 👥</h2>

//       {/* ✅ CREATE TEAM */}
//       <button
//       onClick={() => setShowCreateModal(true)}
//         // onClick={() => navigate("/teams/create")}
//         style={{
//           marginBottom: "20px",
//           padding: "10px",
//           background: "#4f46e5",
//           color: "#fff",
//           borderRadius: "8px",
//           border: "none",
//         }}
//       >
//         + Create New Team
//       </button>

//       {/* ✅ LIST TEAMS */}
//       <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
//         {teams.map((team) => {
          
// const imageUrl=team.image_url
//     ? `http://localhost:8000${team.image_url}`
//     : "https://source.unsplash.com/random/800x600?abstract";

//           // const imageUrl =
//           //   team.image_url ||
//           //   "https://source.unsplash.com/random/800x600?abstract";

//           return (
//             <div
//               key={team.id}
//               onClick={() => navigate(`/teams/${team.id}`)}
//               onMouseEnter={() => setHoveredTeam(team.id)}
//               onMouseLeave={() => setHoveredTeam(null)}
//               style={{
//                 width: "260px",
//                 borderRadius: "18px",
//                 overflow: "hidden",
//                 cursor: "pointer",
//                 boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
//                 transform:
//                   hoveredTeam === team.id ? "scale(1.02)" : "scale(1)",
//                 transition: "transform 0.25s ease, box-shadow 0.25s ease",
//                 background: "#fff",
//               }}
//             >
//               <div
//                 style={{
//                   position: "relative",
//                   height: "140px",
//                   backgroundImage: `url(${imageUrl})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                 }}
//               >
//                 <div
//                   style={{
//                     position: "absolute",
//                     inset: 0,
//                     background:
//                       "linear-gradient(to top, rgba(0,0,0,0.45), transparent)",
//                   }}
//                 />
//                 <div
//                   style={{
//                     position: "absolute",
//                     bottom: "16px",
//                     left: "16px",
//                     color: "#fff",
//                     zIndex: 1,
//                   }}
//                 >
//                   <h4 style={{ margin: 0 }}>{team.name}</h4>
//                   <p style={{ margin: "6px 0 0", opacity: 0.9 }}>
//                     {team.type}
//                   </p>
//                 </div>
//               </div>
//               <div style={{ padding: "16px" }}>
//                 <p
//                   style={{
//                     margin: 0,
//                     color: "#475569",
//                     minHeight: "48px",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {team.description || "A modern team workspace."}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       {/* ✅ CREATE TEAM + INVITE MODAL */}
// {showCreateModal && (
//   <div
//     style={{
//       position: "fixed",
//       inset: 0,
//       background: "rgba(0,0,0,0.5)",
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       zIndex: 1000,
//     }}
//   >
//     <div
//       style={{
//         width: "420px",
//         background: "white",
//         padding: "25px",
//         borderRadius: "16px",
//       }}
//     >

//       {/* ✅ STEP 1 */}
//       {step === 1 && (
//         <>
//           <h3>Create Team 🚀</h3>

//           <input
//             placeholder="Team Name"
//             value={teamName}
//             onChange={(e) => setTeamName(e.target.value)}
//             style={inputStyle}
//           />

//           <select
//             value={teamType}
//             onChange={(e) => setTeamType(e.target.value)}
//             style={inputStyle}
//           >
//             <option value="private">Private</option>
//             <option value="public">Public</option>
//           </select>

//           <input
//             placeholder="Description"
//             value={teamDesc}
//             onChange={(e) => setTeamDesc(e.target.value)}
//             style={inputStyle}
//           />

//           <input
//             type="file"
//             onChange={(e) =>
//               setTeamImage(e.target.files?.[0] || null)
//             }
//           />

//           <button
//             style={primaryBtn}
//             onClick={async () => {
//               if (!teamName) return;

//               let res;

//               if (teamImage) {
//                 const fd = new FormData();
//                 fd.append("name", teamName);
//                 fd.append("type", teamType);
//                 fd.append("description", teamDesc);
//                 fd.append("image", teamImage);

//                 res = await api.post("/teams", fd);
//               } else {
//                 res = await api.post("/teams", {
//                   name: teamName,
//                   type: teamType,
//                   description: teamDesc,
//                 });
//               }

//               setCreatedTeamId(res.data.id);
//               setStep(2); // ✅ move to invite step
//             }}
//           >
//             Continue
//           </button>
//         </>
//       )}

//       {/* ✅ STEP 2 */}
//       {step === 2 && (
//         <>
//           <h3>Invite Team 👥</h3>

//           <div style={{ display: "flex", gap: "10px" }}>
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Enter email"
//               style={inputStyle}
//             />

//             <button
//               onClick={() => {
//                 if (!input) return;
//                 setEmails([...emails, input]);
//                 setInput("");
//               }}
//             >
//               Add
//             </button>
//           </div>

//           <div style={{ marginTop: "10px" }}>
//             {emails.map((e, i) => (
//               <div key={i}>{e}</div>
//             ))}
//           </div>

//           <button
//             style={primaryBtn}
//             onClick={async () => {
//               if (emails.length > 0) {
//                 await api.post(`/teams/${createdTeamId}/invite`, {
//                   emails,
//                 });
//               }

//               // ✅ CLOSE + RESET
//               setShowCreateModal(false);
//               setStep(1);
//               setTeamName("");
//               setEmails([]);

//               navigate(`/teams/${createdTeamId}`);
//             }}
//           >
//             Finish
//           </button>
//         </>
//       )}
//     </div>
//   </div>
// )}
//     </div>
//   );
// };

// export default TeamsPage;
