# Admin System Setup & Migration Guide

## Overview
The admin system has been successfully implemented with the following features:
- ✅ Manual workspace approval workflow
- ✅ User impersonation for support
- ✅ Platform analytics dashboard
- ✅ Free tier limits (1 workspace, 1 calendar per workspace)
- ✅ Better Auth admin plugin integration

---

## 1. Database Migration

### Migrate Existing Workspaces
All existing workspaces need to be approved so users can continue using them:

```sql
-- Approve all existing workspaces
UPDATE "workspace"
SET
  status = 'APPROVED',
  "approvedAt" = NOW()
WHERE status = 'PENDING' OR status IS NULL;
```

### Create Your Admin Account
Update your user account to have admin role:

```sql
-- Replace YOUR_EMAIL with your actual email
UPDATE "user"
SET role = 'ADMIN'
WHERE email = 'YOUR_EMAIL';
```

Run these migrations:
```bash
# Option 1: Using Prisma Studio
npx prisma studio
# Then manually update the records

# Option 2: Using psql or database client
# Connect to your database and run the SQL above
```

---

## 2. Environment Variables

Ensure these are set in `.env.local`:

```env
# Required
DATABASE_URL="your_postgres_connection_string"
BETTER_AUTH_SECRET="your_secret_min_32_chars"
BETTER_AUTH_URL="http://localhost:3000" # or your production URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional (for OAuth)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Optional (for AI quiz generation)
OPENAI_API_KEY="..."
```

---

## 3. Testing Checklist

### Phase 1: Admin Access
- [ ] Navigate to `/admin` - should redirect to `/sign-in` if not logged in
- [ ] Sign in with admin account
- [ ] Navigate to `/admin` - should see admin dashboard
- [ ] Check all navigation items work (Dashboard, Analytics, Users, Workspaces)

### Phase 2: Workspace Approval Flow
**As Regular User:**
- [ ] Sign up with a new account (non-admin)
- [ ] Create a workspace - should show "submitted for approval" message
- [ ] Dashboard shows "Workspace Venter på Godkjenning" card
- [ ] Cannot create calendars (workspace not approved)

**As Admin:**
- [ ] Go to `/admin` - see pending workspace count on dashboard
- [ ] Go to `/admin/workspaces` - see pending workspace in queue
- [ ] Click "Godkjenn" (Approve) - workspace approved
- [ ] Verify workspace shows in "Godkjent" tab

**As Regular User (after approval):**
- [ ] Refresh dashboard - workspace status should be approved
- [ ] Can now create calendars

### Phase 3: Workspace Rejection Flow
**As Regular User:**
- [ ] Create a second account and workspace (should hit limit)
- [ ] If you approve one, try creating another

**As Admin:**
- [ ] Go to pending workspace
- [ ] Click "Avvis" (Reject)
- [ ] Enter rejection reason: "Test rejection"
- [ ] Submit rejection

**As Regular User:**
- [ ] Refresh dashboard - should see rejection card with reason
- [ ] Cannot create calendars

### Phase 4: Free Tier Limits
**Workspace Limit (1 per user):**
- [ ] Create first workspace as USER role - succeeds
- [ ] Try to create second workspace - should fail with limit error
- [ ] Verify error message: "Gratis brukere kan kun opprette 1 workspace"

**Calendar Limit (1 per workspace):**
- [ ] Create first calendar in approved workspace - succeeds
- [ ] Try to create second calendar - should fail with limit error
- [ ] Verify error message: "Gratis brukere kan kun opprette 1 kalender per workspace"

**Admin Bypass:**
- [ ] As ADMIN role user, create multiple workspaces - should succeed
- [ ] As ADMIN role user, create multiple calendars - should succeed

### Phase 5: User Impersonation
**As Admin:**
- [ ] Go to `/admin/users`
- [ ] Find a non-admin user
- [ ] Click "Imiter" (Impersonate) button
- [ ] Should redirect to `/dashboard` as that user
- [ ] See yellow impersonation banner at top: "Du imiterer nå [username]"
- [ ] Verify you can see their workspace/calendars
- [ ] Click "Stopp Imitering" - return to admin session
- [ ] Should redirect back to `/admin`

### Phase 6: Platform Analytics
**As Admin:**
- [ ] Go to `/admin/analytics`
- [ ] Verify user metrics display correctly
- [ ] Verify workspace metrics show approval rates
- [ ] Verify calendar and lead counts
- [ ] Check percentage calculations make sense

### Phase 7: Security
**As Regular User:**
- [ ] Try accessing `/admin` directly - should redirect to dashboard
- [ ] Try accessing `/api/admin/workspaces/[id]/approve` via curl/Postman
  ```bash
  curl -X POST http://localhost:3000/api/admin/workspaces/WORKSPACE_ID/approve
  ```
