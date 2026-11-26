# Security Specification — DIONTADO PRODUCTION CMS

## 1. Data Invariants
1. Only verified admin users (`email_verified == true` and email in `['amadou1966.sy@gmail.com', 'diontadoevens.0@gmail.com']` or registered in `/admins/{uid}`) may create, update, or delete any CMS document.
2. Public visitors (`unauthenticated` or non-admin signed-in users) may ONLY list and read `portfolio_photos`, `portfolio_albums`, `portfolio_videos`, and `site_services` where `resource.data.published == true`.
3. `portfolio_photos` and `portfolio_albums` ONLY accept `category in ['Soutenance', 'Photographie professionnelle']`. Legacy categories cannot be written.
4. `site_categories` ONLY accepts `slug in ['soutenance', 'photographie-professionnelle']` and matching canonical titles (`SOUTENANCE` / `PHOTOGRAPHIE PROFESSIONNELLE`).
5. `authorUid` MUST equal `request.auth.uid` on creation and remain immutable on updates.
6. `createdAt` MUST equal `request.time` on creation and remain immutable on updates; `updatedAt` MUST equal `request.time` on creation and every update.
7. Every string field is bounded by `.size()` limits, every URL uses `https://` or `/api/media/`, and path IDs match `^[a-zA-Z0-9_-]+$`.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated write to `/portfolio_photos/test1` -> PERMISSION_DENIED.
2. Signed-in user with `email_verified: false` claiming admin email -> PERMISSION_DENIED.
3. Non-admin signed-in user attempting to create `/admins/{uid}` -> PERMISSION_DENIED.
4. Admin writing legacy category `category: "Mariage"` to `/portfolio_photos/test2` -> PERMISSION_DENIED.
5. Admin injecting shadow field `isSuperUser: true` into `/portfolio_photos/test3` -> PERMISSION_DENIED.
6. Admin spoofing `authorUid: "other-uid"` on create -> PERMISSION_DENIED.
7. Admin forging `createdAt` with past client timestamp instead of `request.time` -> PERMISSION_DENIED.
8. Admin modifying immutable `createdAt` or `authorUid` on update -> PERMISSION_DENIED.
9. Public visitor listing `/portfolio_photos` without `where("published", "==", true)` (exposes unpublished drafts) -> PERMISSION_DENIED.
10. Public visitor reading unpublished draft photo (`published: false`) via `get()` -> PERMISSION_DENIED.
11. Admin submitting oversized ID (`150` chars) or invalid characters (`../evil`) -> PERMISSION_DENIED.
12. Admin injecting `javascript:alert(1)` into `url` or `imageUrl` -> PERMISSION_DENIED.
