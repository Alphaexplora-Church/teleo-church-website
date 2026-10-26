# **Discipleship Feature — User Journeys (Mermaid Sequence Diagrams)**

Each journey below is a standalone diagram. Actors are limited to the personas actually involved in that journey, plus `Platform` as the single black-box system actor.

---

## **Part 1: Regular App — Member & Discipler POV**

> Both personas below use the **same app**. Journeys 1–6 are the Member view; Journeys 7–8 are the Discipler view, entered via a **"Groups I Lead"** switch in the same Discipleship tab (visible only to users who lead at least one group).

### **🧑 As a Member (Disciple)**

### **Journey 1 — Discovering & Applying to a Discipleship**

sequenceDiagram  
    actor Member as Member (Disciple)  
    participant Platform  
    actor Admin as Church Admin

    Member-\>\>Platform: Opens Discipleship tab  
    Platform--\>\>Member: Shows "You're not part of a Discipleship yet"  
    Member-\>\>Platform: Taps "Join a Discipleship"  
    Platform--\>\>Member: Shows list of churches (Home Church recommended first)  
    Member-\>\>Platform: Selects a church  
    Platform--\>\>Member: Shows church's Discipleship intro

    opt Selected church isn't Member's Home Church  
        Platform--\>\>Member: Shows soft note recommending Home Church, allows proceeding  
    end

    Member-\>\>Platform: Taps "Apply / Request to Join"  
    Platform--\>\>Member: Shows profiling form with privacy disclaimer  
    Member-\>\>Platform: Fills out and submits form  
    Platform--\>\>Member: Shows confirmation and expected review timing  
    Platform--\>\>Admin: Notifies of new pending application  
    Member-\>\>Platform: Checks status anytime under "My Applications"

    alt Approved  
        Platform--\>\>Member: Shows welcome screen with assigned Discipler and group  
    else Rejected  
        Platform--\>\>Member: Shows polite decline, optionally with a note  
        Member-\>\>Platform: May apply again, same or different church  
    end

### **Journey 2 — Being an Active Member of a Discipleship**

sequenceDiagram  
    actor Member as Member (Disciple)  
    actor Discipler  
    participant Platform

    Member-\>\>Platform: Opens group's home page  
    Platform--\>\>Member: Shows group name, Discipler, and fellow members  
    Platform--\>\>Member: Shows upcoming meeting (date, time, location or link)  
    Platform--\>\>Member: Sends reminder the day before the meeting  
    Member-\>\>Platform: Views this week's discussion question  
    Member-\>\>Platform: Views the Journey series the group is going through  
    Member-\>\>Platform: Works through the Journey at their own pace  
    Member-\>\>Platform: Writes private notes during Journey content or a meeting

    opt Member can't make the plotted meeting time  
        Member-\>\>Discipler: Reaches out directly (outside the app) about being unavailable, or to suggest another time  
        Discipler-\>\>Platform: Edits the meeting schedule if needed  
        Platform--\>\>Member: Group page reflects the updated schedule  
    end

### **Journey 3 — Leaving a Discipleship (Permanently)**

sequenceDiagram  
    actor Member as Member (Disciple)  
    participant Platform

    Member-\>\>Platform: Opens group page  
    Member-\>\>Platform: Taps "Leave Discipleship"  
    Platform--\>\>Member: Shows confirmation prompt (loses access to this group)  
    Member-\>\>Platform: Confirms  
    Platform--\>\>Member: Returns to "Join a Discipleship" empty state  
    Member-\>\>Platform: May apply again later, same or different church

### **Journey 4 — Pausing Membership (Temporary)**

sequenceDiagram  
    actor Member as Member (Disciple)  
    actor Discipler  
    participant Platform

    Member-\>\>Platform: Opens group page  
    Member-\>\>Platform: Taps "Pause Membership"  
    Platform--\>\>Member: Explains they'll stay a member but won't be expected at meetings  
    Member-\>\>Platform: Confirms  
    Platform--\>\>Member: Shows "Paused" status on group page  
    Platform--\>\>Discipler: Notifies Discipler of the pause  
    Platform--\>\>Member: Stops sending meeting reminders

    opt Member checks in while paused  
        Member-\>\>Platform: Views group updates (discussion question, Journey)  
    end

    Member-\>\>Platform: Taps "Resume" whenever ready  
    Platform--\>\>Member: Returns to active status, no re-application needed

### **Journey 5 — Applying Somewhere That Isn't Their Home Church**

sequenceDiagram  
    actor Member as Member (Disciple)  
    participant Platform

    Member-\>\>Platform: Browses churches and selects one that isn't their Home Church  
    Platform--\>\>Member: Shows soft note — Home Church is recommended, but proceeding is allowed  
    Member-\>\>Platform: Proceeds with the application exactly as normal

### **Journey 6 — Being Part of Multiple Discipleships (Member)**

sequenceDiagram  
    actor Member as Member (Disciple)  
    participant Platform

    Member-\>\>Platform: Opens Discipleship tab

    alt Active in only one Discipleship  
        Platform--\>\>Member: Opens directly into that group's page  
    else Active in more than one Discipleship  
        Platform--\>\>Member: Shows "My Discipleships" list (group, church, Discipler, next meeting)  
        Member-\>\>Platform: Taps a group  
        Platform--\>\>Member: Opens that group's page, independent of the others  
    end

    Platform--\>\>Member: Sends meeting reminders naming the specific group

---

### **🧭 As a Discipler (Leading a Group)**

### **Journey 7 — Running a Discipleship Group Day-to-Day**