- [ ] Should receive 403 Unauthorized error
- [ ] Verify cannot impersonate other users (no button visible)

---

## 4. Production Deployment Checklist

Before deploying to production:

### Database
- [ ] Run migration SQL to approve existing workspaces
- [ ] Set your account to ADMIN role
- [ ] Backup database before migration

### Environment
- [ ] Update `BETTER_AUTH_URL` to production URL
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Verify `BETTER_AUTH_SECRET` is strong (min 32 chars)
- [ ] Test Better Auth on production (sign up, sign in)

### Code
- [ ] Run `pnpm build` - verify no errors
- [ ] Run `pnpm lint` - fix any warnings
- [ ] Test all API routes work in production

### Email Notifications (TODO)
Currently email notifications are stubbed out with `// TODO` comments in:
- `app/api/admin/workspaces/[id]/approve/route.ts` (line ~33)
- `app/api/admin/workspaces/[id]/reject/route.ts` (line ~53)
- `app/api/workspaces/route.ts` (line ~95)

You'll need to implement:
- [ ] Email service integration (Resend, SendGrid, etc.)
- [ ] Admin notification template (new workspace)
- [ ] Approval notification template (user)
- [ ] Rejection notification template (user)

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor admin action logs
- [ ] Track workspace approval times
- [ ] Alert on pending workspace queue size

---

## 5. Admin URLs

### Admin Panel
- Dashboard: `/admin`
- Users: `/admin/users`
- Workspaces: `/admin/workspaces`
- Analytics: `/admin/analytics`

### API Endpoints
- Approve workspace: `POST /api/admin/workspaces/[id]/approve`
- Reject workspace: `POST /api/admin/workspaces/[id]/reject`

### Better Auth Admin
- Impersonate user: Uses `impersonateUser({ userId })` client function
- Stop impersonation: Uses `stopImpersonation()` client function

---

## 6. Usage Limits Summary

| Feature | Free (USER) | Admin (ADMIN) |
|---------|-------------|---------------|
| Workspaces | 1 | Unlimited |
| Calendars per workspace | 1 | Unlimited |
| Workspace approval | Required | Auto-approved |
| Platform access | Dashboard only | Full admin panel |
| Impersonation | Not allowed | Can impersonate users |

---

## 7. Troubleshooting

### "Unauthorized" when accessing /admin
- Verify user role in database: `SELECT id, email, role FROM "user" WHERE email = 'your@email.com';`
- Should show `role: ADMIN`
- Clear browser cookies and re-login

### Workspace stuck in PENDING
- Check database: `SELECT * FROM "workspace" WHERE id = 'workspace_id';`
- Manually approve via SQL or admin panel

### Cannot create calendar - "workspace not approved"
- Verify workspace status in database
- Should be `status: APPROVED` not `PENDING`

### Impersonation not working
- Check Better Auth admin plugin is configured in `lib/auth.ts`
- Verify admin client is set up in `lib/auth-client.ts`
- Check browser console for errors

---

## 8. Next Steps (Optional Enhancements)

### Priority Enhancements:
1. **Email Notifications** - Implement email sending for approval workflow
2. **Audit Logging** - Track all admin actions (approve, reject, impersonate)
3. **User Search** - Add search/filter to `/admin/users` page
4. **Bulk Actions** - Approve/reject multiple workspaces at once
5. **Workspace Suspension** - Add ability to suspend approved workspaces

### Future Features:
- **Subscription Tiers** - Integrate with Stripe for paid plans
- **Usage Analytics** - Track API usage, calendar views, conversion rates
- **Custom Roles** - Add more granular permissions (MODERATOR, SUPPORT, etc.)
- **GDPR Tools** - Data export and deletion requests
- **Rate Limiting** - Protect against abuse

---

## 9. Schema Changes Made

### User Model
```prisma
role          UserRole  @default(USER)  // NEW
```

### Workspace Model
```prisma
status          WorkspaceStatus @default(PENDING)  // NEW
submittedAt     DateTime        @default(now())    // NEW
approvedAt      DateTime?                          // NEW
approvedById    String?                           // NEW
approvedBy      User?           @relation(...)    // NEW
rejectedAt      DateTime?                          // NEW
rejectionReason String?                            // NEW
```

### New Enums
```prisma
enum UserRole {
  USER
  ADMIN
}

enum WorkspaceStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}
```

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console and server logs
3. Verify database migration completed
4. Test with a fresh user account (non-admin)

---

**Setup Complete!** 🎉

Your admin system is ready for production. Remember to:
1. Run database migrations
2. Set your admin account
3. Test all workflows before going live
4. Implement email notifications soon
