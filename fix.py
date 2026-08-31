with open('frontend/src/data/mockDashboardData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("facility_id: 'hosp_mumbai_01'", "facility_id: 'hosp-lilavati'")
content = content.replace("facility_id: 'hosp_mumbai_02'", "facility_id: 'hosp-kem'")
content = content.replace("facility_id: 'hosp_mumbai_03'", "facility_id: 'hosp-hinduja'")
content = content.replace("facility_id: 'hosp_mumbai_04'", "facility_id: 'hosp-breach-candy'")
content = content.replace("facility_id: 'hosp_mumbai_11'", "facility_id: 'hosp-sion'")
content = content.replace("facility_id: 'hosp_mumbai_06'", "facility_id: 'hosp-bombay'")

with open('frontend/src/data/mockDashboardData.ts', 'w', encoding='utf-8') as f:
    f.write(content)
