/* =========================================================
   QUEUEEASE FRONTEND
   Backend: Spring Boot
   Base URL: same server
========================================================= */


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadDashboard();

    loadDoctors();

    loadPatients();

    loadHistory();

});


/* =========================================================
   MESSAGE HANDLING
========================================================= */

function showMessage(message, type) {

    const box = document.getElementById("messageBox");

    box.textContent = message;

    box.className = "message " + type;

    setTimeout(function () {

        box.className = "message hidden";

    }, 5000);
}


/* =========================================================
   READ ERROR RESPONSE
========================================================= */

async function getErrorMessage(response) {

    try {

        const text = await response.text();

        if (text) {
            return text;
        }

    } catch (error) {

        console.error(error);

    }

    return "Request failed. Please try again.";
}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

    try {

        const doctorResponse =
            await fetch("/doctors");

        if (!doctorResponse.ok) {
            throw new Error("Unable to load doctors");
        }

        const doctors =
            await doctorResponse.json();


        const patientResponse =
            await fetch("/patients");

        if (!patientResponse.ok) {
            throw new Error("Unable to load patients");
        }

        const patients =
            await patientResponse.json();


        const tokenResponse =
            await fetch("/tokens");

        if (!tokenResponse.ok) {
            throw new Error("Unable to load tokens");
        }

        const tokens =
            await tokenResponse.json();


        document.getElementById("doctorCount").textContent =
            doctors.length;

        document.getElementById("patientCount").textContent =
            patients.length;

        document.getElementById("tokenCount").textContent =
            tokens.length;


        const waitingTokens =
            tokens.filter(function (token) {

                return token.status === "WAITING";

            });


        document.getElementById("waitingCount").textContent =
            waitingTokens.length;


    } catch (error) {

        console.error("Dashboard error:", error);

    }
}


/* =========================================================
   DOCTOR MANAGEMENT
========================================================= */

async function loadDoctors() {

    try {

        const response =
            await fetch("/doctors");

        if (!response.ok) {
            throw new Error("Unable to load doctors");
        }

        const doctors =
            await response.json();


        displayDoctors(doctors);

        populateDoctorDropdowns(doctors);


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to load doctor information.",
            "error"
        );
    }
}


/* =========================================================
   DISPLAY DOCTORS
========================================================= */

function displayDoctors(doctors) {

    const table =
        document.getElementById("doctorTable");

    table.innerHTML = "";


    if (doctors.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    No doctors registered.
                </td>
            </tr>
        `;

        return;
    }


    doctors.forEach(function (doctor) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${doctor.id}</td>

            <td>${escapeHtml(doctor.name)}</td>

            <td>${escapeHtml(doctor.specialization)}</td>

            <td>
                ${doctor.averageConsultationMinutes} minutes
            </td>

            <td>
                ${doctor.currentServingTokenNumber}
            </td>

            <td>

                <button
                    onclick="deleteDoctor(${doctor.id})">

                    Delete

                </button>

            </td>
        `;


        table.appendChild(row);

    });
}


/* =========================================================
   DOCTOR DROPDOWNS
========================================================= */

function populateDoctorDropdowns(doctors) {

    const tokenDoctor =
        document.getElementById("tokenDoctor");

    const queueDoctor =
        document.getElementById("queueDoctor");

    const serveDoctor =
        document.getElementById("serveDoctor");


    tokenDoctor.innerHTML =
        '<option value="">Select Doctor</option>';

    queueDoctor.innerHTML =
        '<option value="">Select Doctor</option>';

    serveDoctor.innerHTML =
        '<option value="">Select Doctor</option>';


    doctors.forEach(function (doctor) {

        const option1 =
            document.createElement("option");

        option1.value = doctor.id;

        option1.textContent =
            doctor.id + " - " +
            doctor.name +
            " (" +
            doctor.specialization +
            ")";


        tokenDoctor.appendChild(option1);


        const option2 =
            option1.cloneNode(true);

        queueDoctor.appendChild(option2);


        const option3 =
            option1.cloneNode(true);

        serveDoctor.appendChild(option3);

    });
}


/* =========================================================
   ADD DOCTOR
========================================================= */

