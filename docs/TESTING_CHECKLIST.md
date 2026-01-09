# Testing Checklist - Phase II Todo Application

## 🧪 Manual Testing Guide

Use this checklist to test the frontend application before deployment.

---

## 1️⃣ Landing Page Testing

### Visual Elements
- [ ] Hero section displays with gradient background
- [ ] Logo shows "TaskMaster" with checkmark icon
- [ ] All 6 feature cards display correctly
- [ ] Stats cards show (10K+, 100K+, 99.9%)
- [ ] About section with "Why Choose TaskMaster"
- [ ] CTA section with gradient background
- [ ] Footer visible at bottom with all links

### Responsiveness
- [ ] Mobile (375px) - Single column layout
- [ ] Tablet (768px) - 2-column layout
- [ ] Desktop (1024px+) - 3-column layout
- [ ] All text readable without zooming
- [ ] Buttons appropriately sized for touch
- [ ] No horizontal scrolling on any device

### Navigation
- [ ] Home link works
- [ ] Features link scrolls to features section
- [ ] About link scrolls to about section
- [ ] Sign In button visible and clickable
- [ ] Sign Up button visible and prominent
- [ ] Logo links back to home

---

## 2️⃣ Header Component Testing

### Unauthenticated State
- [ ] Header displays on all pages
- [ ] Navigation links visible (Home, Features, About)
- [ ] Sign In button visible
- [ ] Sign Up button visible (blue background)
- [ ] Mobile menu button appears on small screens
- [ ] Mobile menu expands/collapses properly

### Authenticated State (After Login)
- [ ] User name displays in header
- [ ] Profile dropdown button shows user name
- [ ] Clicking profile dropdown shows:
  - [ ] Dashboard link
  - [ ] Logout button
- [ ] Sign In/Sign Up buttons hidden
- [ ] Logout clears authentication

### Mobile Menu
- [ ] Hamburger icon appears on mobile
- [ ] Menu expands/collapses with animation
- [ ] All navigation items in mobile menu
- [ ] Auth buttons present in mobile menu
- [ ] Menu closes after navigation

### Accessibility
- [ ] Keyboard can navigate all links
- [ ] ARIA labels present
- [ ] Focus visible on buttons
- [ ] Screen reader announces menu state

---

## 3️⃣ Authentication Testing

### Sign Up Flow
- [ ] Navigate to /auth/signup
- [ ] Form displays with fields:
  - [ ] Full Name input
  - [ ] Email input
  - [ ] Password input
  - [ ] Confirm Password input
  - [ ] Terms checkbox
- [ ] Password strength indicator appears
- [ ] Type weak password: gray indicator
- [ ] Type strong password: green indicator
- [ ] Submit with missing fields: error messages
- [ ] Submit with mismatched passwords: error message
- [ ] Submit with weak password: error message
- [ ] Submit valid form: redirects to signin
- [ ] Success message appears on signin page

### Sign In Flow
- [ ] Navigate to /auth/signin
- [ ] Form displays with fields:
  - [ ] Email input
  - [ ] Password input
  - [ ] Remember me checkbox
- [ ] Submit with invalid credentials: error message
- [ ] Submit with valid credentials: redirects to dashboard
- [ ] Dashboard loads with user's tasks
- [ ] Browser back button: doesn't return to signin
- [ ] Page refresh: still authenticated

### Logout Flow
- [ ] Click profile dropdown
- [ ] Click logout button
- [ ] Redirects to home/signin
- [ ] Navigating to /dashboard: redirects to signin
- [ ] localStorage cleared (check DevTools)

### Authentication Persistence
- [ ] Sign in user
- [ ] Refresh page: still authenticated
- [ ] Close tab, reopen: still authenticated
- [ ] Open in new tab: authenticated
- [ ] Clear localStorage: auth lost

---

## 4️⃣ Dashboard Testing

### Access Control
- [ ] Unauthenticated user → redirects to signin
- [ ] Authenticated user → can access dashboard
- [ ] Logout then access dashboard → redirects to signin

### Task Creation
- [ ] Form displays on left side
- [ ] Enter task title: accepts input
- [ ] Enter task description: accepts input
- [ ] Submit with empty title: error message
- [ ] Submit valid task: added to list
- [ ] Form clears after submission
- [ ] Success message appears

### Task Display
- [ ] All user's tasks display in list
- [ ] Task count shows (e.g., "My Tasks (5)")
- [ ] Task title visible
- [ ] Task description visible
- [ ] Completed/uncompleted indicator visible
- [ ] Empty state: "No tasks" message (if no tasks)

### Task Operations
- [ ] Click task: opens edit form
- [ ] Edit title/description: changes save
- [ ] Click complete button: toggles status
- [ ] Completed task: different styling (strikethrough)
- [ ] Delete button: shows confirmation modal
- [ ] Cancel delete: returns to task
- [ ] Confirm delete: task removed from list

### Refresh & Loading
- [ ] Click Refresh button: fetches latest tasks
- [ ] Loading state visible while refreshing
- [ ] Error message on network failure
- [ ] Can retry after error

### Success Messages
- [ ] Task created: "Task created successfully!" message
- [ ] Task updated: "Task updated successfully!" message
- [ ] Task deleted: "Task deleted successfully!" message
- [ ] Messages auto-dismiss after 3 seconds

---

## 5️⃣ Form Validation Testing

### Email Validation
- [ ] Blank email: "Email is required"
- [ ] Invalid format (no @): "Invalid email format"
- [ ] Valid email: accepted

