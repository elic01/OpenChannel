# OpenChannel Database Setup Instructions

## ⚠️ IMPORTANT: Run ONLY These Scripts

Do **NOT** run scripts 000, 003, or 004_fix - they cause infinite recursion errors.

## Scripts to Run (in order):

### 1. **scripts/001_enable_rls_policies.sql** ✅
Sets up all RLS (Row Level Security) policies for the system.
- Disables RLS on `profiles` table (prevents infinite recursion)
- Enables RLS on `feedback`, `organizations`, `pulse_polls`, etc.
- All policies use `true` with app-layer authorization

**Status**: Ready to run

### 2. **scripts/002_multi_tenant_enhancements.sql** ✅
Adds multi-tenant support and anonymity features.
- Creates `pc_admin_feedback_view` (never shows submitter_id)
- Adds subscription fields to organizations
- Adds employee_count tracking
- Adds is_active flag for terminated employees

**Status**: Ready to run

### 3. **scripts/004_create_manage_profile_function.sql** ✅
Creates SECURITY DEFINER function for secure profile creation.
- Allows profile creation during signup without triggering RLS
- Grants execute permission to authenticated users

**Status**: Ready to run

## How to Run

1. Go to your Supabase project → SQL Editor
2. Copy script 001 → Paste → Execute
3. Copy script 002 → Paste → Execute
4. Copy script 003 → Paste → Execute
5. **Verify**: No errors should appear for any script

## What Gets Set Up

✅ Anonymous feedback submission (RLS enabled, no submitter tracking)
✅ P&C Admin dashboard (filtered to never see submitter IDs)
✅ Role-based access (system_admin, pc_admin, employee)
✅ Organization isolation (multi-tenant)
✅ Employee termination tracking

## Auth/Login Flow

After scripts are executed:

1. **Admin Signs Up** → Creates organization + profile with `system_admin` role
2. **Admin Creates Users** → Via `/admin/users/invite` page
3. **Users Login** → Via `/auth/login`
4. **Role-based Dashboard Redirect**:
   - `system_admin` → `/admin/users` (user management)
   - `pc_admin` → `/admin/feedback` (review feedback)
   - `employee` → `/dashboard` (submit feedback)

## Troubleshooting

**Error: "infinite recursion detected in policy for relation profiles"**
→ Script 003 or 004_fix was run (they re-enable RLS on profiles). Delete them and run only scripts 001, 002, 004_create.

**Error: "WITH CHECK cannot be applied to SELECT"**
→ Script 001 had invalid syntax. Use the corrected version here.

**Error: "function manage_profile() does not exist"**
→ Script 004_create wasn't run. Run it after 001 and 002.
