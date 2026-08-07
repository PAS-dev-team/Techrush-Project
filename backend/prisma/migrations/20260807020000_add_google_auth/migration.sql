-- AlterTable
-- passwordHash becomes optional: accounts created via "Continue with
-- Google" never set a password.
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- AlterTable
-- googleId links an account to its Google identity (sub claim).
ALTER TABLE "users" ADD COLUMN "googleId" TEXT;

-- AlterTable
-- roleSelected distinguishes a fresh sign-up (still needs to go
-- through role-selection.html) from a returning user who already
-- chose their role. Existing rows default to true so accounts that
-- were already using the app aren't sent back through role-selection;
-- new registrations explicitly set this to false at creation time.
ALTER TABLE "users" ADD COLUMN "roleSelected" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
