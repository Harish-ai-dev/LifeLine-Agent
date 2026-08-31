import sys

with open('frontend/src/context/DashboardContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """            const db = getFirebaseDb();
            if (db) {
              const userDoc = await getDoc(doc(db, "users", user.uid));
              if (userDoc.exists()) {
                const data = userDoc.data();
                setCurrentUser({
                  id: user.uid,
                  username: data.name || user.email,
                  role: data.role as UserRole,
                  facility_id: data.hospitalId,
                  donor_id: data.role === "blood_donor" ? user.uid : undefined,
                });
                if (data.hospitalId) setActiveHospitalId(data.hospitalId);
              } else {
                console.warn("No user profile found in Firestore. Gracefully mocking role for demo purposes."); const match = DEMO_USERS.find(u => u.username === user.email); const role = match ? match.role : "hospital_staff"; const hosp = match ? match.facility_id : "hosp-lilavati"; setCurrentUser({ id: user.uid, username: user.email || "Demo User", role: role as UserRole, facility_id: hosp }); if(hosp) setActiveHospitalId(hosp);
              }
            }"""

new_block = """            const db = getFirebaseDb();
            if (db) {
              try {
                // Wrap getDoc in a 2-second timeout to prevent infinite hang if Firestore is not provisioned
                const getDocPromise = getDoc(doc(db, "users", user.uid));
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 2000));
                const userDoc = await Promise.race([getDocPromise, timeoutPromise]) as any;
                
                if (userDoc && userDoc.exists()) {
                  const data = userDoc.data();
                  setCurrentUser({
                    id: user.uid,
                    username: data.name || user.email,
                    role: data.role as UserRole,
                    facility_id: data.hospitalId,
                    donor_id: data.role === "blood_donor" ? user.uid : undefined,
                  });
                  if (data.hospitalId) setActiveHospitalId(data.hospitalId);
                } else {
                  throw new Error("No user profile found");
                }
              } catch (err) {
                console.warn("Firestore fetch failed or timed out. Gracefully mocking role.", err);
                const match = DEMO_USERS.find(u => u.username === user.email);
                const role = match ? match.role : "hospital_staff";
                const hosp = match ? match.facility_id : "hosp-lilavati";
                setCurrentUser({ id: user.uid, username: user.email || "Demo User", role: role as UserRole, facility_id: hosp });
                if(hosp) setActiveHospitalId(hosp);
              }
            }"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('frontend/src/context/DashboardContext.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replaced successfully')
else:
    print('Could not find old block')
