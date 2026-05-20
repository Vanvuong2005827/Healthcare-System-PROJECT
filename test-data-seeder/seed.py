import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta


API_BASE_URL = os.getenv("SEEDER_API_BASE_URL", "http://api-gateway:8090").rstrip("/")
DEFAULT_PASSWORD = os.getenv("SEEDER_DEFAULT_PASSWORD", "Test@12345")
ADMIN_EMAIL = os.getenv("SEEDER_ADMIN_EMAIL", "admin.seed@hsm.test")
REQUEST_TIMEOUT = int(os.getenv("SEEDER_REQUEST_TIMEOUT_SECONDS", "10"))
MAX_WAIT_SECONDS = int(os.getenv("SEEDER_MAX_WAIT_SECONDS", "180"))
RETRY_SECONDS = int(os.getenv("SEEDER_RETRY_SECONDS", "5"))


PATIENTS = [
    {
        "email": "patient01.seed@hsm.test",
        "firstName": "An",
        "lastName": "Nguyen",
        "dateOfBirth": "1992-03-14",
        "gender": "Female",
        "bloodGroup": "A_Positive",
        "phoneNumber": "09000000001",
        "address": "12 Nguyen Trai, District 1, Ho Chi Minh City",
    },
    {
        "email": "patient02.seed@hsm.test",
        "firstName": "Binh",
        "lastName": "Tran",
        "dateOfBirth": "1988-07-22",
        "gender": "Male",
        "bloodGroup": "O_Positive",
        "phoneNumber": "09000000002",
        "address": "24 Le Loi, District 3, Ho Chi Minh City",
    },
    {
        "email": "patient03.seed@hsm.test",
        "firstName": "Chi",
        "lastName": "Pham",
        "dateOfBirth": "1995-11-02",
        "gender": "Female",
        "bloodGroup": "B_Positive",
        "phoneNumber": "09000000003",
        "address": "36 Hai Ba Trung, District 1, Ho Chi Minh City",
    },
    {
        "email": "patient04.seed@hsm.test",
        "firstName": "Dung",
        "lastName": "Le",
        "dateOfBirth": "1979-05-18",
        "gender": "Male",
        "bloodGroup": "AB_Positive",
        "phoneNumber": "09000000004",
        "address": "48 Phan Xich Long, Phu Nhuan, Ho Chi Minh City",
    },
    {
        "email": "patient05.seed@hsm.test",
        "firstName": "Em",
        "lastName": "Vo",
        "dateOfBirth": "2000-09-09",
        "gender": "Other",
        "bloodGroup": "O_Negative",
        "phoneNumber": "09000000005",
        "address": "60 Vo Van Tan, District 3, Ho Chi Minh City",
    },
]


DOCTORS = [
    {
        "email": "doctor01.seed@hsm.test",
        "firstName": "Minh",
        "lastName": "Hoang",
        "careerTitle": "Specialist",
        "department": "Cardiology",
        "specialization": "Cardiology",
        "designation": "Consultant",
        "institute": "HSM Clinic",
        "experienceYears": 9,
        "qualifications": "MD, Cardiology",
        "licenseNumber": "VN-MED-90001",
        "dateOfBirth": "1983-04-11",
        "gender": "Male",
        "bloodGroup": "B_Positive",
        "phoneNumber": "09100000001",
        "biography": "Cardiology specialist focused on preventive heart care.",
        "address": "HSM Clinic, Cardiology Department",
        "roomNo": "SEED-101",
    },
    {
        "email": "doctor02.seed@hsm.test",
        "firstName": "Lan",
        "lastName": "Do",
        "careerTitle": "Specialist",
        "department": "Endocrinology",
        "specialization": "Endocrinology",
        "designation": "Consultant",
        "institute": "HSM Clinic",
        "experienceYears": 7,
        "qualifications": "MD, Endocrinology",
        "licenseNumber": "VN-MED-90002",
        "dateOfBirth": "1986-12-05",
        "gender": "Female",
        "bloodGroup": "A_Positive",
        "phoneNumber": "09100000002",
        "biography": "Endocrinology specialist focused on diabetes care.",
        "address": "HSM Clinic, Endocrinology Department",
        "roomNo": "SEED-102",
    },
]


class ApiError(Exception):
    def __init__(self, status, body, path):
        super().__init__(f"{status} from {path}: {body}")
        self.status = status
        self.body = body
        self.path = path


def log(message):
    print(f"[test-data-seeder] {message}", flush=True)


def decode_response(raw):
    if not raw:
        return None
    text = raw.decode("utf-8")
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return text


