\-- \============================================================  
\-- TELEO: Discipleship Service — Schema (discipleship schema)  
\-- \============================================================  
\-- Physical setup: ONE database, one schema per service (e.g.  
\-- \`discipleship\`, \`identity\`, \`church\`, \`journey\`). This is a  
\-- "logical microservices, physical shared database" pattern —  
\-- service boundaries are enforced by CONVENTION and API design,  
\-- not by separate physical databases.  
\--  
\-- Rules this file follows to keep that boundary real even though  
\-- it's technically not required by Postgres:  
\--  
\--   \- NO foreign keys across schemas (e.g. nothing in this file  
\--     references identity.users, church.churches, or  
\--     journey.journeys). church\_id / user\_id / journey\_id are  
\--     plain columns, validated at the API layer.  
\--   \- NO cross-schema JOINs in any view here. Every view in this  
\--     file only touches tables inside the \`discipleship\` schema.  
\--   \- Anything that needs data from another service (a user's  
\--     display name, their home church, their Journey progress)  
\--     is fetched by the API layer with its own query against that  
\--     service's schema, then composed/merged in application code —  
\--     never inside a SQL statement that spans schemas.  
\--  
\-- Why bother, if it's all one database anyway? Because this is  
\-- what keeps the services independently understandable and  
\-- refactorable now, and makes an eventual split into separate  
\-- physical databases a non-event later — nothing here would need  
\-- to change, since nothing here ever assumed they were the same  
\-- database in the first place.  
\--  
\-- IMPORTANT: Home Church does NOT gate discipleship access. Any  
\-- user can browse and apply to any church's discipleship track.  
\-- is\_home\_church is a plain, API-supplied snapshot value — purely  
\-- a recommendation/display signal, never an authorization check.  
\-- \============================================================

\-- \============================================================  
\-- 0\. EVENT CONTRACTS  
\-- \============================================================  
\-- This service still PUBLISHES domain events — useful for  
\-- notifications, analytics, or any other service that wants to  
\-- react to what happens here, regardless of how the database is  
\-- physically deployed.  
\--  
\--   discipleship.application.submitted.v1   { application\_id, church\_id, user\_id }  
\--   discipleship.application.approved.v1    { application\_id, church\_id, user\_id, discipleship\_id, reviewed\_by }  
\--   discipleship.application.rejected.v1    { application\_id, church\_id, user\_id, reviewed\_by }  
\--   discipleship.member.added.v1            { discipleship\_id, church\_id, user\_id, role }  
\--   discipleship.member.removed.v1          { discipleship\_id, church\_id, user\_id }  
\--   discipleship.membership.paused.v1       { discipleship\_id, user\_id }  
\--   discipleship.membership.resumed.v1      { discipleship\_id, user\_id }  
\--   discipleship.meeting.scheduled.v1       { meeting\_id, discipleship\_id, recurrence\_type }  
\--   discipleship.discussion\_question.posted.v1 { question\_id, church\_id }  
\--   discipleship.journey.assigned.v1        { discipleship\_id, journey\_id, assigned\_by }  
\--   discipleship.leadership.handoff.v1      { discipleship\_id, outgoing\_user\_id, incoming\_user\_id, reassigned\_by }  
\--  
\-- This service does NOT consume events to maintain local copies of  
\-- other services' data (no caches — see header). When the API needs  
\-- a user's home church, profile, or Journey progress, it queries  
\-- that service's schema directly at request time and composes the  
\-- result in application code.  
\-- \============================================================

\-- \============================================================  
\-- 1\. DISCIPLESHIPS  
\-- \============================================================  
CREATE TABLE discipleships (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    church\_id BIGINT NOT NULL,   \-- external ref (church schema) — no FK, API-validated

    name VARCHAR(255) NOT NULL,  
    description TEXT,

    capacity\_limit INT DEFAULT NULL,  
    status VARCHAR(20) DEFAULT 'active',

    created\_by UUID NOT NULL,   \-- external ref (identity schema) — no FK  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,  
    updated\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,

    CONSTRAINT discipleships\_status\_check  
        CHECK (status IN ('active', 'inactive', 'archived'))  
);

CREATE INDEX idx\_discipleships\_church\_status  
    ON discipleships(church\_id, status);

\-- \============================================================  
\-- 2\. DISCIPLESHIP MEMBERS  
\-- \============================================================  
CREATE TABLE discipleship\_members (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    discipleship\_id UUID NOT NULL REFERENCES discipleships(id) ON DELETE CASCADE,  
    user\_id UUID NOT NULL,   \-- external ref (identity schema) — no FK

    role VARCHAR(20) NOT NULL DEFAULT 'member',  
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    \-- Recommendation signal only, NOT a gate. Computed and supplied  
    \-- by the API at write time (it queries identity.users for the  
    \-- user's home\_church\_id and compares it to this group's  
    \-- church\_id) — the database does not derive this value itself.  
    \-- Snapshotted so it doesn't silently change if home church  
    \-- changes later.  
    is\_home\_church BOOLEAN DEFAULT NULL,

    joined\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,  
    left\_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    \-- Pause is a separate, temporary state — member keeps their spot  
    \-- and history, just isn't expected at meetings. Distinct from  
    \-- 'left', which is permanent (Journey 3 vs Journey 4).  
    paused\_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,  
    resumed\_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    CONSTRAINT discipleship\_members\_role\_check  
        CHECK (role IN ('leader', 'co\_leader', 'member')),  
    CONSTRAINT discipleship\_members\_status\_check  
        CHECK (status IN ('active', 'paused', 'left', 'removed')),  
    CONSTRAINT discipleship\_members\_left\_at\_check  
        CHECK ((status \= 'left' AND left\_at IS NOT NULL) OR status \!= 'left'),  
    CONSTRAINT discipleship\_members\_paused\_at\_check  
        CHECK ((status \= 'paused' AND paused\_at IS NOT NULL) OR status \!= 'paused')  
);

CREATE UNIQUE INDEX unique\_active\_member\_per\_discipleship  
    ON discipleship\_members(discipleship\_id, user\_id)  
    WHERE status \= 'active';

CREATE INDEX idx\_discipleship\_members\_user\_id ON discipleship\_members(user\_id);  
CREATE INDEX idx\_discipleship\_members\_discipleship\_id ON discipleship\_members(discipleship\_id);

\-- \============================================================  
\-- 3\. INTAKE FORM TEMPLATES  
\-- \============================================================  
CREATE TABLE discipleship\_intake\_form\_templates (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    church\_id BIGINT NOT NULL,   \-- external ref, no FK

    form\_schema JSONB NOT NULL,  
    is\_active BOOLEAN DEFAULT TRUE,

    created\_by UUID NOT NULL,   \-- external ref, no FK  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,  
    updated\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP  
);

CREATE UNIQUE INDEX unique\_active\_intake\_template\_per\_church  
    ON discipleship\_intake\_form\_templates(church\_id)  
    WHERE is\_active \= TRUE;

\-- \============================================================  
\-- 4\. DISCIPLESHIP APPLICATIONS  
\-- \============================================================  
CREATE TABLE discipleship\_applications (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    church\_id BIGINT NOT NULL,   \-- external ref, no FK  
    user\_id UUID NOT NULL,       \-- external ref, no FK

    intake\_form\_template\_id UUID REFERENCES discipleship\_intake\_form\_templates(id) ON DELETE SET NULL,  
    form\_response JSONB NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    \-- Recommendation signal only, NOT a gate — supplied by the API  
    \-- at submission time (see discipleship\_members.is\_home\_church  
    \-- above for how it's computed).  
    is\_home\_church BOOLEAN DEFAULT NULL,

    reviewed\_by UUID DEFAULT NULL,   \-- external ref, no FK  
    reviewed\_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,  
    admin\_notes TEXT DEFAULT NULL,

    assigned\_discipleship\_id UUID REFERENCES discipleships(id) ON DELETE SET NULL,

    created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,  
    updated\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,

    CONSTRAINT discipleship\_applications\_status\_check  
        CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),

    CONSTRAINT discipleship\_applications\_assignment\_consistency\_check  
        CHECK (  
            (status \= 'approved' AND assigned\_discipleship\_id IS NOT NULL) OR  
            (status \!= 'approved')  
        )  
);

\-- Only blocks a DUPLICATE pending application to the SAME church.  
\-- A user can still have separate pending applications open at  
\-- several different churches at once — that's allowed by design  
\-- now that home church isn't a gate.  
CREATE UNIQUE INDEX unique\_pending\_application\_per\_user\_church  
    ON discipleship\_applications(church\_id, user\_id)  
    WHERE status \= 'pending';

CREATE INDEX idx\_discipleship\_applications\_church\_status  
    ON discipleship\_applications(church\_id, status);

\-- \============================================================  
\-- 5\. MEETING SCHEDULER  
\-- \============================================================  
CREATE TABLE discipleship\_meetings (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    discipleship\_id UUID NOT NULL REFERENCES discipleships(id) ON DELETE CASCADE,

    title VARCHAR(255) DEFAULT NULL,  
    meeting\_type VARCHAR(20) NOT NULL,

    location\_address TEXT DEFAULT NULL,  
    meeting\_link TEXT DEFAULT NULL,

    recurrence\_type VARCHAR(20) NOT NULL DEFAULT 'weekly',  
    day\_of\_week INT DEFAULT NULL,  
    meeting\_time TIME NOT NULL,

    start\_date DATE NOT NULL,  
    end\_date DATE DEFAULT NULL,

    status VARCHAR(20) DEFAULT 'active',

    created\_by UUID NOT NULL,   \-- external ref, no FK  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,  
    updated\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,

    CONSTRAINT discipleship\_meetings\_type\_check  
        CHECK (meeting\_type IN ('physical', 'virtual', 'hybrid')),  
    CONSTRAINT discipleship\_meetings\_recurrence\_check  
        CHECK (recurrence\_type IN ('weekly', 'biweekly', 'monthly', 'one\_time')),  
    CONSTRAINT discipleship\_meetings\_status\_check  
        CHECK (status IN ('active', 'cancelled')),  
    CONSTRAINT discipleship\_meetings\_location\_check  
        CHECK (  
            (meeting\_type \= 'physical' AND location\_address IS NOT NULL) OR  
            (meeting\_type \= 'virtual' AND meeting\_link IS NOT NULL) OR  
            (meeting\_type \= 'hybrid' AND location\_address IS NOT NULL AND meeting\_link IS NOT NULL)  
        ),  
    CONSTRAINT discipleship\_meetings\_recurring\_day\_check  
        CHECK (  
            (recurrence\_type \= 'one\_time' AND day\_of\_week IS NULL) OR  
            (recurrence\_type \!= 'one\_time' AND day\_of\_week IS NOT NULL)  
        )  
);

CREATE INDEX idx\_discipleship\_meetings\_discipleship\_id  
    ON discipleship\_meetings(discipleship\_id, status);

\-- \============================================================  
\-- 6\. GLOBAL DISCUSSION QUESTIONS  
\-- \============================================================  
CREATE TABLE discipleship\_discussion\_questions (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    church\_id BIGINT NOT NULL,   \-- external ref, no FK

    question\_text TEXT NOT NULL,  
    status VARCHAR(20) DEFAULT 'active',

    posted\_by UUID NOT NULL,   \-- external ref, no FK  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,

    CONSTRAINT discipleship\_discussion\_questions\_status\_check  
        CHECK (status IN ('active', 'archived'))  
);

CREATE UNIQUE INDEX unique\_active\_discussion\_question\_per\_church  
    ON discipleship\_discussion\_questions(church\_id)  
    WHERE status \= 'active';

\-- \============================================================  
\-- 7\. JOURNEY SYNC (pointer only — no cross-schema FK)  
\-- \============================================================  
CREATE TABLE discipleship\_journey\_assignments (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    discipleship\_id UUID NOT NULL REFERENCES discipleships(id) ON DELETE CASCADE,  
    journey\_id UUID NOT NULL,   \-- external ref (journey schema) — no FK

    assigned\_by UUID NOT NULL,   \-- external ref, no FK  
    assigned\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,  
    is\_active BOOLEAN DEFAULT TRUE  
);

CREATE UNIQUE INDEX unique\_active\_journey\_per\_discipleship  
    ON discipleship\_journey\_assignments(discipleship\_id)  
    WHERE is\_active \= TRUE;

\-- \============================================================  
\-- 8\. LEADERSHIP HANDOFFS (audit log)  
\-- \============================================================  
\-- Admin Journey 4: reassigning a Discipler shouldn't disrupt the  
\-- group's members, meeting schedule, discussion history, or current  
\-- Journey — only the Discipler changes. This table is purely an  
\-- audit trail (matching the pattern already used for user role  
\-- changes in the master doc), not the mechanism that performs the  
\-- handoff itself — that's a role update on discipleship\_members  
\-- (see example transaction at the bottom of this file).  
CREATE TABLE discipleship\_leadership\_handoffs (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    discipleship\_id UUID NOT NULL REFERENCES discipleships(id) ON DELETE CASCADE,

    outgoing\_user\_id UUID NOT NULL,   \-- external ref, no FK  
    incoming\_user\_id UUID NOT NULL,   \-- external ref, no FK  
    reassigned\_by UUID NOT NULL,      \-- external ref, no FK (the Church Admin)

    reassigned\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP  
);

CREATE INDEX idx\_discipleship\_leadership\_handoffs\_discipleship\_id  
    ON discipleship\_leadership\_handoffs(discipleship\_id);

\-- \============================================================  
\-- 9\. TRIGGERS  
\-- \============================================================  
\-- Only a generic updated\_at bump remains here. There is no  
\-- home-church-flagging trigger anymore — that logic moved to the  
\-- API layer, since it needs data from another schema and this file  
\-- doesn't allow cross-schema reads even for triggers.

CREATE OR REPLACE FUNCTION fn\_set\_updated\_at()  
RETURNS TRIGGER AS \$\$  
BEGIN  
    NEW.updated\_at := CURRENT\_TIMESTAMP;  
    RETURN NEW;  
END;  
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER trg\_discipleships\_updated\_at  
BEFORE UPDATE ON discipleships  
FOR EACH ROW EXECUTE FUNCTION fn\_set\_updated\_at();

CREATE TRIGGER trg\_discipleship\_intake\_templates\_updated\_at  
BEFORE UPDATE ON discipleship\_intake\_form\_templates  
FOR EACH ROW EXECUTE FUNCTION fn\_set\_updated\_at();

CREATE TRIGGER trg\_discipleship\_applications\_updated\_at  
BEFORE UPDATE ON discipleship\_applications  
FOR EACH ROW EXECUTE FUNCTION fn\_set\_updated\_at();

CREATE TRIGGER trg\_discipleship\_meetings\_updated\_at  
BEFORE UPDATE ON discipleship\_meetings  
FOR EACH ROW EXECUTE FUNCTION fn\_set\_updated\_at();

\-- \============================================================  
\-- 10\. VIEWS  
\-- \============================================================  
\-- Every view below touches ONLY discipleship-schema tables. None  
\-- of them resolve a username, email, home church, or Journey  
\-- progress — those come back as plain user\_id / journey\_id  
\-- values, and it's the API's job to look up and attach that  
\-- information from the other schemas before responding to the  
\-- client. This is what "no cross-schema joins" means in practice.

CREATE OR REPLACE VIEW v\_discipleship\_roster AS  
SELECT  
    dm.id AS membership\_id,  
    dm.discipleship\_id,  
    dg.church\_id,  
    dg.name AS discipleship\_name,

    dm.user\_id,   \-- API resolves username/email/phone from identity schema

    dm.role,  
    dm.status,  
    dm.joined\_at,  
    dm.left\_at,  
    dm.paused\_at,  
    dm.resumed\_at,

    \-- Snapshot: was this their home church AT JOIN TIME? (Supplied  
    \-- by the API at insert time — see discipleship\_members table.)  
    dm.is\_home\_church AS was\_home\_church\_at\_join

FROM discipleship\_members dm  
JOIN discipleships dg ON dg.id \= dm.discipleship\_id;

CREATE OR REPLACE VIEW v\_pending\_discipleship\_applications AS  
SELECT  
    da.id AS application\_id,  
    da.church\_id,  
    da.user\_id,   \-- API resolves username/email from identity schema  
    da.form\_response,  
    da.is\_home\_church,   \-- recommendation signal for the admin, not a filter

    \-- Informational only, not a blocker (Member Journey 6). This  
    \-- check stays inside this view because it only touches this  
    \-- service's own discipleship\_members table — not a cross-schema  
    \-- read, just a self-join within \`discipleship\`.  
    EXISTS (  
        SELECT 1 FROM discipleship\_members dm  
        WHERE dm.user\_id \= da.user\_id AND dm.status \= 'active'  
    ) AS already\_active\_elsewhere,

    da.created\_at AS applied\_at

FROM discipleship\_applications da  
WHERE da.status \= 'pending'  
\-- Surface home-church applicants first as a nudge, but every  
\-- pending application still shows up regardless of this flag.  
ORDER BY da.is\_home\_church DESC NULLS LAST, da.created\_at ASC;

CREATE OR REPLACE VIEW v\_discipleship\_active\_discussion AS  
SELECT  
    dg.id AS discipleship\_id,  
    dg.church\_id,  
    dg.name AS discipleship\_name,  
    dq.id AS discussion\_question\_id,  
    dq.question\_text,  
    dq.created\_at AS posted\_at

FROM discipleships dg  
LEFT JOIN discipleship\_discussion\_questions dq  
    ON dq.church\_id \= dg.church\_id AND dq.status \= 'active'  
WHERE dg.status \= 'active';

CREATE OR REPLACE VIEW v\_discipleship\_current\_journey AS  
SELECT  
    dg.id AS discipleship\_id,  
    dg.church\_id,  
    dg.name AS discipleship\_name,  
    dja.journey\_id,   \-- API resolves Journey title/details from journey schema  
    dja.assigned\_by,  
    dja.assigned\_at

FROM discipleships dg  
JOIN discipleship\_journey\_assignments dja  
    ON dja.discipleship\_id \= dg.id AND dja.is\_active \= TRUE;

\-- Church-wide Group Directory (Admin Journey 5, step 1\) — every  
\-- active group, headcount vs. capacity, and next meeting. Leader  
\-- user\_ids come back as an array; the API resolves names.  
CREATE OR REPLACE VIEW v\_discipleship\_group\_directory AS  
SELECT  
    dg.id AS discipleship\_id,  
    dg.church\_id,  
    dg.name AS discipleship\_name,  
    dg.capacity\_limit,

    (SELECT COUNT(\*) FROM discipleship\_members dm  
     WHERE dm.discipleship\_id \= dg.id AND dm.status \= 'active') AS active\_member\_count,

    (SELECT array\_agg(dm.user\_id)  
     FROM discipleship\_members dm  
     WHERE dm.discipleship\_id \= dg.id AND dm.role IN ('leader', 'co\_leader') AND dm.status \= 'active'  
    ) AS leader\_user\_ids,

    (SELECT MIN(dmt.meeting\_time)  
     FROM discipleship\_meetings dmt  
     WHERE dmt.discipleship\_id \= dg.id AND dmt.status \= 'active'  
    ) AS next\_meeting\_time

FROM discipleships dg  
WHERE dg.status \= 'active';

\-- Per-Discipler load indicator (Admin Journey 5, step 2\) —  
\-- informational context for placement decisions, not an  
\-- auto-balancing mechanism. Returns user\_id; API resolves the name.  
CREATE OR REPLACE VIEW v\_discipler\_load AS  
SELECT  
    dm.user\_id AS discipler\_user\_id,  
    dg.church\_id,

    COUNT(DISTINCT dg.id) AS groups\_led\_count,  
    COUNT(DISTINCT dm2.user\_id) FILTER (WHERE dm2.status \= 'active') AS total\_disciples\_count

FROM discipleship\_members dm  
JOIN discipleships dg ON dg.id \= dm.discipleship\_id AND dg.status \= 'active'  
LEFT JOIN discipleship\_members dm2 ON dm2.discipleship\_id \= dg.id AND dm2.role \= 'member'  
WHERE dm.role IN ('leader', 'co\_leader') AND dm.status \= 'active'  
GROUP BY dm.user\_id, dg.church\_id;

\-- Meetings across every group a given Discipler leads (Discipler  
\-- Journey 8, step 3 — their personal calendar). Filter by  
\-- discipler\_user\_id at query time.  
CREATE OR REPLACE VIEW v\_discipler\_calendar AS  
SELECT  
    dm.user\_id AS discipler\_user\_id,  
    dg.id AS discipleship\_id,  
    dg.name AS discipleship\_name,  
    dmt.id AS meeting\_id,  
    dmt.meeting\_type,  
    dmt.location\_address,  
    dmt.meeting\_link,  
    dmt.recurrence\_type,  
    dmt.day\_of\_week,  
    dmt.meeting\_time,  
    dmt.start\_date,  
    dmt.end\_date

FROM discipleship\_members dm  
JOIN discipleships dg ON dg.id \= dm.discipleship\_id AND dg.status \= 'active'  
JOIN discipleship\_meetings dmt ON dmt.discipleship\_id \= dg.id AND dmt.status \= 'active'  
WHERE dm.role IN ('leader', 'co\_leader') AND dm.status \= 'active';

\-- Church-wide calendar (Admin Journey 5, step 3\) — every group's  
\-- meetings for a church. Color-coding is a UI concern using  
\-- discipleship\_id / discipler\_user\_id as the grouping key. Overlap  
\-- detection is visual only, per the "no auto conflict-blocking"  
\-- decision — this view surfaces the data, a human resolves it.  
CREATE OR REPLACE VIEW v\_church\_discipleship\_calendar AS  
SELECT  
    dg.church\_id,  
    dg.id AS discipleship\_id,  
    dg.name AS discipleship\_name,  
    dm.user\_id AS discipler\_user\_id,  
    dmt.id AS meeting\_id,  
    dmt.meeting\_type,  
    dmt.location\_address,  
    dmt.meeting\_link,  
    dmt.recurrence\_type,  
    dmt.day\_of\_week,  
    dmt.meeting\_time

FROM discipleships dg  
JOIN discipleship\_meetings dmt ON dmt.discipleship\_id \= dg.id AND dmt.status \= 'active'  
LEFT JOIN discipleship\_members dm ON dm.discipleship\_id \= dg.id AND dm.role \= 'leader' AND dm.status \= 'active'  
WHERE dg.status \= 'active';

\-- \============================================================  
\-- Example flow (application \-\> approval \-\> membership)  
\-- \============================================================  
\-- 1\. Member submits application. The API first queries the  
\--    identity schema for the user's home\_church\_id, computes  
\--    is\_home\_church itself, then writes it in:  
\--      INSERT INTO discipleship\_applications (..., is\_home\_church)  
\--      VALUES (..., \<computed\_by\_api\>);  
\--      \-\> publish discipleship.application.submitted.v1  
\--  
\-- 2\. Admin approves \+ assigns to a discipleship (one local  
\--    transaction, since both tables are in the discipleship schema):  
\--      BEGIN;  
\--        UPDATE discipleship\_applications  
\--        SET status \= 'approved', reviewed\_by \= '\<ADMIN\_UUID\>', reviewed\_at \= NOW(),  
\--            assigned\_discipleship\_id \= '\<DISCIPLESHIP\_UUID\>'  
\--        WHERE id \= '\<APPLICATION\_UUID\>';  
\--  
\--        INSERT INTO discipleship\_members (discipleship\_id, user\_id, role, is\_home\_church)  
\--        VALUES ('\<DISCIPLESHIP\_UUID\>', '\<USER\_UUID\>', 'member', \<computed\_by\_api\>);  
\--      COMMIT;  
\--      \-\> publish discipleship.application.approved.v1  
\--      \-\> publish discipleship.member.added.v1  
\--  
\-- The API can reuse the is\_home\_church value from step 1 rather  
\-- than re-querying identity — or re-check it live at approval time  
\-- if the product wants a stricter guarantee against the user's home  
\-- church changing in between. Either way, that decision lives in  
\-- application code now, not in a database trigger.

\-- \============================================================  
\-- Example flow (pause / resume — Member Journey 4\)  
\-- \============================================================  
\--   UPDATE discipleship\_members  
\--   SET status \= 'paused', paused\_at \= NOW()  
\--   WHERE discipleship\_id \= '\<DISCIPLESHIP\_UUID\>' AND user\_id \= '\<USER\_UUID\>' AND status \= 'active';  
\--   \-\> publish discipleship.membership.paused.v1  
\--  
\--   \-- later, on resume:  
\--   UPDATE discipleship\_members  
\--   SET status \= 'active', resumed\_at \= NOW()  
\--   WHERE discipleship\_id \= '\<DISCIPLESHIP\_UUID\>' AND user\_id \= '\<USER\_UUID\>' AND status \= 'paused';  
\--   \-\> publish discipleship.membership.resumed.v1

\-- \============================================================  
\-- Example flow (leaving permanently — Member Journey 3\)  
\-- \============================================================  
\--   UPDATE discipleship\_members  
\--   SET status \= 'left', left\_at \= NOW()  
\--   WHERE discipleship\_id \= '\<DISCIPLESHIP\_UUID\>' AND user\_id \= '\<USER\_UUID\>';  
\--   \-\> publish discipleship.member.removed.v1

\-- \============================================================  
\-- Example flow (leadership handoff — Admin Journey 4\)  
\-- \============================================================  
\-- ASSUMPTION: the outgoing Discipler steps down from LEADING the  
\-- group but isn't automatically removed as a member — that's a  
\-- separate action (Journey 3\) if they choose to leave entirely.  
\-- Revisit this assumption if the product intends the outgoing  
\-- Discipler to always exit the group on handoff.  
\--  
\--   BEGIN;  
\--     UPDATE discipleship\_members  
\--     SET role \= 'member'  
\--     WHERE discipleship\_id \= '\<DISCIPLESHIP\_UUID\>' AND user\_id \= '\<OUTGOING\_UUID\>' AND role \= 'leader';  
\--  
\--     \-- if the incoming Discipler isn't already a member of the group:  
\--     INSERT INTO discipleship\_members (discipleship\_id, user\_id, role)  
\--     VALUES ('\<DISCIPLESHIP\_UUID\>', '\<INCOMING\_UUID\>', 'leader')  
\--     ON CONFLICT DO NOTHING;  
\--     \-- if they ARE already a member (e.g. a co-leader being promoted):  
\--     \-- UPDATE discipleship\_members SET role \= 'leader'  
\--     \-- WHERE discipleship\_id \= '\<DISCIPLESHIP\_UUID\>' AND user\_id \= '\<INCOMING\_UUID\>';  
\--  
\--     INSERT INTO discipleship\_leadership\_handoffs  
\--       (discipleship\_id, outgoing\_user\_id, incoming\_user\_id, reassigned\_by)  
\--     VALUES ('\<DISCIPLESHIP\_UUID\>', '\<OUTGOING\_UUID\>', '\<INCOMING\_UUID\>', '\<ADMIN\_UUID\>');  
\--   COMMIT;  
\--   \-\> publish discipleship.leadership.handoff.v1  
\--  
\-- Note: meeting schedule, discussion history, and current Journey  
\-- assignment all live on discipleships/discipleship\_meetings/  
\-- discipleship\_journey\_assignments, none of which reference the  
\-- Discipler directly — so none of it needs to change here. That's  
\-- what makes "everything stays the same, only the Discipler changes"  
\-- true by construction, not by extra code to preserve it.  
