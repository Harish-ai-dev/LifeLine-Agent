import time
import logging
logging.basicConfig(level=logging.ERROR)

from lifeline.schemas import Case, Vitals, Location
from lifeline.orchestrator import run_dispatch

case = Case(
    patient_age=45,
    chief_complaint="Severe chest pain and shortness of breath",
    mechanism_of_injury=None,
    vitals=Vitals(
        heart_rate=120,
        respiratory_rate=24,
        systolic_bp=90,
        spo2=92,
        temperature_c=37.5,
        consciousness="alert"
    )
)
loc = Location(lat=19.0522, lng=72.8336)

print("Starting dispatch...")
start = time.time()
res = run_dispatch(case, loc)
end = time.time()

print(f"Total time: {end - start:.2f} seconds")