sequenceDiagram  
    actor Discipler  
    actor Member as Member (Disciple)  
    participant Platform

    Discipler-\>\>Platform: Opens Discipleship tab, switches to "Groups I Lead"  
    Discipler-\>\>Platform: Views group roster (members, since when, who's paused)  
    Discipler-\>\>Platform: Sets up recurring meeting schedule (day, time, location or link)  
    Discipler-\>\>Platform: Edits the schedule as needed

    opt Member flagged unavailability or proposed a new time  
        Member-\>\>Discipler: Reaches out directly (outside the app) about the conflict  
        Discipler-\>\>Platform: Updates the meeting schedule  
    end

    Discipler-\>\>Platform: Assigns or updates the group's current Journey  
    Discipler-\>\>Platform: Checks in on the group's progress through the Journey

    opt A member needs to be removed  
        Discipler-\>\>Platform: Removes the member from the group  
    end

### **Journey 8 — Managing Multiple Groups**

sequenceDiagram  
    actor Discipler  
    participant Platform

    Discipler-\>\>Platform: Opens Discipleship tab, switches to "Groups I Lead"  
    Platform--\>\>Discipler: Shows "My Groups" list (name, member count, next meeting)  
    Discipler-\>\>Platform: Taps into a group to manage it  
    Discipler-\>\>Platform: Views personal calendar aggregating meetings across all groups  
    Discipler-\>\>Platform: Taps a meeting on the calendar  
    Platform--\>\>Discipler: Jumps straight into that group's page

---

## **Part 2: Admin App — Church Admin POV**

Everything below is a genuine church-wide administrative action and lives in the **Admin app**, separate from where Members and Disciplers operate.

### **Journey 9 — Setting Up Discipleship for the Church**

sequenceDiagram  
    actor Admin as Church Admin  
    participant Platform

    Admin-\>\>Platform: Turns the Discipleship module on for the church  
    Admin-\>\>Platform: Builds the profiling/intake form  
    Admin-\>\>Platform: Creates one or more Discipleship groups (name, description, capacity)  
    Admin-\>\>Platform: Assigns a Discipler to lead each group

    opt Group details change later  
        Admin-\>\>Platform: Edits group details (rename, change capacity, deactivate)  
    end

### **Journey 10 — Reviewing Applications & Assigning a Discipler**

sequenceDiagram  
    actor Admin as Church Admin  
    actor Member as Member (Disciple)  
    actor Discipler  
    participant Platform

    Platform--\>\>Admin: Shows queue of pending applications  
    Admin-\>\>Platform: Opens an application  
    Platform--\>\>Admin: Shows applicant profile, form answers, and Home Church flag  
    Platform--\>\>Admin: Shows "already active elsewhere" flag if applicable (info only)

    alt Approved  
        Admin-\>\>Platform: Reviews existing groups (headcount vs capacity)  
        opt No existing group has room  
            Admin-\>\>Platform: Creates a new Discipleship group  
            Admin-\>\>Platform: Assigns a Discipler to lead it  
        end  
        Admin-\>\>Platform: Picks a group and places the applicant  
        Platform--\>\>Member: Notifies "Approved" with assigned Discipler and group  
        Platform--\>\>Discipler: Notifies of new member added  
    else Rejected  
        Admin-\>\>Platform: Rejects, optionally with a short note  
        Platform--\>\>Member: Notifies "Rejected" with the note  
        Member-\>\>Platform: May apply again later  
    end

### **Journey 11 — Posting a Church-Wide Discussion Question**

sequenceDiagram  
    actor Admin as Church Admin  
    actor Discipler  
    actor Member as Member (Disciple)  
    participant Platform

    Admin-\>\>Platform: Opens the Discipleship admin area  
    Admin-\>\>Platform: Writes and posts a discussion question  
    Platform--\>\>Discipler: Automatically appears on the group's page  
    Platform--\>\>Member: Sees the discussion question on the group page

    opt Admin wants to change it  
        Admin-\>\>Platform: Retires the current question and posts a new one  
    end

### **Journey 12 — Handling a Leadership Handoff**

sequenceDiagram  
    actor Admin as Church Admin  
    actor OldDiscipler as Outgoing Discipler  
    actor NewDiscipler as Incoming Discipler  
    actor Member as Member (Disciple)  
    participant Platform

    Admin-\>\>Platform: Opens the group and selects "Reassign Discipler"  
    Admin-\>\>Platform: Picks a new Discipler from eligible users  
    Admin-\>\>Platform: Confirms the reassignment  
    Note over Platform: Members, meeting schedule, discussion history,\<br/\>and current Journey all stay unchanged  
    Platform--\>\>OldDiscipler: Notifies of the handoff  
    Platform--\>\>NewDiscipler: Notifies of the new assignment  
    Platform--\>\>Member: Shows the group's new Discipler name

### **Journey 13 — Overseeing Discipleship Church-Wide**

sequenceDiagram  
    actor Admin as Church Admin  
    actor Discipler  
    participant Plat	form

    Admin-\>\>Platform: Opens the church-wide Group Directory  
    Platform--\>\>Admin: Shows every active group, its Discipler, headcount vs capacity, next meeting  
    Platform--\>\>Admin: Shows a simple load indicator per Discipler  
    Admin-\>\>Platform: Opens the church-wide calendar view  
    Platform--\>\>Admin: Shows every group's meetings, color-coded by group or Discipler

    opt Admin spots a scheduling overlap  
        Admin-\>\>Discipler: Follows up directly to resolve it  
    end

