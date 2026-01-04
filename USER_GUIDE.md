# User Guide - Todo Task Manager

Welcome to the Todo Task Manager! This guide will help you get started and make the most of all features.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Creating Your Account](#creating-your-account)
3. [Managing Tasks](#managing-tasks)
4. [Tips & Best Practices](#tips--best-practices)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

---

## Getting Started

The Todo Task Manager is a simple, secure, and efficient task management application. Here's what you can do:

- Create, view, update, and delete tasks
- Mark tasks as complete or incomplete
- Organize tasks with titles and descriptions
- Access your tasks from any device
- Keep your tasks private and secure

### System Requirements

- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Internet Connection**: Required for accessing the application
- **Device**: Desktop, tablet, or mobile device

### Accessing the Application

1. Open your web browser
2. Navigate to: `https://yourdomain.com`
3. You'll see the landing page with options to Sign In or Sign Up

---

## Creating Your Account

### Step 1: Sign Up

1. Click the **"Sign Up"** button on the homepage
2. Fill in the registration form:
   - **Email**: Enter a valid email address (e.g., user@example.com)
   - **Name**: Enter your full name (e.g., John Doe)
   - **Password**: Create a strong password with:
     - At least 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number
3. Click **"Create Account"**

**Example:**
```
Email: john.doe@example.com
Name: John Doe
Password: SecurePass123
```

### Step 2: Automatic Sign-In

After successful signup, you'll be automatically signed in and redirected to your dashboard.

### Password Requirements

Your password must meet these requirements:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)

**Good passwords:**
- `MyTask2024!`
- `SecurePass123`
- `ToDo2026App`

**Bad passwords:**
- `password` (no uppercase, no number)
- `Pass1` (too short)
- `PASSWORD123` (no lowercase)

---

## Managing Tasks

### Creating a New Task

1. On your dashboard, locate the **"New Task"** form
2. Enter a **Title** for your task (required, 1-200 characters)
   - Example: "Complete project documentation"
3. Optionally, add a **Description** (max 1000 characters)
   - Example: "Write user guide, API docs, and deployment guide"
4. Click **"Add Task"**

Your task will immediately appear in the task list below.

### Viewing Your Tasks

All your tasks are displayed on the dashboard in a list format:

- **Most recent tasks appear first** (sorted by creation date)
- Each task shows:
  - **Title** (in bold)
  - **Description** (if provided)
  - **Status** (pending or completed)
  - **Created date**
  - **Action buttons** (Edit, Delete, Complete)

### Editing a Task

1. Locate the task you want to edit
2. Click the **"Edit"** button (pencil icon)
3. Modify the **Title** and/or **Description**
4. Click **"Save"** to update the task
5. Or click **"Cancel"** to discard changes

**Note**: You can only edit your own tasks. Tasks created by other users are not accessible.

### Marking a Task as Complete

1. Locate the task you want to mark as complete
2. Click the **checkbox** next to the task title
3. The task will be marked as completed:
   - Title will have a **strikethrough** effect
   - Checkbox will be **checked**
   - Task will move to the "Completed" section (if sorting is enabled)

To mark a task as incomplete again:
1. Click the **checked checkbox**
2. The task will return to the "Pending" state

### Deleting a Task

1. Locate the task you want to delete
2. Click the **"Delete"** button (trash icon)
3. A confirmation dialog will appear: **"Are you sure you want to delete this task?"**
4. Click **"Delete"** to confirm, or **"Cancel"** to keep the task

**Warning**: Deleted tasks cannot be recovered. This action is permanent.

---

## Tips & Best Practices

### Writing Effective Task Titles

✅ **Good titles** (clear and actionable):
- "Complete project documentation"
- "Review pull request #123"
- "Schedule team meeting for Q1 planning"

❌ **Bad titles** (vague or unclear):
- "Stuff"
- "TODO"
- "Work"

### Using Descriptions Effectively

Use the description field to add:
- **Context**: Why is this task important?
- **Details**: What specific steps are needed?
- **Links**: Reference URLs, documents, or resources
- **Deadlines**: When should this task be completed?

**Example:**
```
Title: Complete project documentation
Description:
- Write user guide with getting started section
- Create API documentation with examples
- Add deployment guide with step-by-step instructions
Deadline: January 10, 2026
```

### Organizing Your Tasks

**By Priority**:
- Add priority indicators in the title: `[HIGH] Complete project documentation`
- Use emoji: `🔥 Urgent: Fix production bug`

**By Category**:
- Prefix with category: `[Work] Prepare presentation`
- Use tags: `Personal - Buy groceries`

**By Project**:
- Group related tasks: `Project Alpha - Design mockups`

### Keyboard Shortcuts (Future Feature)

Coming soon:
- `N` - Create new task
- `Enter` - Save task
- `Escape` - Cancel edit
- `Delete` - Delete selected task

---

## Troubleshooting

### I Can't Sign In

**Problem**: Entering correct email and password, but sign-in fails.

**Solutions**:
1. **Check your password**: Ensure Caps Lock is off
2. **Verify your email**: Check for typos in the email address
3. **Reset your password**: Click "Forgot Password?" (if available)
4. **Clear browser cache**: Try signing in with a private/incognito window
5. **Contact support**: If issue persists, email support@todoapp.com

### I Don't See My Tasks

**Problem**: Task list is empty after creating tasks.

**Solutions**:
1. **Refresh the page**: Press F5 or Ctrl+R
2. **Check your account**: Ensure you're signed in with the correct account
3. **Verify task creation**: Check if you received a success message after creating the task
4. **Clear browser cache**: Try accessing the app in a private/incognito window

### Tasks Aren't Saving

**Problem**: Created tasks disappear after refresh.

**Solutions**:
1. **Check internet connection**: Ensure you have a stable connection
2. **Verify authentication**: You may have been signed out. Try signing in again.
3. **Check browser console**: Press F12 and look for error messages
4. **Try a different browser**: Test if the issue persists in another browser

### Edit Button Not Working

**Problem**: Clicking "Edit" doesn't open the edit form.

**Solutions**:
1. **Refresh the page**: Press F5 or Ctrl+R
2. **Clear browser cache**: Ctrl+Shift+Delete (Chrome/Firefox)
3. **Try a different browser**: Test in Chrome, Firefox, or Safari
4. **Check for JavaScript errors**: Press F12 and look for red errors in the console

### Delete Confirmation Not Appearing

**Problem**: Clicking "Delete" doesn't show confirmation dialog.

**Solutions**:
1. **Enable JavaScript**: Ensure JavaScript is enabled in your browser
2. **Disable browser extensions**: Ad blockers may interfere with dialogs
3. **Clear browser cache**: Try accessing the app in a private/incognito window

---

## FAQ

### General Questions

**Q: Is my data secure?**

A: Yes! Your data is protected with:
- **Password encryption**: Passwords are hashed with bcrypt
- **JWT authentication**: Secure token-based authentication
- **User isolation**: You can only access your own tasks
- **HTTPS encryption**: All data is transmitted securely (production)

**Q: Can I access my tasks from multiple devices?**

A: Yes! Simply sign in with your email and password on any device. Your tasks are stored securely in the cloud.

**Q: Is there a limit to how many tasks I can create?**

A: No, there's no limit. Create as many tasks as you need!

**Q: Can I share tasks with other users?**

A: Currently, task sharing is not supported. Each user has their own private task list. This feature may be added in the future.

**Q: Can I export my tasks?**

A: Task export functionality is not currently available but may be added in a future update.

### Account Management

**Q: How do I change my password?**

A: Password reset functionality is coming soon. For now, contact support@todoapp.com if you need to reset your password.

**Q: How do I change my email address?**

A: Email change functionality is not currently available. Contact support@todoapp.com for assistance.

**Q: How do I delete my account?**

A: Account deletion is not currently available through the UI. Contact support@todoapp.com to request account deletion.

**Q: How long does my session last?**

A: Your session lasts for 7 days. After that, you'll need to sign in again.

### Task Management

**Q: Can I add due dates to tasks?**

A: Currently, due dates are not a built-in feature. You can add dates manually in the description field. This feature may be added in the future.

**Q: Can I add tags or categories to tasks?**

A: Tags and categories are not currently supported. You can organize tasks by prefixing titles with category names (e.g., `[Work] Task title`).

**Q: Can I reorder tasks?**

A: Tasks are currently sorted by creation date (newest first). Manual reordering is not available yet.

**Q: Can I attach files to tasks?**

A: File attachments are not currently supported. You can add links to cloud-stored files in the description field.

**Q: Can I set reminders for tasks?**

A: Reminders are not currently available but may be added in a future update.

### Technical Questions

**Q: Does the app work offline?**

A: No, the app requires an internet connection. Offline support may be added in the future.

**Q: Which browsers are supported?**

A: The app works best on:
- Chrome (latest version)
- Firefox (latest version)
- Safari (latest version)
- Edge (latest version)

**Q: Is there a mobile app?**

A: Currently, there's no native mobile app. However, the web app is fully responsive and works great on mobile browsers. You can also add it to your home screen for an app-like experience.

**Q: Can I use the app on my tablet?**

A: Yes! The app is fully responsive and optimized for tablets.

---

## Getting Help

### Support Options

If you need assistance:

1. **Check this guide**: Most common questions are answered here
2. **Check the FAQ**: See the FAQ section above
3. **Email support**: support@todoapp.com
4. **Report a bug**: bugs@todoapp.com

### Feature Requests

Have an idea for a new feature? We'd love to hear it!

Email your suggestion to: features@todoapp.com

### Providing Feedback

Your feedback helps us improve. Please include:
- **What you like** about the app
- **What could be improved**
- **Any bugs or issues** you've encountered
- **Feature requests**

Send feedback to: feedback@todoapp.com

---

## Quick Reference

### Task Management Cheat Sheet

| Action | Steps |
|--------|-------|
| **Create Task** | 1. Enter title<br>2. (Optional) Add description<br>3. Click "Add Task" |
| **Edit Task** | 1. Click "Edit" button<br>2. Modify title/description<br>3. Click "Save" |
| **Mark Complete** | Click checkbox next to task |
| **Mark Incomplete** | Click checked checkbox |
| **Delete Task** | 1. Click "Delete" button<br>2. Confirm deletion |

### Keyboard Navigation

- **Tab**: Move to next field
- **Shift + Tab**: Move to previous field
- **Enter**: Submit form / Save changes
- **Escape**: Cancel edit (when in edit mode)

---

## Stay Updated

Follow us for updates and new features:

- **Website**: https://todoapp.com
- **Twitter**: @todoapp
- **Blog**: https://todoapp.com/blog

---

**Thank you for using Todo Task Manager!**

We're committed to helping you stay organized and productive. If you have any questions or feedback, don't hesitate to reach out.

---

*Last updated: January 4, 2026*
