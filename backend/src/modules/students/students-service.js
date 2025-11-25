const { ApiError } = require("../../utils");
const {
    findAllStudents,
    findStudentDetail,
    addOrUpdateStudent,
    findStudentToSetStatus,
    findStudentToUpdate,
    deleteStudentById
} = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const checkStudentId = async (id) => {
    const exists = await findUserById(id);
    if (!exists) throw new ApiError(404, "Student not found");
};

const getAllStudents = async (payload) => {
    const students = await findAllStudents(payload);
    return { students };
};

const getStudentDetail = async (id) => {
    await checkStudentId(id);
    return await findStudentDetail(id);
};

const addNewStudent = async (payload) => {
    const result = await addOrUpdateStudent(payload);

    if (!result.status) {
        throw new ApiError(500, result.message);
    }

    return { message: "Student added successfully" };
};

const updateStudent = async (payload) => {
    const result = await findStudentToUpdate(payload);

    if (result === null) {
        throw new ApiError(500, "Failed to update student details");
    }

    return { message: "Student updated successfully" };
};

const setStudentStatus = async ({ userId, reviewerId, status }) => {
    await checkStudentId(userId);

    const affected = await findStudentToSetStatus({ userId, reviewerId, status });

    if (affected <= 0) {
        throw new ApiError(500, "Unable to change student status");
    }

    return { message: "Student status changed successfully" };
};

const deleteStudent = async (id) => {
    await checkStudentId(id);

    const deleted = await deleteStudentById(id);

    if (!deleted) throw new ApiError(500, "Unable to delete student");

    return { message: "Student deleted successfully" };
};

module.exports = {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    updateStudent,
    setStudentStatus,
    deleteStudent
};
