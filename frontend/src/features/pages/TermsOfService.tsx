import workivoLogo from "../../assets/workivo-logo.png";

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
    id: "acceptance",
    title: "1. Acceptance of Terms",
    body: (
      <>
        <p>
          These Terms of Service ("Terms") form a binding agreement between
          you ("you," "User," or "Customer") and Workivo, Inc. ("Workivo,"
          "we," "us," or "our") governing your access to and use of the
          Workivo website, applications, APIs, and related services
          (collectively, the "Service").
        </p>
        <p>
          By creating an account, clicking "I agree," or otherwise accessing
          or using the Service, you confirm that you have read, understood,
          and agree to be bound by these Terms and our Privacy Policy. If you
          are accepting these Terms on behalf of a company or other legal
          entity, you represent that you have the authority to bind that
          entity, in which case "you" refers to that entity. If you do not
          agree to these Terms, you must not access or use the Service.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    body: (
      <>
        <p>To use Workivo, you must:</p>
        <ul>
          <li>Be at least 13 years old, or the minimum age of digital consent in your jurisdiction, whichever is higher</li>
          <li>Have the legal capacity to enter into a binding contract with us</li>
          <li>Not be barred from using the Service under the laws of any applicable jurisdiction, including export control and sanctions laws</li>
          <li>If registering on behalf of an organization, be duly authorized to act for and bind that organization</li>
        </ul>
        <p>
          Workivo does not knowingly permit accounts to be created by, or
          collect personal information from, anyone who does not meet these
          requirements.
        </p>
      </>
    ),
  },
  {
    id: "account-registration",
    title: "3. Account Registration",
    body: (
      <>
        <p>
          To access most features of Workivo, you must register for an
          account. You may register using an email address and password, or
          through Google Sign-In. We use JSON Web Tokens (JWT) and related
          mechanisms to authenticate and maintain your session.
        </p>
        <ul>
          <li>You agree to provide accurate, current, and complete information during registration and to keep that information up to date</li>
          <li>You must verify your email address before gaining full access to certain features, as prompted by the Service</li>
          <li>You are solely responsible for maintaining the confidentiality of your password and account credentials, and for all activity that occurs under your account, whether or not authorized by you</li>
          <li>You must notify us immediately at <a href="mailto:security@workivo.app" className="lg-link">security@workivo.app</a> if you suspect any unauthorized use of your account or any other breach of security</li>
          <li>You may not share your account credentials with any other person, or use another person's account without permission</li>
          <li>Workivo is not liable for any loss or damage arising from your failure to comply with these obligations</li>
        </ul>
      </>
    ),
  },
  {
    id: "user-responsibilities",
    title: "4. User Responsibilities",
    body: (
      <>
        <p>As a condition of using the Service, you agree that you will:</p>
        <ul>
          <li>Use the Service only for lawful business and personal productivity purposes consistent with these Terms</li>
          <li>Maintain accurate profile information, including your name and, where applicable, profile photo</li>
          <li>Be responsible for the conduct of any individuals you invite into a Team Workspace under your administration</li>
          <li>Comply with all applicable local, state, national, and international laws and regulations in connection with your use of the Service</li>
          <li>Promptly update or correct information that becomes inaccurate, including billing and contact details</li>
          <li>Take reasonable steps to secure any device used to access the Service</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable Use Policy",
    body: (
      <>
        <p>You agree that you will not, and will not permit any third party to:</p>
        <ul>
          <li>Use the Service for any unlawful, fraudulent, or unauthorized purpose, or in violation of any applicable law or regulation</li>
          <li>Upload, transmit, or store any viruses, malware, or other code designed to disrupt, damage, or limit the functioning of the Service</li>
          <li>Attempt to gain unauthorized access to any account, Board, Team Workspace, or system, or circumvent any authentication or security measure</li>
          <li>Probe, scan, or test the vulnerability of the Service, or breach any security or authentication measure without authorization</li>
          <li>Use automated means, including bots, scrapers, or crawlers, to access the Service except through our published APIs in accordance with our API terms</li>
          <li>Interfere with, disrupt, or place an unreasonable load on the Service's infrastructure, including through denial-of-service attacks</li>
          <li>Use the Service to harass, threaten, defame, abuse, or otherwise harm another person or entity</li>
          <li>Upload Content that infringes the intellectual property, privacy, or other rights of any third party, or that is unlawful, obscene, or discriminatory</li>
          <li>Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code or underlying structure of the Service, except to the extent such restriction is prohibited by applicable law</li>
          <li>Resell, sublicense, rent, lease, or otherwise commercially exploit the Service without our prior written consent</li>
          <li>Misrepresent your identity or affiliation, or impersonate any person or entity, including a Workivo representative</li>
          <li>Use the AI Assistant to generate content that is unlawful, infringing, or in violation of these Terms, or to attempt to extract, probe, or reverse engineer the underlying models or knowledge base</li>
        </ul>
        <p>
          We reserve the right, but not the obligation, to investigate and
          take appropriate action against any User who violates this policy,
          including removing Content, suspending access, and reporting
          conduct to law enforcement where warranted.
        </p>
      </>
    ),
  },
  {
    id: "team-workspaces",
    title: "6. Team Workspaces",
    body: (
      <>
        <p>
          Workivo allows Users to create Team Workspaces to collaborate with
          others. Team Workspaces operate on a role-based permission model
          with three default roles:
        </p>
        <ul>
          <li><strong>Owner</strong> — the individual or individuals who created the Team Workspace or have been granted Owner rights. Owners have full administrative control, including the ability to manage billing, delete the workspace, and assign or revoke any role.</li>
          <li><strong>Member</strong> — Users invited to participate in a Team Workspace with permissions to create, edit, and comment on Boards, Lists, and Tasks as configured by an Owner or Admin.</li>
        </ul>
        <p>
          The Owner and Admins of a Team Workspace are responsible for
          managing membership, setting appropriate permissions, and ensuring
          that members comply with these Terms. Workivo is not responsible
          for disputes between members of a Team Workspace, including
          disputes over ownership, access, or removal of Content, except
          where required by applicable law.
        </p>
        <p>
          When you invite an individual to a Team Workspace, you represent
          that you have the right to share their email address with us for
          that purpose and that the invitation complies with applicable law.
          Team invitations may be revoked by an Owner or Admin at any time.
        </p>
        <p>
          If an Owner's account is deleted or a subscription lapses, Workivo
          may, at its discretion and consistent with our Data Retention
          practices, suspend access to the associated Team Workspace,
          provide a transition period for data export, or transfer
          administrative rights to another Admin to preserve continuity for
          remaining members.
        </p>
      </>
    ),
  },
  {
    id: "personal-boards",
    title: "7. Personal Boards",
    body: (
      <p>
        In addition to Team Workspaces, Workivo allows individual Users to
        create Personal Boards that are private to their account by default
        and not associated with any Team Workspace. You are solely
        responsible for the organization, accuracy, and backup of Content
        within your Personal Boards. Personal Boards may be converted into
        Team Workspaces or shared with other Users at your discretion,
        subject to the sharing and permission controls made available within
        the Service.
      </p>
    ),
  },
  {
    id: "user-generated-content",
    title: "8. User-Generated Content",
    body: (
      <>
        <p>
          "Your Content" means all Boards, Lists, Tasks, due dates,
          comments, attachments, files, profile information, and any other
          material you create, upload, or transmit through the Service,
          whether in a Personal Board or a Team Workspace.
        </p>
        <ul>
          <li>You are solely responsible for Your Content and for ensuring you have all necessary rights, licenses, and consents to upload and share it</li>
          <li>Your Content must not violate any applicable law, infringe any third party's intellectual property or privacy rights, or contain unlawful, defamatory, or malicious material</li>
          <li>Content shared within a Team Workspace is visible to other members of that workspace in accordance with the roles and permissions configured by its Owners and Admins</li>
          <li>Workivo does not actively monitor private Content but reserves the right to review, remove, or disable access to Content that violates these Terms, that we are required to act on by law, or that we reasonably believe poses a risk to the Service, our Users, or third parties</li>
        </ul>
      </>
    ),
  },
  {
    id: "ownership-of-content",
    title: "9. Ownership of Content",
    body: (
      <>
        <p>
          As between you and Workivo, you retain all right, title, and
          interest in and to Your Content. We do not claim ownership over
          any Boards, Tasks, comments, or files you create.
        </p>
        <p>
          By submitting Your Content to the Service, you grant Workivo a
          worldwide, non-exclusive, royalty-free, sublicensable (to our
          service providers as necessary to operate the Service) license to
          host, store, reproduce, transmit, display, and otherwise process
          Your Content solely as necessary to provide, maintain, secure, and
          improve the Service for you and the members of your Team
          Workspace. This license terminates when Your Content is deleted
          from the Service, except to the extent retained copies persist
          temporarily in backups consistent with Section 17 of our Privacy
          Policy or as required by law.
        </p>
        <p>
          We will not sell Your Content, use it to train generative AI
          models for the benefit of other customers, or share it outside
          your Team Workspace without your consent, except as described in
          these Terms or our Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "10. Intellectual Property",
    body: (
      <>
        <p>
          The Service, including its software, design, user interface,
          visual elements, the Workivo name and logo, and all related
          intellectual property (excluding Your Content), is owned by
          Workivo, Inc. and its licensors and is protected by copyright,
          trademark, and other intellectual property laws.
        </p>
        <p>
          Subject to your compliance with these Terms, Workivo grants you a
          limited, non-exclusive, non-transferable, revocable license to
          access and use the Service for your internal business or personal
          purposes. No other rights are granted. You may not copy, modify,
          distribute, sell, or lease any part of the Service, nor may you
          use our trademarks, logos, or branding without our prior written
          permission.
        </p>
        <p>
          Any feedback, suggestions, or ideas you voluntarily submit to
          Workivo about the Service may be used by us without restriction or
          compensation to you.
        </p>
      </>
    ),
  },
  {
    id: "ai-assistant-disclaimer",
    title: "11. AI Assistant Disclaimer",
    body: (
      <>
        <p>
          Workivo includes an AI-powered assistant ("AI Assistant") that
          answers questions using a curated knowledge base and, where
          relevant and permitted by your role and permissions, retrieves
          information from your account, Boards, Tasks, and Team Workspace
          data to generate contextual responses.
        </p>
        <ul>
          <li>The AI Assistant is a productivity tool, not a substitute for professional, legal, financial, or technical advice. Responses are generated automatically and may be incomplete, outdated, or inaccurate</li>
          <li>You are responsible for independently verifying any information, summary, or suggestion provided by the AI Assistant before relying on it, particularly for decisions affecting deadlines, deliverables, finances, or compliance obligations</li>
          <li>The AI Assistant only accesses workspace and task data that you or your Team Workspace have made available to it consistent with your account's existing permissions; it does not bypass Team Workspace roles or grant access to data a User could not otherwise view</li>
          <li>Workivo does not guarantee the accuracy, completeness, or reliability of AI-generated output and disclaims liability for actions taken in reliance on it, to the fullest extent permitted by law</li>
          <li>You agree not to use the AI Assistant to attempt to extract our underlying models, prompts, or knowledge base, or to generate content that would violate Section 5 (Acceptable Use Policy)</li>
          <li>We may use de-identified, aggregated interaction data to improve the AI Assistant's performance; we do not use the contents of your private Boards or Tasks to train models shared with other customers without your consent</li>
        </ul>
      </>
    ),
  },
  {
    id: "third-party-services",
    title: "12. Third-Party Services",
    body: (
      <p>
        The Service integrates with or relies on third-party services,
        including Google Sign-In for authentication, cloud infrastructure
        and hosting providers, and email delivery providers for
        verification, password reset, and notification messages. Your use
        of any third-party service is subject to that provider's own terms
        and privacy policy. Workivo is not responsible for the practices,
        content, or availability of third-party services, and integrating
        with a third-party service does not constitute an endorsement of
        that provider.
      </p>
    ),
  },
  {
    id: "termination",
    title: "13. Termination",
    body: (
      <>
        <p>
          You may terminate this agreement at any time by deleting your
          account through your account settings or by contacting{" "}
          <a href="mailto:support@workivo.app" className="lg-link">support@workivo.app</a>.
        </p>
        <p>
          We may terminate or suspend your access to the Service immediately,
          without prior notice, if you materially breach these Terms, engage
          in conduct that we determine, in our reasonable judgment, harms
          Workivo, other Users, or third parties, or if required to do so by
          law.
        </p>
        <p>
          Upon termination, your right to use the Service ceases immediately.
          Sections of these Terms that by their nature should survive
          termination, including Ownership of Content, Intellectual
          Property, Disclaimers, Limitation of Liability, and Governing Law,
          will survive. We will handle data deletion following termination
          in accordance with our Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "14. Disclaimers",
    body: (
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT
        WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY,
        INCLUDING WITHOUT LIMITATION IMPLIED WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        WORKIVO DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
        SECURE, ACCURATE, OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE
        CORRECTED. YOU USE THE SERVICE, INCLUDING THE AI ASSISTANT, AT YOUR
        OWN RISK.
      </p>
    ),
  },
  {
    id: "changes-to-terms",
    title: "15. Changes to These Terms",
    body: (
      <p>
        We may update these Terms from time to time to reflect changes to
        the Service, legal requirements, or our practices. If we make
        material changes, we will provide reasonable advance notice through
        the app or by email before the changes take effect. Continued use of
        the Service after a change takes effect constitutes your acceptance
        of the updated Terms. If you do not agree to the updated Terms, you
        must stop using the Service.
      </p>
    ),
  },
  {
    id: "general",
    title: "16. General Provisions",
    body: (
      <ul>
        <li><strong>Entire Agreement.</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Workivo regarding the Service.</li>
        <li><strong>Severability.</strong> If any provision of these Terms is found unenforceable, the remaining provisions will remain in full force and effect.</li>
        <li><strong>No Waiver.</strong> Our failure to enforce any right or provision will not be considered a waiver of that right or provision.</li>
        <li><strong>Assignment.</strong> You may not assign or transfer these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.</li>
        <li><strong>Notices.</strong> We may provide notices to you via email, through the Service, or by posting on our website.</li>
      </ul>
    ),
  },
  {
    id: "contact",
    title: "17. Contact Us",
    body: (
      <p>
        If you have any questions about these Terms, please contact us at{" "}
        <a href="mailto:legal@workivo.app" className="lg-link">legal@workivo.app</a>{" "}
        or{" "}
        <a href="mailto:support@workivo.app" className="lg-link">support@workivo.app</a>.
      </p>
    ),
  },
];

const TermsOfService = () => {
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

        .lg-intro {
          font-size: 14.5px;
          line-height: 1.7;
          color: #4B5563;
          padding-bottom: 32px;
          margin-bottom: 8px;
          border-bottom: 1px solid #ECECF1;
        }

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
            
            <a href="/" className="lg-back">
              Back to Login
              <IconArrowLeft />
            </a>
          </div>
        </header>

        <main className="lg-body">
          <div className="lg-main">
            <h1 className="lg-title">Terms of Service</h1>
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

export default TermsOfService;
