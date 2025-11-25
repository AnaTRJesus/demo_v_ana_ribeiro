const { processDBRequest } = require("../../utils");


const getRoleId = async (roleName) => {
    const query = "SELECT id FROM roles WHERE name ILIKE $1";
    const queryParams = [roleName];
    const { rows } = await processDBRequest({ query, queryParams });
    return rows[0]?.id;
};

const findAllStudents = async (payload = {}) => {
    const { name, className, section, roll } = payload;

    let query = `
        SELECT
            t1.id,
            t1.name,
            t1.email,
            t1.last_login AS "lastLogin",
            t1.is_active AS "systemAccess"
        FROM users t1
        LEFT JOIN user_profiles t3 ON t1.id = t3.user_id
        WHERE t1.role_id = 3`;
    const queryParams = [];

    if (name) {
        query += ` AND t1.name = $${queryParams.length + 1}`;
        queryParams.push(name);
    }
    if (className) {
        query += ` AND t3.class_name = $${queryParams.length + 1}`;
        queryParams.push(className);
    }
    if (section) {
        query += ` AND t3.section_name = $${queryParams.length + 1}`;
        queryParams.push(section);
    }
    if (roll) {
        query += ` AND t3.roll = $${queryParams.length + 1}`;
        queryParams.push(roll);
    }

    query += " ORDER BY t1.id";

    const { rows } = await processDBRequest({ query, queryParams });
    return rows;
};


const addOrUpdateStudent = async (payload) => {
    const query = "SELECT * FROM student_add_update($1)";
    const queryParams = [payload];
    const { rows } = await processDBRequest({ query, queryParams });
    return rows[0];
};


