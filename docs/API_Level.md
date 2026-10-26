# **Discipleship Feature — API Interaction Sequence Diagrams**

Perspective: API Integration View (frontend-to-backend). Every diagram uses exactly three participants — **Client / Frontend UI**, **Node.js Express API**, and **Supabase Database** — with the backend treated as a single black box. Where a journey involves two different human roles (e.g. a Member applying and an Admin reviewing), both use the same `Client` lane, labeled per action so it's clear whose screen is making the call.

Auth/role-check middleware is assumed to already run before these handlers — `401`/`403` paths are not shown. Status codes used throughout: `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`.

---

## **Part 1: Regular App — Member & Discipler POV**

### **🧑 As a Member (Disciple)**

## **Journey 1 — Discovering & Applying to a Discipleship**

### **1a. Browse churches offering Discipleship**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /churches/discipleship-programs  
    API-\>\>DB: Query active discipleship-enabled churches  
    DB--\>\>API: Church list (Home Church flagged first)  
    API--\>\>Client: 200 OK { churches: \[...\] }

### **1b. View a church's Discipleship intro**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /churches/:churchId/discipleship-program  
    API-\>\>DB: Query church's Discipleship program details

    alt Church found  
        DB--\>\>API: Program info  
        API--\>\>Client: 200 OK { program }  
    else Church not found  
        DB--\>\>API: No rows  
        API--\>\>Client: 404 Not Found  
    end

### **1c. Load the intake/profiling form**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /discipleship-intake-form-templates?church\_id=:churchId  
    API-\>\>DB: Query active intake form template for church

    alt Template exists  
        DB--\>\>API: form\_schema  
        API--\>\>Client: 200 OK { form\_schema }  
    else No active template  
        DB--\>\>API: No rows  
        API--\>\>Client: 404 Not Found  
    end

### **1d. Submit the application**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: POST /discipleship-applications { church\_id, form\_response }  
    API-\>\>API: Look up user's home church, compute is\_home\_church  
    API-\>\>DB: Check for existing pending application (same church/user)

    alt No duplicate, valid form  
        API-\>\>DB: INSERT discipleship\_applications  
        DB--\>\>API: Created application row  
        API--\>\>Client: 201 Created { application\_id, status: "pending" }  
    else Duplicate pending application at this church  
        DB--\>\>API: Existing pending row found  
        API--\>\>Client: 409 Conflict { error: "Pending application already exists" }  
    else Invalid form data  
        API--\>\>Client: 400 Bad Request { error: "Invalid form\_response" }  
    end

### **1e. Check application status**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /me/discipleship-applications  
    API-\>\>DB: Query applications for the authenticated user  
    DB--\>\>API: Application rows (pending / approved / rejected)  
    API--\>\>Client: 200 OK { applications: \[...\] }

## **Journey 2 — Being an Active Member of a Discipleship**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /me/discipleships/:discipleshipId  
    API-\>\>DB: Query group, Discipler, members, next meeting, discussion question, current Journey

    alt Membership found  
        DB--\>\>API: Aggregated group data  
        API--\>\>Client: 200 OK { group, discipler, members, next\_meeting, discussion\_question, current\_journey }  
    else Not found or not a member of this group  
        API--\>\>Client: 404 Not Found  
    end

## **Journey 3 — Leaving a Discipleship (Permanently)**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: PATCH /discipleship-members/:memberId { status: "left" }  
    API-\>\>DB: UPDATE discipleship\_members SET status='left', left\_at=NOW()

    alt Membership found  
        DB--\>\>API: Updated row  
        API--\>\>Client: 200 OK { status: "left" }  
    else Membership not found  
        API--\>\>Client: 404 Not Found  
    end

## **Journey 4 — Pausing Membership (Temporary)**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    alt Member pauses  
        Client-\>\>API: PATCH /discipleship-members/:memberId { status: "paused" }  
        API-\>\>DB: UPDATE discipleship\_members SET status='paused', paused\_at=NOW()  
        DB--\>\>API: Updated row  
        API--\>\>Client: 200 OK { status: "paused" }  
    else Member resumes  
        Client-\>\>API: PATCH /discipleship-members/:memberId { status: "active" }  
        API-\>\>DB: UPDATE discipleship\_members SET status='active', resumed\_at=NOW()  
        DB--\>\>API: Updated row  
        API--\>\>Client: 200 OK { status: "active" }  
    end

