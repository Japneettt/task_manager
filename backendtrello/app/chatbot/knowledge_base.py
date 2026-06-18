# app/chatbot/knowledge_base.py

WORKIVO_DOCS = [
    {
        "id": "doc_1",
        "content": """
        Creating a Personal Board in Workivo:
        A board is the top-level container for organizing your work. To create a personal board,go to boards in navbar and
        click the 'Create Board' button on the dashboard. Give your board a title and optional 
        description. Personal boards belong only to you (no team_id). You can archive boards 
        when they are no longer active. Each board is having 3 already existing lists named as To Do, In Progress, and Done.
        Boards are owned by the user who created them (owner_id field).
        """
    },
    {
        "id": "doc_2",
        "content": """
        Creating Lists inside a Board:
        Lists are columns inside a board, in which we already have pre-defined lists like 'To Do', 'In Progress', 'Done'. but u can add lists as per your requirement.
        To create a list, open a board and click 'Add List'. Give it a title .
        Position controls the order of lists from left to right. Lists belong to one board via board_id.
        You can have unlimited lists in a board. Lists can be deleted which also deletes all cards inside them.
        """
    },
    {
        "id": "doc_3",
        "content": """
        Creating and Managing Cards (Tasks) in Workivo:
        Cards are individual tasks inside a list. To create a card, open a list and click 'Add Card'.
        Each card has: title (required), description (optional), priority (Low/Medium/High),
        due date, badge/status label, and position within the list.
        Cards can be moved between lists by dragging and dropping or changing the list_id.
        Cards have a position field that controls their order within a list.
        """
    },
    {
        "id": "doc_4",
        "content": """
        Assigning Tasks to Team Members:
        Any card (task) can be assigned to a user using the 'assigned_to' field.
        To assign a task: open the card, click 'Assign', and select a team member.
        The assigned_to field stores the user's UUID. Only one person can be assigned per card.
        Assigned users get a notification when a task is assigned to them.
        You can change assignment at any time by selecting a different user.
        """
    },
    {
        "id": "doc_5",
        "content": """
        Creating and Managing Teams in Workivo:
        Teams allow multiple users to collaborate on shared boards. To create a team, we have team creation on dahsboord page in which u have to give team name , description(optional) , invite members by email and you can also upload team profile image and click on create team button.
        ALternatively You can go to the My Teams section and click 'Create Team'. Set a name, type (public/private/company),
        and description. The person who creates the team becomes the owner (owner_id).
        Teams can have a profile image. 
        Team boards are separate from personal boards — a board with a team_id belongs to that team.
        """
    },
    {
        "id": "doc_6",
        "content": """
        Inviting Members to a Team:
        Team owners and admins can invite members by email. Go to your team, click 'Invite Members',
        and enter one or multiple email addresses. An invitation email is sent automatically.
        The invited person receives an email with a link to accept. Invitations have a status:
        pending (not yet accepted) or accepted. Once accepted, the user becomes a team member.
        Team members can have roles: admin (can manage team) or member (regular access).
        """
    },
    {
        "id": "doc_7",
        "content": """
        Team Boards vs Personal Boards:
        Personal boards have no team_id and are only visible to the board owner.
        Team boards have a team_id and are visible to all members of that team.
        To create a team board, go to your team page and click 'Create Board'.
        Team members can collaborate on the same board, create lists, add cards, and assign tasks.
        The board owner (owner_id) still manages the board settings.
        """
    },
    {
        "id": "doc_8",
        "content": """
        Notifications in Workivo:
        Workivo sends real-time notifications via WebSocket for events like:
        task assignment, team invitations, card updates, and board activity.
        Notifications appear in your Inbox. Each notification has a title, message, type, and read status.
        You can mark notifications as read. Notifications have categories: personal or team.
        The notification bell icon shows unread count. You can view all notifications in the Inbox section.
        """
    },
    {
        "id": "doc_9",
        "content": """
        Planner Calendar in Workivo:
        The Planner Calendar shows your tasks and deadlines in a calendar view.
        Cards with due_date set will appear on the calendar on their due date.
        You can see what tasks are due today, this week, or this month.
        Click on a calendar event to open that card/task directly, u can reschedule that due date and mark it as completed .
        The calendar helps you manage your workload and not miss deadlines.
        """
    },
    {
        "id": "doc_10",
        "content": """
        Card Priority and Badges in Workivo:
        Each card has a priority field: Low, Medium (default), or High.
        Priority helps team members know which tasks to focus on first.
        Cards also have a badge field for custom status labels like 'Bug', 'Feature', 'Urgent'.
        You can filter cards by priority to see only High priority tasks.
        Priority is shown visually with color coding on the card.
        """
    },
    {
        "id": "doc_11",
        "content": """
        User Profile in Workivo:
        Each user has a profile with first name, last name, email, avatar, and cover photo.
        You can update your profile from the Settings page. Upload a profile picture or cover photo.
        You can also add a secondary email for account recovery. Your profile information is used for notifications and task assignments.
        Users also have a gender field and professional_role field (like Developer, Designer, Manager).
        You can change your password from the Settings > Change Password.
        Your initials (first letter of first and last name) are shown when no avatar is set.
        """
    },
    {
        "id": "doc_12",
        "content": """
        Card Dependencies and Completion in Workivo:
        Cards support a depends_on field which links to another card that must be completed first.
        When a card is completed, the completed_at timestamp is set automatically.
        Completed cards can be filtered out to see only active tasks.
        Cards track their creation time via created_at. 
        Archiving a card (is_archived=True) hides it from the active board view but keeps the data.
        """
    },
    {
        "id": "doc_13",
        "content": """
        Getting Started with Workivo — Quick Guide:
        1. Register an account with your email and password.
        2. Create your first personal board from the Dashboard.
        3. Add lists to your board (e.g. To Do, In Progress, Done).
        4. Add cards (tasks) to your lists.
        5. Set priority and due dates on cards to organize your work.
        6. Create a team and invite colleagues by email.
        7. Create team boards for collaborative work.
        8. Assign cards to team members.
        9. Monitor deadlines using the Activity Calendar.
        10. Check your Inbox for notifications.
        """
    },
    {
        "id": "doc_14",
        "content": """
        Searching and Filtering in Workivo:
        You can search for boards and teams by name from the dashboard search bar and by clicking on that team/board you will navigate to it.
        Archived boards and cards are hidden by default but can be shown by toggling the archive filter.
        The search helps you quickly find specific boards, tasks, or team members.
        """
    },
    {
        "id": "doc_15",
        "content": """
        Workivo Roles and Permissions:
        There are two team roles: admin and member.
        Team admins can: invite members, remove members, create/delete team boards, manage team settings.
        Team members can: view all team boards, create cards, assign tasks, update cards they have access to.
        The team owner has full control over the team.
        Board owners can archive their boards. System admins (is_admin=True) have platform-wide access.
        """
    },
]
