-- 028_normalise_role_spelling.sql
-- seed.js inserts the role as 'organizer' while index.js and admin.service.js
-- use 'organiser'. Because roles.role_name is UNIQUE with ON CONFLICT DO NOTHING,
-- both rows can coexist, and users created by each path end up with a role_id
-- that the other path's queries (admin organiser counts, role guards) miss.
--
-- Normalise to 'organiser' and repoint any users who were seeded as 'organizer'.
-- Safe to re-run: the second UPDATE/DELETE become no-ops once the row is gone.

UPDATE users
   SET role_id = (SELECT id FROM roles WHERE role_name = 'organiser')
 WHERE role_id = (SELECT id FROM roles WHERE role_name = 'organizer')
   AND EXISTS (SELECT 1 FROM roles WHERE role_name = 'organiser');

DELETE FROM roles
 WHERE role_name = 'organizer'
   AND EXISTS (SELECT 1 FROM roles WHERE role_name = 'organiser');