async function addDoctor() {

    const name =
        document.getElementById("doctorName")
            .value.trim();

    const specialization =
        document.getElementById("doctorSpecialization")
            .value.trim();

    const consultationTime =
        document.getElementById("doctorTime")
            .value;


    if (!name ||
        !specialization ||
        !consultationTime) {

        showMessage(
            "Please fill all doctor details.",
            "error"
        );

        return;
    }


    if (Number(consultationTime) <= 0) {

        showMessage(
            "Consultation time must be greater than zero.",
            "error"
        );

        return;
    }


    const doctor = {

        name: name,

        specialization: specialization,

        averageConsultationMinutes:
            Number(consultationTime)

    };


    try {

        const response =
            await fetch("/doctors", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(doctor)

            });


        if (!response.ok) {

            const error =
                await getErrorMessage(response);

            throw new Error(error);

        }


        const savedDoctor =
            await response.json();


        showMessage(
            "Doctor added successfully. Doctor ID: "
            + savedDoctor.id,
            "success"
        );


        document.getElementById("doctorName").value = "";

        document.getElementById(
            "doctorSpecialization"
        ).value = "";

        document.getElementById(
            "doctorTime"
        ).value = "";


        await loadDoctors();

        await loadDashboard();


    } catch (error) {

        showMessage(
            "Unable to add doctor: "
            + error.message,
            "error"
        );
    }
}


/* =========================================================
   DELETE DOCTOR
========================================================= */

async function deleteDoctor(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete Doctor ID "
            + id
            + "?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                "/doctors/" + id,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const error =
                await getErrorMessage(response);

            throw new Error(error);

        }


        showMessage(
            "Doctor deleted successfully.",
            "success"
        );


        await loadDoctors();

        await loadDashboard();


    } catch (error) {

        showMessage(
            "Unable to delete doctor: "
            + error.message,
            "error"
        );
    }
}


/* =========================================================
   PATIENT MANAGEMENT
========================================================= */

async function loadPatients() {

    try {

        const response =
            await fetch("/patients");


        if (!response.ok) {
            throw new Error("Unable to load patients");
        }


        const patients =
            await response.json();


        displayPatients(patients);

        populatePatientDropdown(patients);


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to load patient information.",
            "error"
        );
    }
}


/* =========================================================
   DISPLAY PATIENTS
========================================================= */

function displayPatients(patients) {

    const table =
        document.getElementById("patientTable");

    table.innerHTML = "";


    if (patients.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No patients registered.
                </td>
            </tr>
        `;

        return;
    }


    patients.forEach(function (patient) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${patient.id}</td>

            <td>${escapeHtml(patient.name)}</td>

            <td>${escapeHtml(patient.phone)}</td>

            <td>${escapeHtml(patient.email)}</td>

        `;


        table.appendChild(row);

    });
}


/* =========================================================
   PATIENT DROPDOWN
========================================================= */

function populatePatientDropdown(patients) {

    const select =
        document.getElementById("tokenPatient");


    select.innerHTML =
        '<option value="">Select Patient</option>';


    patients.forEach(function (patient) {

        const option =
            document.createElement("option");


        option.value = patient.id;

        option.textContent =
            patient.id +
            " - " +
            patient.name;


        select.appendChild(option);

    });
}


/* =========================================================
   ADD PATIENT
========================================================= */

async function addPatient() {

    const name =
        document.getElementById("patientName")
            .value.trim();

    const phone =
        document.getElementById("patientPhone")
            .value.trim();

    const email =
        document.getElementById("patientEmail")
            .value.trim();


    if (!name || !phone || !email) {

        showMessage(
            "Please fill all patient details.",
            "error"
        );

        return;
    }


    const patient = {

        name: name,

        phone: phone,

        email: email

    };


    try {

        const response =
            await fetch("/patients", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(patient)

            });


        if (!response.ok) {

            const error =
                await getErrorMessage(response);

            throw new Error(error);

        }


        const savedPatient =
            await response.json();


        showMessage(
            "Patient registered successfully. Patient ID: "
            + savedPatient.id,
            "success"
        );


        document.getElementById("patientName").value = "";

        document.getElementById("patientPhone").value = "";

        document.getElementById("patientEmail").value = "";


        await loadPatients();

        await loadDashboard();


    } catch (error) {

        showMessage(
            "Unable to register patient: "
            + error.message,
            "error"
        );
    }
}


/* =========================================================
   GENERATE TOKEN
========================================================= */

