# KSHETRA — Presentation Skit & Demonstration Script

### Knowledge-based Humanitarian Emergency & Tactical Resource Allocation

> **"आपत्काले शीघ्रनिर्णयः प्राणान् रक्षति।"**
> *In an emergency, a timely decision can save lives.*

---

## 1. PRESENTATION SKIT & ROLES

### Roles Allocation (5 Members)

| Role | Name / Title | Focus Area |
| :--- | :--- | :--- |
| **Member 1** | **Presenter / Lead** | Opening, Problem Framing, KSHETRA Core Solution, Optimization |
| **Member 2** | **Field Officer / Camera Reporter** | Field Reporting (Camera/Voice/GPS), Pune Emergency Escalation |
| **Member 3** | **Emergency Control Room Chief** | Command Dashboard, AI Fact Separation, Human-in-the-Loop Approval |
| **Member 4** | **Resource Coordinator** | Needs Assessment, Priority Engine ("Why?"), Verification Engine |
| **Member 5** | **Inter-Agency Coordinator** | Duplicate Effort Detection, Multi-Agency Dispatch, Closing |

---

## 2. SKIT DIALOGUE SCRIPT

### [SCENE 1: 2019 Pune Flood Situation Simulation]

**Member 1 — Control Room Presenter**
> *"सगळ्यांचं लक्ष द्या! पुण्यात मुसळधार पावसमामुळे परिस्थिती गंभीर झाली आहे. Sinhagad Road, Sahakarnagar, Dandekar Bridge, Kondhwa आणि Parvati परिसरातून पाण्याचा स्तर वाढल्याच्या सूचना येत आहेत."*

**Member 2 — Field Officer**
> *"सर, Sinhagad Road कडून report आला आहे. काही residential areas मध्ये पाणी शिरलं आहे आणि काही लोक अडकले आहेत. Rescue team ची तातडीने गरज आहे."*

**Member 3 — Control Room Chief**
> *"ठीक आहे. किती लोक अडकले आहेत?"*

**Member 2 — Field Officer**
> *"पहिल्या report मध्ये संख्या कमी सांगितली आहे… पण दुसऱ्या report नुसार परिस्थिती त्यापेक्षा गंभीर आहे."*

**Member 3 — Control Room Chief**
> *"म्हणजे exact information नाही?"*

**Member 2 — Field Officer**
> *"नाही सर. Reports वेगवेगळे आहेत."*

---

**Member 4 — Resource Coordinator**
> *"सर, आपल्याकडे rescue teams, boats, medical kits, drinking water आणि food supplies मर्यादित आहेत."*
> *"आणि एकाच वेळी Kondhwa आणि Sahakarnagar मधूनही मदतीच्या calls येत आहेत."*

**Member 3 — Control Room Chief**
> *"मग आधी कुठे resource पाठवायचा?"*

**Member 4 — Resource Coordinator**
> *"जिथे severity जास्त आहे तिथे पाठवूया."*

**Member 3 — Control Room Chief**
> *"पण severity कशी ठरवणार? जिथे जास्त लोक आहेत? जिथे medical emergency आहे? की जिथे access बंद आहे?"*

*(Pause for emphasis)*

---

**Member 5 — Agency Coordinator**
> *"सर, अजून एक problem आहे. एका agency ने Sinhagad Road साठी rescue support पाठवलं आहे. आणि दुसरी agency देखील त्याच location साठी तेच resource पाठवत आहे."*

**Member 3 — Control Room Chief**
> *"म्हणजे duplicate effort?"*

**Member 5 — Agency Coordinator**
> *"Yes sir. आणि त्याच वेळी दुसऱ्या affected area मध्ये resource shortage आहे."*

---

### [SCENE 2: Situation Escalates]

**Member 2 — Field Officer**
> *"सर! नवीन update! पाण्याची पातळी आणखी वाढली आहे. एक route आता inaccessible झाला आहे. आणि आधी दिलेला allocation plan आता practically कामाचा नाही."*

**Member 3 — Control Room Chief**
> *"म्हणजे आपल्याला पूर्ण plan पुन्हा बदलावा लागेल?"*

**Member 4 — Resource Coordinator**
> *"हो सर. पण कोणता resource कुठून हलवायचा? कुठल्या agency ला redirect करायचं? कुठला route available आहे? आणि नवीन report खरा आहे की चुकीचा—हे कसं verify करायचं?"*

*(All members pause in silence)*

---

## 3. PROBLEM DEFINITION