### Password Validation
- [ ] Blank password: "Password is required"
- [ ] < 8 characters: "Min 8 characters"
- [ ] No uppercase: "Need uppercase"
- [ ] No lowercase: "Need lowercase"
- [ ] No number: "Need digit"
- [ ] Valid password: accepted

### Name Validation
- [ ] Blank name: "Name is required"
- [ ] > 100 characters: "Max 100 characters"
- [ ] Valid name: accepted

### Task Title Validation
- [ ] Blank title: "Title is required"
- [ ] > 200 characters: error message
- [ ] Valid title: accepted

---

## 6️⃣ Responsiveness Testing

### Breakpoints
- [ ] 320px (iPhone SE) - Mobile optimized
- [ ] 768px (iPad) - Tablet optimized
- [ ] 1024px (Desktop) - Full layout
- [ ] 1440px (Large monitor) - max-width applied

### Orientation
- [ ] Portrait orientation: responsive
- [ ] Landscape orientation: responsive
- [ ] No content cut off
- [ ] No horizontal scrolling

### Touch Interactions
- [ ] Buttons have adequate touch targets (44px+)
- [ ] Dropdowns touch-friendly
- [ ] Form inputs easy to tap
- [ ] Mobile menu easy to use

---

## 7️⃣ Error Handling Testing

### Network Errors
- [ ] Disconnect network
- [ ] Try to submit form: network error shown
- [ ] Page still functional
- [ ] Reconnect network: can retry

### API Errors
- [ ] Wrong email: "Invalid credentials"
- [ ] Wrong password: "Invalid credentials"
- [ ] Server error: user-friendly message
- [ ] Can retry after error

### Validation Errors
- [ ] Missing required fields: highlighted
- [ ] Error messages appear below fields
- [ ] Error messages clear when typing
- [ ] Submit button disabled if errors

---

## 8️⃣ Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all form inputs
- [ ] Shift+Tab navigates backward
- [ ] Enter submits forms
- [ ] Space activates buttons
- [ ] Dropdown arrows with keyboard
- [ ] Escape closes modals/dropdowns

### Screen Reader (NVDA/JAWS)
- [ ] Page title announced
- [ ] Navigation landmark identified
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Button purposes clear
- [ ] Links have descriptive text

### Color Contrast
- [ ] Text vs background: 4.5:1 ratio (normal text)
- [ ] UI components: 3:1 ratio
- [ ] Text readable without color
- [ ] No info conveyed by color alone

### Focus Management
- [ ] Focus outline visible on all interactive elements
- [ ] Focus order logical (top to bottom, left to right)
- [ ] Focus doesn't disappear
- [ ] Modal traps focus appropriately

---

## 9️⃣ Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)
- [ ] Firefox Mobile (latest)

### Features
- [ ] LocalStorage works
- [ ] Fetch API works
- [ ] CSS Grid works
- [ ] CSS Flexbox works
- [ ] Modern JavaScript syntax works

---

## 🔟 Performance Testing

### Page Load
- [ ] Home page loads in < 3 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] No layout shifts during load
- [ ] Images load properly

### Runtime Performance
- [ ] Task operations respond immediately
- [ ] No janky animations
- [ ] Form input is responsive
- [ ] Typing in fields is smooth

### DevTools Checks
- [ ] No console errors
- [ ] No console warnings
- [ ] Network requests complete
- [ ] localStorage usage reasonable

---

## 1️⃣1️⃣ Security Testing

### Input Security
- [ ] Try to submit HTML: escaped properly
- [ ] Try JavaScript in input: not executed
- [ ] Try SQL injection: handled safely
- [ ] XSS attempts: blocked

### Authentication Security
- [ ] Token stored in localStorage (visible in DevTools)
- [ ] Token sent in Authorization header
- [ ] No sensitive data in localStorage
- [ ] Password not sent to frontend
- [ ] No secrets in source code

### API Security
- [ ] All requests require valid token
- [ ] Unauthorized requests return 401
- [ ] Forbidden operations return 403
- [ ] Invalid tokens are rejected

---

## 🧑‍💻 Developer Testing

### Code Quality
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No ESLint errors: `npm run lint`
- [ ] Components render without warnings
- [ ] No memory leaks

### Development Build
- [ ] `npm run dev` starts successfully
- [ ] Hot reload works on file changes
- [ ] No build errors
- [ ] Source maps working

### Production Build
- [ ] `npm run build` completes
- [ ] `npm start` runs production build
- [ ] No console errors in production
- [ ] Assets load correctly

---

## 📊 Test Results Summary

### Passed Tests: _____ / _____
### Failed Tests: _____
### Issues Found: _____

### Notes:
```
[Add any issues found, unexpected behavior, or notes here]
```

### Date Tested: _______________
### Tested By: _______________
### Browser/Device: _______________

---

## 🚀 Sign-Off Checklist

Before deployment:
- [ ] All critical tests passed
- [ ] No console errors
- [ ] No memory leaks
- [ ] Responsive on all devices
- [ ] Accessibility compliant
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Ready for production

---

## 📝 Notes

### Common Issues & Solutions

**Issue**: Form not submitting
- **Check**: Console for errors, network tab
- **Solution**: Verify API endpoint is correct

**Issue**: Authentication not persisting
- **Check**: localStorage in DevTools
- **Solution**: Check browser supports localStorage

**Issue**: Dropdown not working on mobile
- **Check**: Touch event handlers
- **Solution**: Ensure click handlers also work on touch

**Issue**: Slow page load
- **Check**: Network tab, bundle size
- **Solution**: Check for large images or unoptimized code