## **Journey 5 — Applying Somewhere That Isn't Their Home Church**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: POST /discipleship-applications { church\_id, form\_response }  
    API-\>\>API: Compute is\_home\_church (false, in this case)  
    API-\>\>DB: INSERT discipleship\_applications

    alt Submission succeeds  
        DB--\>\>API: Created application row  
        API--\>\>Client: 201 Created { application\_id, is\_home\_church: false }  
        Note over Client: UI shows non-blocking "not your Home Church" note  
    else Duplicate pending application  
        API--\>\>Client: 409 Conflict  
    end

## **Journey 6 — Being Part of Multiple Discipleships (Member)**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /me/discipleships  
    API-\>\>DB: Query active memberships for the authenticated user  
    DB--\>\>API: Membership rows

    alt Exactly one active Discipleship  
        API--\>\>Client: 200 OK { discipleships: \[one\] }  
        Note over Client: UI opens directly into that group's page  
    else More than one active Discipleship  
        API--\>\>Client: 200 OK { discipleships: \[many\] }  
        Note over Client: UI shows "My Discipleships" list  
    end

---

### **🧭 As a Discipler (Leading a Group)**

## **Journey 7 — Running a Discipleship Group Day-to-Day**

### **7a. View group roster**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /discipleship-members?discipleship\_id=:id  
    API-\>\>DB: Query members of the group

    alt Group found  
        DB--\>\>API: Member rows (active / paused)  
        API--\>\>Client: 200 OK { members: \[...\] }  
    else Group not found  
        API--\>\>Client: 404 Not Found  
    end

### **7b. Set up or edit the meeting schedule**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    alt Creating a new schedule  
        Client-\>\>API: POST /discipleship-meetings { discipleship\_id, recurrence\_type, meeting\_time, ... }  
        API-\>\>DB: INSERT discipleship\_meetings  
        DB--\>\>API: Created meeting row  
        API--\>\>Client: 201 Created { meeting\_id }  
    else Editing an existing schedule  
        Client-\>\>API: PATCH /discipleship-meetings/:meetingId { meeting\_time, day\_of\_week, ... }  
        API-\>\>DB: UPDATE discipleship\_meetings

        alt Meeting found  
            DB--\>\>API: Updated row  
            API--\>\>Client: 200 OK { meeting }  
        else Meeting not found  
            API--\>\>Client: 404 Not Found  
        end  
    end

### **7c. Assign or update the group's Journey**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: POST /discipleship-journey-assignments { discipleship\_id, journey\_id }  
    API-\>\>DB: Deactivate previous assignment, INSERT new active assignment

    alt Valid Journey and group  
        DB--\>\>API: New assignment row  
        API--\>\>Client: 201 Created { assignment\_id, journey\_id }  
    else Invalid journey\_id  
        API--\>\>Client: 400 Bad Request  
    end

### **7d. Check the group's Journey progress**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /discipleships/:id/journey-progress  
    API-\>\>DB: Query current Journey assignment and member completion data

    alt Journey assigned and members enrolled  
        DB--\>\>API: Progress data  
        API--\>\>Client: 200 OK { journey\_id, avg\_completion\_percentage, members\_enrolled\_count }  
    else No active Journey assigned  
        API--\>\>Client: 404 Not Found  
    end

### **7e. Remove a member from the group**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: PATCH /discipleship-members/:memberId { status: "removed" }  
    API-\>\>DB: UPDATE discipleship\_members SET status='removed'

    alt Member found in group  
        DB--\>\>API: Updated row  
        API--\>\>Client: 200 OK { status: "removed" }  
    else Member not found  
        API--\>\>Client: 404 Not Found  
    end

## **Journey 8 — Managing Multiple Groups**

### **8a. View "My Groups" list**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /me/discipleships/led  
    API-\>\>DB: Query groups where the authenticated user is leader/co-leader  
    DB--\>\>API: Group rows with member count, next meeting  
    API--\>\>Client: 200 OK { groups: \[...\] }

