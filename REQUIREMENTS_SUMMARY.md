# Requirements Summary - Medora Doctor Portal Updates

## 1. Authentication & Login
- **Doctor Login**: Email ID, Password, Organization (Org) field required
- Login should authenticate doctor and set organization context

## 2. Navigation & Header Updates
- **Remove "Home"** from navigation (LandingPage is the home/landing page)
- **Remove "Analytics"** from navigation (doctors don't need it)
- **Search Bar**: Remove "Search here" placeholder text, use cleaner placeholder
- **Keep**: Patients, Settings navigation items

## 3. Notifications System
- **One-way notifications** from hospital to doctor
- **Notification Types**:
  - Incoming Patient Alert
  - Today's Activities/Schedule
- **Each notification should have**:
  - Icon (visual indicator)
  - One-liner (brief summary)
  - Content (detailed information)
- Notification bell should show unread count

## 4. SOAP Note Tagging
- Every SOAP note must be **tagged to**:
  - Pet (patient)
  - Doctor who consulted

## 5. Enhanced Search Functionality
- **Search Keywords**: Patient, Disease, Medicines, Diagnosis, and other relevant keywords
- **Exhaustive keyword coverage** with relevant icons for visual differentiation
- **Search Result Types**:

  **Patient Search**:
  - Returns patient profile
  
  **Medicine Search**:
  - Short summary: When medicine was consulted, what's the use (from hospital medical records)
  - Followed by SOAP notes where medicine was given (ordered by recency)
  
  **Lab Test Search**:
  - Short summary: When lab test was consulted, what's the use (from hospital medical records)
  - Followed by SOAP notes where lab test was given (ordered by recency)
  
  **Other Keywords**:
  - Similar pattern for diseases, diagnoses, etc.

## 6. Start Consultation with New Patient
- **Button**: "Start Consultation with new patient"
- **Functionality**:
  - Ask doctor to add very basic patient details
  - Record SOAP note
  - Once done, send to hospital admin to:
    - Create new patient OR
    - Tag to existing patient
- **Info Icon**: Add clear info icon to mention capability of this CTA

## 7. Today's Patients Section
- **Tabs**:
  - **Upcoming**: Patients scheduled for today
  - **Completed**: Patients already seen today
- Display patient cards in respective tabs

## 8. Upcoming Patients
- **Categories**:
  - **New case**: First-time patients
  - **Follow up**: Returning patients

## 9. All Patients
- **Filter**: Show only patients who have consulted with the current doctor
- **Search Bar**: Include search functionality within this section

## 10. Patient Card (Cue Card) Updates
- **Display Fields**:
  - Name
  - Owner name
  - Age
  - Animal (species)
  - Gender
  - Last visit: Date and consulted doctor name
- **Remove**: "Active" status badge

## 11. Consultation Page (Patient Template) Updates

### Top Navigation Bar
- Display: **Pet name** and **Pet owner name** and **contact details**

### Left Sidebar - Pet Profile
- **Required basic details** about the pet
- **Allergies** section
- **Vaccination profile** section
- **Click to open** (expandable/collapsible sections)

### Middle Section - Landing Page
- **Default view = Clinical History**
- **Short summary** of case histories (section-wise read - good to have)
- Followed by **SOAP notes** (as currently shown)
- **Remove**: Case status everywhere (becomes a whole other feature)

### Audio Upload
- Make it **cleaner** (improve UI/UX)

### SOAP Note Section
- **Same functionality** as current
- **Enable Preview and Export** only after recording is done
- **Remove**: "Live transcript" label
- **Add**: "Running transcript" - just to ensure doctor is aware things are being recorded (not live editing, just awareness)

### Plan Section Enhancement
- For meds or anything prescribed, show **insights**:
  - "Has been suggested in X cases for the following disease..."
  - Adds layer of trust to the doctor
  - Shows historical usage patterns

---

## Implementation Priority
1. Authentication & Login (foundation)
2. Navigation updates (quick wins)
3. Patient card updates
4. Search functionality enhancements
5. Notifications system
6. Consultation page updates
7. SOAP note tagging
8. New patient consultation flow

---

## Questions for Clarification
1. **Login Flow**: Should login redirect to `/dashboard` (DoctorHome) after successful authentication?
2. **Organization Selection**: Should org be a dropdown of available organizations, or free text input?
3. **Notification Storage**: Where should notifications be stored? (Database, API, mock data for now?)
4. **Search Icons**: Do you have specific icon preferences for different search result types?
5. **Pet Profile Details**: What are the "required basic details" for pet profile? (Species, Breed, Age, Gender, Weight, etc.?)
6. **New Patient Flow**: Should the basic patient details form be a modal or a separate page?
7. **SOAP Note Export**: What format should export support? (PDF, DOCX, etc.?)

---

**Status**: Ready for discussion and next steps implementation
