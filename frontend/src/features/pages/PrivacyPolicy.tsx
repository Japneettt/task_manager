import workivoLogo from "../../assets/workivo-logo.png";
import {Link} from "react-router-dom"
// ── Inline SVG icons ──────────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const lastUpdated = "June 19, 2026";
const effectiveDate = "June 19, 2026";

const sections = [
  {
    id: "overview",
    title: "1. Overview",
    body: (
      <>
        <p>
          Workivo, Inc. ("Workivo," "we," "us," or "our") provides a
          cloud-based team collaboration and project management platform
          that lets individuals create Personal Boards and teams create
          Team Workspaces, organize work into Kanban-style Lists, assign
          Tasks with due dates, and collaborate in real time, including
          through an AI-powered assistant ("the Service").
        </p>
        <p>
          This Privacy Policy explains what personal information we
          collect, how and why we use it, who we share it with, and the
          rights and choices available to you. It applies to all users of
          the Service worldwide and is designed to meet the requirements of
          the EU/UK General Data Protection Regulation ("GDPR"), the
          California Consumer Privacy Act as amended by the California
          Privacy Rights Act ("CCPA/CPRA"), and general SaaS industry
          best practices.
        </p>
        <p>
          By creating a Workivo account or otherwise using the Service, you
          acknowledge that you have read this Privacy Policy. Where required
          by applicable law, we will obtain your explicit consent before
          processing your personal information for specific purposes.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "2. Information We Collect",
    body: (
      <>
        <p><strong>Account information.</strong> When you register, we collect your name, email address, and a hashed and salted password. Passwords are never stored in plain text and are not retrievable by Workivo staff. If you register or sign in using Google Sign-In, we collect the basic profile information Google shares with us under your consent, typically your name, email address, and profile photo.</p>
        <p><strong>Profile information.</strong> You may optionally add or update a profile photo and other profile details through Profile Management.</p>
        <p><strong>Team and workspace information.</strong> When you create or join a Team Workspace, we collect information about the workspace, including its name, member list, assigned roles (Owner, Admin, Member), and invitation records.</p>
        <p><strong>Board, list, and task information.</strong> This includes the content of your Personal Boards and Team Workspace Boards, Lists, Tasks, due dates, comments, attachments, and any files you upload.</p>
        <p><strong>AI Assistant interactions.</strong> When you use the AI-integrated chatbot, we collect the questions and prompts you submit, along with the workspace and task data the Assistant retrieves on your behalf, in order to generate a response and to maintain a record of that interaction for quality and support purposes.</p>
        <p><strong>Analytics and usage data.</strong> We collect information about how you interact with the Service, such as features used, Boards viewed, Tasks completed, session duration, and navigation patterns, to understand product usage and improve the Service.</p>
        <p><strong>Device and log data.</strong> We automatically collect IP address, browser type and version, operating system, device identifiers, referring URLs, and access timestamps when you use the Service.</p>
        <p><strong>Information from cookies.</strong> We and our service providers use cookies and similar technologies as described in Section 4 (Cookies and Tracking Technologies).</p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    body: (
      <>
        <p>We use the personal information described above for the following purposes, and on the following legal bases where GDPR applies:</p>
        <ul>
          <li><strong>To provide the Service</strong> (performance of a contract) — creating and authenticating your account, including via JWT-based session management; enabling Personal Boards, Team Workspaces, Lists, Tasks, due dates, and team invitations; powering the AI Assistant's retrieval of your workspace data to answer your questions; sending email verification and password reset messages</li>
          <li><strong>To communicate with you</strong> (performance of a contract / legitimate interest) — notifications about task assignments, due dates, team activity, and account or security alerts; responding to support requests; sending administrative and policy-related communications</li>
          <li><strong>To maintain security and integrity</strong> (legitimate interest / legal obligation) — detecting and preventing fraud, abuse, and unauthorized access; enforcing our Terms of Service; maintaining audit and log data</li>
          <li><strong>To improve and develop the Service</strong> (legitimate interest) — analyzing aggregated usage patterns; improving the AI Assistant's accuracy and the underlying knowledge base using de-identified or aggregated interaction data; testing new features</li>
          <li><strong>To comply with legal obligations</strong> (legal obligation) — retaining records as required by law, tax, or accounting rules, and responding to lawful requests from courts or government authorities</li>
          <li><strong>With your consent</strong> (consent), where required, such as for certain marketing communications or non-essential cookies, which you may withdraw at any time</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies and Tracking Technologies",
    body: (
      <>
        <p>We use cookies and similar technologies (such as local storage and pixels) for the following purposes:</p>
        <ul>
          <li><strong>Strictly necessary cookies</strong> — required for core functionality such as authentication, session management, and security; these cannot be disabled without affecting the Service</li>
          <li><strong>Preference cookies</strong> — remember settings such as your display preferences and last-viewed Board</li>
          <li><strong>Analytics cookies</strong> — help us understand aggregate usage patterns and improve the Service</li>
        </ul>
        <p>
          Where required by applicable law, we will request your consent
          before setting non-essential cookies and will provide a mechanism
          to manage your preferences. You can also control cookies through
          your browser settings, though disabling certain cookies may limit
          your ability to use parts of the Service.
        </p>
      </>
    ),
  },
  {
    id: "third-party-services",
    title: "5. Third-Party Services",
    body: (
      <>
        <p>We work with the following categories of third-party service providers, who process personal information on our behalf or in connection with their own services:</p>
        <ul>
          <li><strong>Authentication providers</strong> — Google, for Google Sign-In, processes authentication data under its own privacy policy</li>
          <li><strong>Cloud infrastructure and hosting providers</strong> — store and process account, workspace, and Board data on our behalf under data processing agreements</li>
          <li><strong>Email delivery providers</strong> — send verification, password reset, and notification emails on our behalf</li>
          <li><strong>Analytics providers</strong> — help us understand product usage on an aggregated basis</li>
          <li><strong>AI model and knowledge base providers</strong> — process queries submitted to the AI Assistant and the workspace data necessary to generate a response, under contractual terms that restrict their use of that data to providing the service to us</li>
        </ul>
        <p>
          Each provider is contractually bound to use personal information
          only to provide services to us and in accordance with this Privacy
          Policy and applicable data protection law. A current list of
          sub-processors is available upon request to{" "}
          <a href="mailto:privacy@workivo.app" className="lg-link">privacy@workivo.app</a>.
        </p>
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "6. Data Sharing and Disclosure",
    body: (
      <>
        <p><strong>We do not sell your personal information</strong>, and we do not share it with third parties for their own independent marketing purposes.</p>
        <p>We may share personal information in the following circumstances:</p>
        <ul>
          <li><strong>Within your Team Workspace.</strong> Boards, Tasks, comments, and related Content you add to a Team Workspace are visible to other members in accordance with the roles and permissions configured by that workspace's Owners and Admins.</li>
          <li><strong>With service providers.</strong> As described in Section 5, to enable hosting, authentication, communications, analytics, and the AI Assistant.</li>
          <li><strong>For legal reasons.</strong> Where required to comply with applicable law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of Workivo, our Users, or the public.</li>
          <li><strong>In connection with a business transaction.</strong> If Workivo is involved in a merger, acquisition, financing, or sale of assets, personal information may be transferred as part of that transaction, subject to standard confidentiality protections and continued application of this Privacy Policy or a materially equivalent policy.</li>
          <li><strong>With your consent.</strong> For any other purpose disclosed to you at the time of collection and to which you consent.</li>
        </ul>
        <p>
          Under the CCPA/CPRA, "sharing" includes certain disclosures for
          cross-context behavioral advertising. We do not engage in
          cross-context behavioral advertising, and accordingly do not
          "sell" or "share" personal information as those terms are defined
          under California law.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "7. Security",
    body: (
      <>
        <p>We implement administrative, technical, and physical safeguards designed to protect personal information, including:</p>
        <ul>
          <li>Encryption of data in transit using TLS, and encryption of sensitive data at rest</li>
          <li>Password hashing and salting using industry-standard algorithms; we never store plain-text passwords</li>
          <li>JWT-based authentication with token expiration and secure session handling</li>
          <li>Role-based access controls limiting Team Workspace data to authorized members</li>
          <li>Logging and monitoring of access to production systems, and regular review of internal access controls</li>
        </ul>
        <p>
          No method of transmission or storage is completely secure. While
          we work to protect your information, we cannot guarantee absolute
          security. If we become aware of a security incident affecting your
          personal information, we will notify you and any applicable
          regulator as required by law.
        </p>
      </>
    ),
  },
  {
    id: "user-rights",
    title: "8. Your Rights and Choices",
    body: (
      <>
        <p><strong>All users.</strong> You can access, update, or delete your account information from your account settings at any time, export your Board and Task data, and leave a Team Workspace to stop receiving related notifications.</p>
        <p><strong>If you are in the European Economic Area, the UK, or Switzerland (GDPR).</strong> You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Rectify inaccurate or incomplete personal information</li>
          <li>Erase your personal information, subject to certain exceptions</li>
          <li>Restrict or object to our processing of your personal information, including processing based on legitimate interest</li>
          <li>Receive your personal information in a portable format and transmit it to another controller</li>
          <li>Withdraw consent at any time, where processing is based on consent</li>
          <li>Lodge a complaint with your local data protection authority</li>
        </ul>
        <p><strong>If you are a California resident (CCPA/CPRA).</strong> You have the right to:</p>
        <ul>
          <li>Know what personal information we collect, use, disclose, and (if applicable) sell or share, and to request access to specific pieces of that information</li>
          <li>Request deletion of your personal information, subject to certain exceptions</li>
          <li>Correct inaccurate personal information</li>
          <li>Opt out of the sale or sharing of personal information — as noted above, we do not sell or share personal information as defined under California law</li>
          <li>Non-discrimination for exercising any of these rights</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:privacy@workivo.app" className="lg-link">privacy@workivo.app</a>.
          We will verify your request using information associated with your
          account and respond within the timeframe required by applicable
          law. You may also designate an authorized agent to make a request
          on your behalf, subject to verification.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "9. Data Retention",
    body: (
      <>
        <p>
          We retain personal information for as long as your account
          remains active and as necessary to provide the Service. Specific
          retention periods include:
        </p>
        <ul>
          <li><strong>Account and profile information</strong> — retained until you delete your account, plus a limited period thereafter to allow for account recovery and to comply with legal obligations</li>
          <li><strong>Boards, Tasks, and Team Workspace content</strong> — retained until deleted by you or an authorized Owner/Admin, after which it is removed from active systems within a reasonable period and may persist briefly in encrypted backups before being purged</li>
          <li><strong>AI Assistant interaction logs</strong> — retained for a limited period to support quality review and troubleshooting, then deleted or anonymized</li>
          <li><strong>Log and security data</strong> — retained for a limited period necessary for security monitoring and fraud prevention</li>
          <li><strong>Billing records</strong> — retained as required by applicable tax and accounting law</li>
        </ul>
        <p>
          Where we no longer need personal information for these purposes,
          we will delete or anonymize it, except where retention is required
          by law.
        </p>
      </>
    ),
  },
  {
    id: "international-transfers",
    title: "10. International Data Transfers",
    body: (
      <p>
        Workivo and its service providers may process and store personal
        information in countries other than your own, including the United
        States. Where we transfer personal information out of the European
        Economic Area, the UK, or Switzerland, we rely on appropriate
        safeguards recognized under applicable law, such as the European
        Commission's Standard Contractual Clauses, the UK International Data
        Transfer Addendum, or an applicable adequacy decision. By using the
        Service, you understand that your information may be transferred to
        and processed in jurisdictions with data protection laws that may
        differ from those of your home country.
      </p>
    ),
  },
  {
    id: "children",
    title: "11. Children's Privacy",
    body: (
      <p>
        Workivo is not directed to, and is not intended for use by,
        children under the age of 13 (or the applicable minimum age of
        digital consent in your jurisdiction, if higher). We do not
        knowingly collect personal information from children under that
        age. If we become aware that we have collected personal information
        from a child without appropriate parental or guardian consent, we
        will take steps to delete it. If you believe a child has provided us
        with personal information, please contact us at{" "}
        <a href="mailto:privacy@workivo.app" className="lg-link">privacy@workivo.app</a>{" "}
        so we can investigate and remove it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "12. Changes to This Privacy Policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time to reflect
        changes in our practices, the Service, or applicable law. If we make
        material changes, we will notify you by email or through a notice
        in the app before the change takes effect, and we will update the
        "Last updated" date above. We encourage you to review this Privacy
        Policy periodically.
      </p>
    ),
  },
  {
    id: "contact",
    title: "13. Contact Information",
    body: (
      <>
        <p>
          If you have questions about this Privacy Policy, wish to exercise
          your rights, or want to raise a concern about how we handle your
          data, please contact us at:
        </p>
        <p>
          <strong>Workivo, Inc.</strong><br />
          Privacy Team<br />
          Email: <a href="mailto:privacy@workivo.app" className="lg-link">privacy@workivo.app</a><br />
          Support: <a href="mailto:support@workivo.app" className="lg-link">support@workivo.app</a>
        </p>
        <p>
          If you are in the EEA or UK and believe we have not adequately
          addressed your concern, you have the right to lodge a complaint
          with your local data protection supervisory authority.
        </p>
      </>
    ),
  },
];

const PrivacyPolicy = () => {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          width: 100%;
          height: 100%;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .lg-root {
          min-height: 100vh;
          width: 100%;
          background: #FAFAFC;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .lg-topbar {
          width: 100%;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .lg-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lg-brand-img {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          object-fit: cover;
          display: block;
        }
        .lg-brand-name {
          font-size: 17px;
          font-weight: 800;
          color: #1E1B4B;
          letter-spacing: -0.4px;
        }

        .lg-topbar-right {
          display: flex;
          align-items: center;
          gap: 22px;
        }
        .lg-help {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #4B5563;
          text-decoration: none;
          cursor: pointer;
        }
        .lg-theme-dot {
          width: 18px;
          height: 18px;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .lg-back {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: 8px;
          cursor: pointer;
          background: #7C3AED;
          border: none;
          color: white;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
        }
        .lg-back:hover { background: #6D28D9; }
        .lg-back svg { transform: scaleX(-1); }

        .lg-body {
          flex: 1;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 12px 40px 80px;
          display: grid;
          grid-template-columns: 1fr 260px;
          gap: 40px;
          align-items: start;
        }

        .lg-main { min-width: 0; }

        .lg-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(124,58,237,0.08);
          color: #7C3AED;
          border-radius: 100px;
          padding: 5px 14px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 18px;
        }

        .lg-title {
          font-size: clamp(30px, 3.4vw, 40px);
          font-weight: 800;
          color: #1E1B4B;
          letter-spacing: -1px;
          margin-bottom: 14px;
        }

        .lg-meta {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          font-size: 13.5px;
          color: #6B7280;
          margin-bottom: 18px;
        }
        .lg-meta strong { color: #4B5563; font-weight: 600; }

        .lg-section { margin-bottom: 34px; padding-top: 8px; }
        .lg-section:last-child { margin-bottom: 0; }
        .lg-section-title {
          font-size: 18px;
          font-weight: 700;
          color: #1E1B4B;
          margin-bottom: 12px;
          letter-spacing: -0.3px;
          scroll-margin-top: 24px;
        }
        .lg-section p {
          font-size: 14.5px;
          line-height: 1.7;
          color: #4B5563;
          margin-bottom: 12px;
        }
        .lg-section p:last-child { margin-bottom: 0; }
        .lg-section ul {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .lg-section ul:last-child { margin-bottom: 0; }
        .lg-section li {
          font-size: 14.5px;
          line-height: 1.65;
          color: #4B5563;
        }
        .lg-link { color: #7C3AED; font-weight: 600; text-decoration: none; }
        .lg-link:hover { text-decoration: underline; }

        /* ── Quick links sidebar ── */
        .lg-sidebar {
          position: sticky;
          top: 24px;
          background: white;
          border: 1px solid #ECECF1;
          border-radius: 16px;
          padding: 22px 22px;
          max-height: calc(100vh - 48px);
          overflow-y: auto;
        }
        .lg-sidebar-title {
          font-size: 13px;
          font-weight: 700;
          color: #1E1B4B;
          margin-bottom: 14px;
        }
        .lg-sidebar-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }
        .lg-sidebar-link {
          font-size: 13px;
          color: #6B7280;
          text-decoration: none;
          line-height: 1.4;
          display: block;
        }
        .lg-sidebar-link:hover { color: #7C3AED; }
        .lg-sidebar-link.active { color: #7C3AED; font-weight: 600; }

        .lg-footer {
          text-align: center;
          padding: 20px;
          font-size: 13px;
          color: #9CA3AF;
          border-top: 1px solid #F3F4F6;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .lg-footer a { color: #9CA3AF; text-decoration: none; }
        .lg-footer a:hover { color: #7C3AED; }
        .lg-footer-dot { width: 3px; height: 3px; border-radius: 50%; background: #D1D5DB; flex-shrink: 0; }

        @media (max-width: 900px) {
          .lg-body { grid-template-columns: 1fr; }
          .lg-sidebar { position: static; max-height: none; }
        }

        @media (max-width: 640px) {
          .lg-topbar { padding: 16px 20px; }
          .lg-body { padding: 12px 20px 60px; }
        }
      `}</style>

      <div className="lg-root">
        <header className="lg-topbar">
          <div className="lg-brand">
            <img src={workivoLogo} alt="Workivo" className="lg-brand-img" />
            <span className="lg-brand-name">Workivo</span>
          </div>
          <div className="lg-topbar-right">

            <Link to="/login" className="lg-back">
              Back to Login
              <IconArrowLeft />
            </Link>
          </div>
        </header>

        <main className="lg-body">
          <div className="lg-main">
            <h1 className="lg-title">Privacy Policy</h1>
            <div className="lg-meta">
              <span><strong>Effective:</strong> {effectiveDate}</span>
              <span><strong>Last updated:</strong> {lastUpdated}</span>
            </div>

            {sections.map((s) => (
              <section key={s.id} id={s.id} className="lg-section">
                <h2 className="lg-section-title">{s.title}</h2>
                {s.body}
              </section>
            ))}
          </div>

          <aside className="lg-sidebar">
            <div className="lg-sidebar-title">Quick links</div>
            <ul className="lg-sidebar-list">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="lg-sidebar-link">{s.title}</a>
                </li>
              ))}
            </ul>
          </aside>
        </main>

        <footer className="lg-footer">
          <span>© 2026 Workivo, Inc. All rights reserved.</span>
          <div className="lg-footer-dot" />
          <a href="/privacy-policy">Privacy Policy</a>
          <div className="lg-footer-dot" />
          <a href="/terms-of-service">Terms of Service</a>
        </footer>
      </div>
    </>
  );
};

export default PrivacyPolicy;