### **8b. View aggregated personal calendar**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /me/discipleships/led/calendar  
    API-\>\>DB: Query meetings across all groups this user leads

    alt Leads one or more groups  
        DB--\>\>API: Meeting rows  
        API--\>\>Client: 200 OK { meetings: \[...\] }  
    else Leads no groups  
        API--\>\>Client: 200 OK { meetings: \[\] }  
    end

---

## **Part 2: Admin App — Church Admin POV**

## **Journey 9 — Setting Up Discipleship for the Church**

### **9a. Turn the Discipleship module on**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: PATCH /churches/:churchId/modules { discipleship\_enabled: true }  
    API-\>\>DB: UPDATE church module settings

    alt Church found  
        DB--\>\>API: Updated settings  
        API--\>\>Client: 200 OK { discipleship\_enabled: true }  
    else Church not found  
        API--\>\>Client: 404 Not Found  
    end

### **9b. Build the intake/profiling form**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: POST /discipleship-intake-form-templates { church\_id, form\_schema }  
    API-\>\>DB: Deactivate previous template, INSERT new active template

    alt Valid form\_schema  
        DB--\>\>API: Created template row  
        API--\>\>Client: 201 Created { template\_id }  
    else Invalid form\_schema  
        API--\>\>Client: 400 Bad Request  
    end

### **9c. Create or edit a Discipleship group**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    alt Creating a new group  
        Client-\>\>API: POST /discipleships { church\_id, name, description, capacity\_limit }  
        API-\>\>DB: INSERT discipleships  
        DB--\>\>API: Created group row  
        API--\>\>Client: 201 Created { discipleship\_id }  
    else Editing an existing group  
        Client-\>\>API: PATCH /discipleships/:id { name, capacity\_limit, status }  
        API-\>\>DB: UPDATE discipleships

        alt Group found  
            DB--\>\>API: Updated row  
            API--\>\>Client: 200 OK { discipleship }  
        else Group not found  
            API--\>\>Client: 404 Not Found  
        end  
    end

## **Journey 10 — Reviewing Applications & Assigning a Discipler**

### **10a. View queue and application detail**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /discipleship-applications?status=pending\&church\_id=:id  
    API-\>\>DB: Query pending applications for the church  
    DB--\>\>API: Application summaries  
    API--\>\>Client: 200 OK { applications: \[...\] }

    Client-\>\>API: GET /discipleship-applications/:applicationId  
    API-\>\>DB: Query full application detail

    alt Application found  
        DB--\>\>API: Applicant profile, form answers, home\_church flag, already\_active\_elsewhere flag  
        API--\>\>Client: 200 OK { application }  
    else Application not found  
        API--\>\>Client: 404 Not Found  
    end

### **10b. Approve or reject**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    alt Approved  
        opt No existing group has room  
            Client-\>\>API: POST /discipleships { church\_id, name, ... }  
            API-\>\>DB: INSERT discipleships  
            DB--\>\>API: New group row  
            API--\>\>Client: 201 Created { discipleship\_id }  
        end  
        Client-\>\>API: PATCH /discipleship-applications/:id { status: "approved", assigned\_discipleship\_id }  
        API-\>\>DB: UPDATE application, INSERT discipleship\_members  
        DB--\>\>API: Updated application, new member row  
        API--\>\>Client: 200 OK { status: "approved" }  
    else Rejected  
        Client-\>\>API: PATCH /discipleship-applications/:id { status: "rejected", admin\_notes }  
        API-\>\>DB: UPDATE discipleship\_applications  
        DB--\>\>API: Updated application row  
        API--\>\>Client: 200 OK { status: "rejected" }  
    end

## **Journey 11 — Posting a Church-Wide Discussion Question**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: POST /discipleship-discussion-questions { church\_id, question\_text }  
    API-\>\>DB: Archive previous active question, INSERT new active question

    alt Valid question\_text  
        DB--\>\>API: Created question row  
        API--\>\>Client: 201 Created { question\_id }  
    else Empty or invalid question\_text  
        API--\>\>Client: 400 Bad Request  
    end