const findStudentDetail = async (id) => {
    const query = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.is_active AS "systemAccess",
            p.phone,
            p.gender,
            p.dob,
            p.class_name AS "class",
            p.section_name AS "section",
            p.roll,
            p.father_name AS "fatherName",
            p.father_phone AS "fatherPhone",
            p.mother_name AS "motherName",
            p.mother_phone AS "motherPhone",
            p.guardian_name AS "guardianName",
            p.guardian_phone AS "guardianPhone",
            p.relation_of_guardian as "relationOfGuardian",
            p.current_address AS "currentAddress",
            p.permanent_address AS "permanentAddress",
            p.admission_dt AS "admissionDate",
            r.name as "reporterName"
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        LEFT JOIN users r ON u.reporter_id = r.id
        WHERE u.id = $1
    `;
    const queryParams = [id];
    const { rows } = await processDBRequest({ query, queryParams });
    return rows[0];
};


const findStudentToSetStatus = async ({ userId, reviewerId, status }) => {
    const now = new Date();
    const query = `
        UPDATE users
        SET
            is_active = $1,
            status_last_reviewed_dt = $2,
            status_last_reviewer_id = $3
        WHERE id = $4
    `;
    const queryParams = [status, now, reviewerId, userId];
    const { rowCount } = await processDBRequest({ query, queryParams });
    return rowCount;
};


const ensureClassExists = async (className) => {
    if (!className) return;
    const selectQuery = "SELECT 1 FROM classes WHERE name = $1";
    const { rowCount } = await processDBRequest({
        query: selectQuery,
        queryParams: [className],
    });

    if (rowCount === 0) {
        const insertQuery = "INSERT INTO classes(name) VALUES ($1)";
        await processDBRequest({
            query: insertQuery,
            queryParams: [className],
        });
    }
};

const ensureSectionExists = async (sectionName) => {
    if (!sectionName) return;
    const selectQuery = "SELECT 1 FROM sections WHERE name = $1";
    const { rowCount } = await processDBRequest({
        query: selectQuery,
        queryParams: [sectionName],
    });
    if (rowCount === 0) {
        const insertQuery = "INSERT INTO sections(name) VALUES ($1)";
        await processDBRequest({
            query: insertQuery,
            queryParams: [sectionName],
        });
    }
};

const findStudentToUpdate = async (payload) => {
    const { id, basicDetails = {}, profileDetails = {} } = payload;
    const now = new Date();

    let userResult = null;

    const hasBasic =
        basicDetails &&
        (basicDetails.name !== undefined || basicDetails.email !== undefined);

    if (hasBasic) {
        let userSQL = "UPDATE users SET updated_dt = $1";
        const userParams = [now];
        let idx = 2;

        if (basicDetails.name !== undefined) {
            userSQL += `, name = $${idx++}`;
            userParams.push(basicDetails.name);
        }

        if (basicDetails.email !== undefined) {
            userSQL += `, email = $${idx++}`;
            userParams.push(basicDetails.email);
        }

        userSQL += ` WHERE id = $${idx} RETURNING id;`;
        userParams.push(id);

        const { rows } = await processDBRequest({
            query: userSQL,
            queryParams: userParams,
        });

        if (!rows[0]) {
            return null;
        }

        userResult = rows[0];
    } else {
        const { rows } = await processDBRequest({
            query: "SELECT id FROM users WHERE id = $1",
            queryParams: [id],
        });
        if (!rows[0]) {
            return null;
        }
        userResult = rows[0];
    }

    if (!profileDetails || Object.keys(profileDetails).length === 0) {
        return userResult;
    }

    const normalizedClassName =
        profileDetails.class_name || profileDetails.class;
    const normalizedSectionName =
        profileDetails.section_name || profileDetails.section;

    await ensureClassExists(normalizedClassName);
    await ensureSectionExists(normalizedSectionName);

    await processDBRequest({
        query: `
            INSERT INTO user_profiles (user_id)
            VALUES ($1)
            ON CONFLICT (user_id) DO NOTHING
        `,
        queryParams: [id],
    });

    const normalizedProfile = {
        phone: profileDetails.phone,
        gender: profileDetails.gender,
        dob: profileDetails.dob,
        class_name: normalizedClassName,
        section_name: normalizedSectionName,
        roll: profileDetails.roll,
        father_name: profileDetails.father_name || profileDetails.fatherName,
        father_phone:
            profileDetails.father_phone || profileDetails.fatherPhone,
        mother_name: profileDetails.mother_name || profileDetails.motherName,
        mother_phone:
            profileDetails.mother_phone || profileDetails.motherPhone,
        guardian_name:
            profileDetails.guardian_name || profileDetails.guardianName,
        guardian_phone:
            profileDetails.guardian_phone || profileDetails.guardianPhone,
        relation_of_guardian:
            profileDetails.relation_of_guardian ||
            profileDetails.relationOfGuardian,
        current_address:
            profileDetails.current_address || profileDetails.currentAddress,
        permanent_address:
            profileDetails.permanent_address ||
            profileDetails.permanentAddress,
        admission_dt:
            profileDetails.admission_dt || profileDetails.admissionDate,
    };

    const entries = Object.entries(normalizedProfile).filter(
        ([, v]) => v !== undefined,
    );

    if (entries.length === 0) {
        return userResult;
    }

    const setClause = entries
        .map(([column], idx) => `${column} = $${idx + 1}`)
        .join(", ");
    const values = entries.map(([, value]) => value);

    const profileSQL = `
        UPDATE user_profiles
        SET ${setClause}
        WHERE user_id = $${values.length + 1}
        RETURNING user_id;
    `;

    const { rows: profileRows } = await processDBRequest({
        query: profileSQL,
        queryParams: [...values, id],
    });

    if (!profileRows[0]) {
        return null;
    }

    return userResult;
};


const deleteStudentById = async (id) => {
    await processDBRequest({
        query: `
            DELETE FROM user_profiles
            WHERE user_id = $1
        `,
        queryParams: [id],
    });

    const { rows } = await processDBRequest({
        query: `
            DELETE FROM users
            WHERE id = $1
            RETURNING id;
        `,
        queryParams: [id],
    });

    return rows[0] || null;
};

module.exports = {
    getRoleId,
    findAllStudents,
    addOrUpdateStudent,
    findStudentDetail,
    findStudentToSetStatus,
    findStudentToUpdate,
    deleteStudentById,
};