**Member 1 — Presenter**
> *"ही फक्त एक काल्पनिक situation नाही. 2019 मध्ये पुण्यात झालेल्या अतिवृष्टी आणि पूरस्थितीत अनेक भागांमध्ये flooding, waterlogging, rescue operations आणि evacuation ची गरज निर्माण झाली होती."*
>
> *"पण अशा disaster मध्ये खरी समस्या फक्त ‘पूर आला’ ही नसते."*
>
> ### **The real problem is coordination under uncertainty.**
>
> *"Disaster च्या वेळी Information incomplete असते. Reports conflict करू शकतात. Situation प्रत्येक मिनिटाला बदलू शकते. Resources limited असतात. Multiple agencies एकाच कामावर काम करू शकतात."*
>
> > **"A decision made five minutes ago may become wrong five minutes later."**
>
> *"म्हणून आमचा प्रश्न आहे:"*
>
> ### **"How can we continuously understand the situation, verify the information, prioritize the real needs, allocate limited resources, and dynamically change the response when the situation changes?"**

---

## 4. OUR SOLUTION — KSHETRA

**Member 1**
> *"And this is exactly where our solution comes in:"*

# **KSHETRA**
### Knowledge-based Humanitarian Emergency & Tactical Resource Allocation

> **REPORT → VERIFY → ASSESS → PRIORITIZE → OPTIMIZE → COORDINATE → REALLOCATE**

---

## 5. SYSTEM DEMONSTRATION WORKFLOW

### Step 1: REPORT (Field User Portal)
- **Member 2**: *"KSHETRA provides a unified incident-reporting interface. A field officer or citizen can submit camera evidence, voice audio in Marathi/English, or text with automatic GPS geolocation."*
- **Live Action**: Open `http://localhost:3000/report` -> Demonstrate **Camera Capture**, **Voice Recording in Marathi**, or **Text Report**.

### Step 2: AI INCIDENT UNDERSTANDING & PROVENANCE
- **Member 3**: *"The AI extracts structured facts (hazard type, population at risk, urgency, required resources). Most importantly, KSHETRA strictly separates:"*
  - `[REPORTED FACT]`
  - `[AI INFERENCE]`
  - `[CALCULATED RESULT]`
  - `[OPERATOR-CONFIRMED FACT]`

### Step 3: VERIFICATION CENTER
- **Member 4**: *"If one report says 500 affected and another says 1,200 affected, KSHETRA marks it as `VERIFICATION REQUIRED` instead of blindly guessing. It highlights cross-report contradictions."*
- **Live Action**: Navigate to `http://localhost:3000/` -> **Verification Center** (`/verification`).

### Step 4: NEEDS ASSESSMENT & PRIORITY ENGINE
- **Member 3 & 4**: *"Needs are converted into measurable quantities (Water, Food Kits, NDRF Boats, Medical Field Units). Priority is calculated deterministically across 6 key factors with 'Why?' explainability."*

### Step 5: DUPLICATE-EFFORT DETECTION
- **Member 5**: *"If Agency A and Agency B dispatch identical resources to Sinhagad Road, KSHETRA flags `POSSIBLE DUPLICATE RESPONSE` and suggests `MERGE`, `REDIRECT`, or `DISMISS`."*

### Step 6: OR-TOOLS OPTIMIZATION & DYNAMIC REALLOCATION
- **Member 1 & 2**: *"Google OR-Tools solver maximizes life-saving impact under inventory and capacity constraints. When new field camera evidence arrives from Sinhagad Road, KSHETRA triggers `REASSESS → REPRIORITIZE → RE-OPTIMIZE → REALLOCATE`."*
- **Live Action**: Click **"TRIGGER SINHAGAD RD EMERGENCY"** on top command header. Watch reallocation plan generate live.

### Step 7: HUMAN-IN-THE-LOOP & AUDIT TRAIL
- **Member 3**: *"High-risk actions require authorized human approval. Every decision, inference, and resource movement is recorded with a unique correlation ID in the tamper-evident Audit Log."*

---

## 6. POWERFUL CLOSING

**Member 4**
> *"KSHETRA combines AI-based incident understanding, verification, needs assessment, explainable prioritization, duplicate detection, OR-Tools optimization, inter-agency coordination, dynamic reallocation, and full auditability."*

**Member 5**
> *"In a disaster, every second matters."*

**Member 1**
> *"The biggest challenge is not only having resources. It is knowing WHERE they are needed, HOW MUCH is needed, HOW URGENT it is, and HOW the plan should change when reality changes."*
>
> *"So our vision is simple:"*

# **THE RIGHT RESOURCE.**
# **TO THE RIGHT PLACE.**
# **AT THE RIGHT TIME.**

**All Members Together:**
# **KSHETRA**
### **Understand. Verify. Prioritize. Optimize. Coordinate. Reallocate.**

**Thank you.**