## **Journey 12 — Handling a Leadership Handoff**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: POST /discipleship-leadership-handoffs { discipleship\_id, outgoing\_user\_id, incoming\_user\_id }  
    API-\>\>DB: Update outgoing role to member, set/insert incoming as leader, INSERT handoff log

    alt Outgoing user is the current leader  
        DB--\>\>API: Updated member roles, handoff record  
        API--\>\>Client: 201 Created { handoff\_id }  
    else Outgoing user is not the current leader  
        API--\>\>Client: 400 Bad Request  
    end

## **Journey 13 — Overseeing Discipleship Church-Wide**

### **13a. Group directory and Discipler load**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /churches/:churchId/discipleship-dashboard  
    API-\>\>DB: Query group directory and per-Discipler load  
    DB--\>\>API: Groups, headcounts, Discipler load data  
    API--\>\>Client: 200 OK { groups: \[...\], discipler\_load: \[...\] }

### **13b. Church-wide calendar**

sequenceDiagram  
    participant Client as Client / Frontend UI  
    participant API as Node.js Express API  
    participant DB as Supabase Database

    Client-\>\>API: GET /churches/:churchId/discipleship-calendar  
    API-\>\>DB: Query meetings across all active groups for the church

    alt Church has active groups  
        DB--\>\>API: Meeting rows with discipleship\_id, discipler\_user\_id  
        API--\>\>Client: 200 OK { meetings: \[...\] }  
    else No active groups  
        API--\>\>Client: 200 OK { meetings: \[\] }  
    end

---

## **Endpoint Reference**

| Method | Path | Used In | Description |
| ----- | ----- | ----- | ----- |
| GET | `/churches/discipleship-programs` | J1a | List churches offering Discipleship, Home Church first |
| GET | `/churches/:churchId/discipleship-program` | J1b | Church's Discipleship program intro |
| GET | `/discipleship-intake-form-templates?church_id=` | J1c | Load a church's active intake form schema |
| POST | `/discipleship-intake-form-templates` | J9b | Create/replace a church's intake form template |
| POST | `/discipleship-applications` | J1d, J5 | Submit an application |
| GET | `/me/discipleship-applications` | J1e | Check the authenticated user's application statuses |
| PATCH | `/discipleship-applications/:id` | J10b | Approve or reject an application |
| GET | `/discipleship-applications?status=pending&church_id=` | J10a | List pending applications for a church |
| GET | `/discipleship-applications/:applicationId` | J10a | Full application detail for review |
| GET | `/me/discipleships/:discipleshipId` | J2 | Active member's group home page (aggregated) |
| GET | `/me/discipleships` | J6 | Authenticated user's active Discipleship memberships |
| PATCH | `/discipleship-members/:memberId` | J3, J4, J7e | Change membership status: `left`, `paused`, `active`, `removed` |
| GET | `/discipleship-members?discipleship_id=` | J7a | Group roster |
| POST | `/discipleship-meetings` | J7b | Create a meeting schedule |
| PATCH | `/discipleship-meetings/:meetingId` | J7b | Edit a meeting schedule |
| POST | `/discipleship-journey-assignments` | J7c | Assign/update a group's current Journey |
| GET | `/discipleships/:id/journey-progress` | J7d | Group's aggregate Journey progress |
| GET | `/me/discipleships/led` | J8a | Discipler's "My Groups" list |
| GET | `/me/discipleships/led/calendar` | J8b | Discipler's aggregated personal calendar |
| PATCH | `/churches/:churchId/modules` | J9a | Toggle the Discipleship module on/off |
| POST | `/discipleships` | J9c, J10b | Create a new Discipleship group |
| PATCH | `/discipleships/:id` | J9c | Edit an existing group's details |
| POST | `/discipleship-discussion-questions` | J11 | Post a new church-wide discussion question |
| POST | `/discipleship-leadership-handoffs` | J12 | Reassign a group's Discipler |
| GET | `/churches/:churchId/discipleship-dashboard` | J13a | Church-wide group directory \+ Discipler load |
| GET | `/churches/:churchId/discipleship-calendar` | J13b | Church-wide meeting calendar |

**26 total endpoints** across **26 diagrams**, covering all 13 finalized journeys. Auth/role-checking middleware is assumed upstream and isn't shown in these diagrams — every endpoint above additionally implies the caller has been authenticated and authorized for the resource/church in question.