async function generateToken() {

    const doctorId =
        document.getElementById("tokenDoctor")
            .value;

    const patientId =
        document.getElementById("tokenPatient")
            .value;

    const priority =
        document.getElementById("priorityToken")
            .checked;


    if (!doctorId) {

        showMessage(
            "Please select a doctor.",
            "error"
        );

        return;
    }


    if (!patientId) {

        showMessage(
            "Please select a patient.",
            "error"
        );

        return;
    }


    const url =
        "/tokens?doctorId="
        + encodeURIComponent(doctorId)
        + "&patientId="
        + encodeURIComponent(patientId)
        + "&priority="
        + priority;


    try {

        const response =
            await fetch(url, {

                method: "POST"

            });


        if (!response.ok) {

            const error =
                await getErrorMessage(response);

            throw new Error(error);

        }


        const token =
            await response.json();


        showMessage(
            "Token generated successfully. Token Number: "
            + token.tokenNumber
            + ". Estimated waiting time: "
            + token.estimatedWaitMinutes
            + " minutes.",
            "success"
        );


        document.getElementById(
            "tokenDoctor"
        ).value = "";

        document.getElementById(
            "tokenPatient"
        ).value = "";

        document.getElementById(
            "priorityToken"
        ).checked = false;


        await loadDashboard();

        await loadHistory();


    } catch (error) {

        showMessage(
            "Unable to generate token: "
            + error.message,
            "error"
        );
    }
}


/* =========================================================
   LOAD DOCTOR QUEUE
========================================================= */

async function loadQueue() {

    const doctorId =
        document.getElementById("queueDoctor")
            .value;


    const table =
        document.getElementById("queueTable");


    table.innerHTML = "";


    if (!doctorId) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    Select a doctor to view today's queue.
                </td>
            </tr>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                "/tokens/doctor/" + doctorId
            );


        if (!response.ok) {

            const error =
                await getErrorMessage(response);

            throw new Error(error);

        }


        const tokens =
            await response.json();


        displayTokenTable(
            tokens,
            "queueTable"
        );


    } catch (error) {

        showMessage(
            "Unable to load queue: "
            + error.message,
            "error"
        );
    }
}


/* =========================================================
   LOAD DAILY HISTORY
========================================================= */

async function loadHistory() {

    try {

        const response =
            await fetch("/tokens");


        if (!response.ok) {

            const error =
                await getErrorMessage(response);

            throw new Error(error);

        }


        const tokens =
            await response.json();


        displayTokenTable(
            tokens,
            "historyTable"
        );


    } catch (error) {

        showMessage(
            "Unable to load token history: "
            + error.message,
            "error"
        );
    }
}


/* =========================================================
   DISPLAY TOKEN TABLE
========================================================= */

function displayTokenTable(tokens, tableId) {

    const table =
        document.getElementById(tableId);


    table.innerHTML = "";


    if (tokens.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No tokens available for today.
                </td>
            </tr>
        `;

        return;
    }


    tokens.forEach(function (token) {

        const row =
            document.createElement("tr");


        const patientName =
            token.patient
                ? token.patient.name
                : "N/A";


        const doctorName =
            token.doctor
                ? token.doctor.name
                : "N/A";


        const tokenType =
            token.priority
                ? "Emergency / Priority"
                : "Normal";


        row.innerHTML = `

            <td>
                <strong>
                    ${token.tokenNumber}
                </strong>
            </td>

            <td>
                ${escapeHtml(patientName)}
            </td>

            <td>
                ${escapeHtml(doctorName)}
            </td>

            <td>
                ${token.tokenDate}
            </td>

            <td>
                ${tokenType}
            </td>

            <td>
                ${token.status}
            </td>

            <td>
                ${token.estimatedWaitMinutes}
                minutes
            </td>

        `;


        table.appendChild(row);

    });
}


/* =========================================================
   SERVE NEXT TOKEN
========================================================= */

async function serveNextToken() {

    const doctorId =
        document.getElementById("serveDoctor")
            .value;


    if (!doctorId) {

        showMessage(
            "Please select a doctor.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/tokens/serve/" + doctorId,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            const error =
                await getErrorMessage(response);

            throw new Error(error);

        }


        const token =
            await response.json();


        const servedBox =
            document.getElementById("servedToken");


        servedBox.className =
            "served-token";


        servedBox.innerHTML = `

            Now Serving Token
            <strong>
                ${token.tokenNumber}
            </strong>

            -
            ${escapeHtml(
            token.patient
                ? token.patient.name
                : "Patient"
        )}

        `;


        showMessage(
            "Token "
            + token.tokenNumber
            + " has been served successfully.",
            "success"
        );


        await loadDashboard();

        await loadHistory();

        await loadQueue();


    } catch (error) {

        showMessage(
            "Unable to serve next token: "
            + error.message,
            "error"
        );
    }
}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}