def request(method, path, payload=None, token=None, expected=(200,), allow=()):
    data = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = token if token.startswith("Bearer ") else f"Bearer {token}"

    req = urllib.request.Request(
        f"{API_BASE_URL}{path}",
        data=data,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
            body = decode_response(response.read())
            if response.status not in expected and response.status not in allow:
                raise ApiError(response.status, body, path)
            return response.status, body
    except urllib.error.HTTPError as error:
        body = decode_response(error.read())
        if error.code in allow:
            return error.code, body
        raise ApiError(error.code, body, path) from error


def is_duplicate_response(status, body):
    if status != 400:
        return False
    message = ""
    if isinstance(body, dict):
        message = str(body.get("message") or body.get("error") or body)
    else:
        message = str(body)
    return "already" in message.lower() or "exists" in message.lower()


def is_truthy_flag(data, *names):
    for name in names:
        if isinstance(data, dict) and name in data:
            return bool(data[name])
    return False


def wait_for_api():
    deadline = time.time() + MAX_WAIT_SECONDS
    last_error = None

    while time.time() < deadline:
        try:
            request("GET", "/users/id/0", expected=(200,), allow=(400, 401, 403, 404))
            log("API gateway and security-service are reachable")
            return
        except Exception as exc:
            last_error = exc
            log(f"waiting for API gateway: {exc}")
            time.sleep(RETRY_SECONDS)

    raise RuntimeError(f"API did not become ready within {MAX_WAIT_SECONDS}s: {last_error}")


def register_user(email, role):
    payload = {
        "email": email,
        "password": DEFAULT_PASSWORD,
        "role": role,
        "isActive": True,
    }
    status, body = request("POST", "/users/register", payload, expected=(201,), allow=(400,))
    if status == 201:
        log(f"created {role.lower()} user {email}")
        return body
    if is_duplicate_response(status, body):
        log(f"{role.lower()} user already exists: {email}")
        return body
    raise ApiError(status, body, "/users/register")


def login(email):
    _, body = request(
        "POST",
        "/users/login",
        {"email": email, "password": DEFAULT_PASSWORD},
        expected=(200,),
    )
    token = body.get("userLoginDetails", {}).get("token") if isinstance(body, dict) else None
    if not token:
        raise RuntimeError(f"login response did not include token for {email}: {body}")
    return token


def encoded(value):
    return urllib.parse.quote(value, safe="")


def get_patient_by_email(email, token):
    status, body = request(
        "GET",
        f"/patients/email/{encoded(email)}",
        token=token,
        expected=(200,),
        allow=(404,),
    )
    return body if status == 200 else None


def get_doctor_by_email(email, token):
    status, body = request(
        "GET",
        f"/doctors/email/{encoded(email)}",
        token=token,
        expected=(200,),
        allow=(404,),
    )
    return body if status == 200 else None


def ensure_patient(patient, admin_token):
    email = patient["email"]
    existing = get_patient_by_email(email, admin_token)

    if existing is None:
        payload = {**patient, "password": DEFAULT_PASSWORD, "isApproved": True, "isActive": True}
        status, body = request("POST", "/patients/register", payload, expected=(201,), allow=(400,))
        if status == 201:
            log(f"created patient profile {email}")
        elif is_duplicate_response(status, body):
            log(f"patient registration already exists: {email}")
        else:
            raise ApiError(status, body, "/patients/register")
        existing = get_patient_by_email(email, admin_token)

    if not existing or "patientId" not in existing:
        raise RuntimeError(f"could not resolve patientId for {email}: {existing}")

    patient_id = existing["patientId"]
    if not is_truthy_flag(existing, "approved", "isApproved"):
        status, body = request(
            "POST",
            f"/patients/approve/{patient_id}",
            token=admin_token,
            expected=(200,),
            allow=(400,),
        )
        if status == 200:
            log(f"approved patient {patient_id}")
        elif is_duplicate_response(status, body):
            log(f"patient already approved: {patient_id}")
        else:
            raise ApiError(status, body, f"/patients/approve/{patient_id}")

    return patient_id


def get_health_records(patient_id, token):
    status, body = request(
        "GET",
        f"/patients/health-records/patient/{encoded(patient_id)}",
        token=token,
        expected=(200,),
        allow=(404,),
    )
    return body if status == 200 and isinstance(body, list) else []


def build_health_record(patient_id, patient_index, record_index):
    checkup_date = date.today() - timedelta(days=(patient_index * 3 + record_index))
    systolic = 112 + patient_index * 4 + record_index % 7
    diastolic = 72 + patient_index * 2 + record_index % 5
    blood_sugar = round(4.9 + patient_index * 0.3 + record_index * 0.08, 1)
    temperature = round(36.4 + (record_index % 5) * 0.15, 1)
    pulse = 68 + patient_index * 2 + record_index % 9

    return {
        "patientId": patient_id,
        "checkupDate": checkup_date.isoformat(),
        "heightInCm": 160 + patient_index * 4,
        "weightInKg": 56 + patient_index * 5 + record_index % 4,
        "bloodPressure": f"{systolic}/{diastolic}",
        "bloodSugar": str(blood_sugar),
        "bodyTemperature": str(temperature),
        "pulseRate": str(pulse),
        "allergies": ["None", "Pollen", "Seafood", "Peanuts", "Dust"][record_index % 5],
        "pastSurgeries": ["None", "Appendectomy", "Tonsillectomy"][record_index % 3],
        "hasDiabetes": patient_index in (1, 3) and record_index % 2 == 0,
        "isHypertensive": systolic >= 130,
        "hasHeartDisease": patient_index == 3 and record_index % 4 == 0,
        "hasKidneyDisease": False,
        "hasLiverDisease": False,
        "hasCancer": False,
        "hasHiv": False,
        "hasTb": False,
        "physicalDisability": "None",
        "vaccineInfo": ["COVID-19", "COVID-19, Flu", "Hepatitis B", "Tetanus"][record_index % 4],
        "isSmoker": patient_index == 1 and record_index % 3 == 0,
        "isAlcoholic": patient_index == 3 and record_index % 5 == 0,
        "isActive": True,
    }


def ensure_health_records(patient_id, patient_index, admin_token):
    existing = get_health_records(patient_id, admin_token)
    if len(existing) >= 10:
        log(f"patient {patient_id} already has {len(existing)} health records")
        return

    for record_index in range(len(existing), 10):
        request(
            "POST",
            "/patients/health-records/create",
            build_health_record(patient_id, patient_index, record_index),
            token=admin_token,
            expected=(201,),
        )
    log(f"created {10 - len(existing)} health records for patient {patient_id}")


def get_rooms(admin_token):
    status, body = request("GET", "/rooms/all", token=admin_token, expected=(200,), allow=(404,))
    return body if status == 200 and isinstance(body, list) else []


def ensure_room(room_no, admin_token):
    rooms = get_rooms(admin_token)
    if any(room.get("roomNo") == room_no for room in rooms if isinstance(room, dict)):
        log(f"room already exists: {room_no}")
        return

    status, body = request(
        "POST",
        "/rooms/create",
        {"roomNo": room_no, "isAvailable": True},
        token=admin_token,
        expected=(201,),
        allow=(400,),
    )
    if status == 201:
        log(f"created room {room_no}")
    elif is_duplicate_response(status, body):
        log(f"room already exists: {room_no}")
    else:
        raise ApiError(status, body, "/rooms/create")


def ensure_doctor(doctor, admin_token):
    email = doctor["email"]
    existing = get_doctor_by_email(email, admin_token)

    if existing is None:
        payload = {
            key: value
            for key, value in doctor.items()
            if key != "roomNo"
        }
        payload.update({"password": DEFAULT_PASSWORD, "isApproved": True, "isActive": True})
        status, body = request("POST", "/doctors/register", payload, expected=(201,), allow=(400,))
        if status == 201:
            log(f"created doctor profile {email}")
        elif is_duplicate_response(status, body):
            log(f"doctor registration already exists: {email}")
        else:
            raise ApiError(status, body, "/doctors/register")
        existing = get_doctor_by_email(email, admin_token)

    if not existing or "doctorId" not in existing:
        raise RuntimeError(f"could not resolve doctorId for {email}: {existing}")

    doctor_id = existing["doctorId"]
    if is_truthy_flag(existing, "approved", "isApproved"):
        log(f"doctor already approved: {doctor_id}")
        return doctor_id

    ensure_room(doctor["roomNo"], admin_token)
    status, body = request(
        "POST",
        f"/doctors/approve/allocate/{doctor_id}/{encoded(doctor['roomNo'])}",
        token=admin_token,
        expected=(200,),
        allow=(400,),
    )
    if status == 200:
        log(f"approved doctor {doctor_id} and allocated room {doctor['roomNo']}")
    elif is_duplicate_response(status, body):
        log(f"doctor already approved: {doctor_id}")
    else:
        raise ApiError(status, body, f"/doctors/approve/allocate/{doctor_id}/{doctor['roomNo']}")
    return doctor_id


def main():
    log(f"using API base URL {API_BASE_URL}")
    wait_for_api()

    register_user(ADMIN_EMAIL, "Admin")
    admin_token = login(ADMIN_EMAIL)
    log(f"admin ready: {ADMIN_EMAIL}")

    for index, patient in enumerate(PATIENTS):
        patient_id = ensure_patient(patient, admin_token)
        ensure_health_records(patient_id, index, admin_token)

    for doctor in DOCTORS:
        ensure_doctor(doctor, admin_token)

    log("seed complete: 1 admin, 5 patients, 50 health records, 2 doctors")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        log(f"seed failed: {exc}")
        sys.exit(1)
