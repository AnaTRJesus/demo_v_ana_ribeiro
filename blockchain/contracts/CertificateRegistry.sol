// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    struct Certificate {
        uint256 studentId;
        string ipfsCid;
        address issuer;
        uint256 issuedAt;
        bool revoked;
    }

    uint256 public lastCertificateId;
    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => uint256[]) private studentCertificates;

    address public admin;

    event CertificateIssued(
        uint256 indexed certId,
        uint256 indexed studentId,
        string ipfsCid,
        address indexed issuer
    );

    event CertificateRevoked(
        uint256 indexed certId,
        uint256 indexed studentId
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function updateAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Zero address");
        admin = newAdmin;
    }

    function issueCertificate(
        uint256 studentId,
        string calldata ipfsCid
    ) external onlyAdmin returns (uint256) {
        require(studentId > 0, "Invalid student");
        require(bytes(ipfsCid).length > 0, "Invalid CID");

        lastCertificateId += 1;
        uint256 certId = lastCertificateId;

        certificates[certId] = Certificate({
            studentId: studentId,
            ipfsCid: ipfsCid,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false
        });

        studentCertificates[studentId].push(certId);

        emit CertificateIssued(certId, studentId, ipfsCid, msg.sender);
        return certId;
    }

    function revokeCertificate(uint256 certId) external onlyAdmin {
        Certificate storage cert = certificates[certId];
        require(cert.issuedAt != 0, "Certificate not found");
        require(!cert.revoked, "Already revoked");

        cert.revoked = true;
        emit CertificateRevoked(certId, cert.studentId);
    }

    function getStudentCertificates(
        uint256 studentId
    ) external view returns (uint256[] memory) {
        return studentCertificates[studentId];
    }

    function verifyCertificate(
        uint256 certId,
        uint256 studentId,
        string calldata ipfsCid
    ) external view returns (bool) {
        Certificate memory cert = certificates[certId];
        if (cert.issuedAt == 0 || cert.revoked) return false;
        if (cert.studentId != studentId) return false;
        if (keccak256(bytes(cert.ipfsCid)) != keccak256(bytes(ipfsCid))) {
            return false;
        }
        return true;
    }
}
