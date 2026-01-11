// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract ImageReport {
    
    mapping(address => bool) public isOwner;
    mapping(address => bool) public isDoctor;
    bool isEditable = true;
    string originalImage;
    string maskedImage;
    string analysis;
    string diagnosis;
    string reportType;
	string signature;
    address[] public doctors;

    struct Comment {
        address doctor;
        string content;
        uint timestamp;
    }
    Comment[] public allComments;

    constructor(
        address _user, 
        address _doctor, 
        string memory _reportType, 
        string memory _originalImage, 
        string memory _maskedImage,
        string memory _diagnosis,
        string memory _analysis,
        string memory _signature
    ) {
        isOwner[_user] = true;
        isOwner[msg.sender] = true; // Allow the backend/deployer to manage the contract
        if (_doctor != address(0)) {
            isOwner[_doctor] = true;
            isDoctor[_doctor] = true;
        }
        originalImage = _originalImage;
        maskedImage = _maskedImage;
        reportType = _reportType;
        diagnosis = _diagnosis;
        analysis = _analysis;
        signature = _signature;

        // If data is provided during initialization, lock the report
        if (bytes(_diagnosis).length > 0 || bytes(_signature).length > 0) {
            isEditable = false;
        }
    }

    function syncDoctors(address[] memory _newDoctors) public onlyOwner {
        // Revoke existing doctors
        for (uint i = 0; i < doctors.length; i++) {
            isOwner[doctors[i]] = false;
            isDoctor[doctors[i]] = false;
        }

        // Grant new doctors
        for (uint i = 0; i < _newDoctors.length; i++) {
            isOwner[_newDoctors[i]] = true;
            isDoctor[_newDoctors[i]] = true;
        }

        // Update tracking array
        doctors = _newDoctors;
    }

    function submitComment(string memory _content) public onlyDoctor {
        allComments.push(Comment({
            doctor: msg.sender,
            content: _content,
            timestamp: block.timestamp
        }));
    }

    modifier onlyOwner {
        require(isOwner[msg.sender], "Only the owner can perform this action");
        _;
    }

    modifier onlyDoctor {
        require(isDoctor[msg.sender], "Only the doctor can perform this action");
        _;
    }

    function addOwner(address _owner) public onlyOwner {
        isOwner[_owner] = true;
    }

    function addDoctor(address _doctor) public onlyOwner {
        isOwner[_doctor] = true;
        isDoctor[_doctor] = true;
    }

    function addDoctors(address[] memory _doctors) public onlyOwner {
        for (uint i = 0; i < _doctors.length; i++) {
            isOwner[_doctors[i]] = true;
            isDoctor[_doctors[i]] = true;
        }
    }

    function setData(string memory _analysis, string memory _diagnosis, string memory _signature) public onlyOwner onlyDoctor {
        require(isEditable, "The report is no longer editable");
        analysis = _analysis;
        diagnosis = _diagnosis;
		signature = _signature;
        isEditable = false;
    }

    function getAnalysis() public view onlyOwner returns (string memory) {
        return analysis;
    }

    function getDiagnosis() public view onlyOwner returns (string memory) {
        return diagnosis;
    }

    function getOriginalImage() public view onlyOwner returns (string memory) {
        return originalImage;
    }

    function getMaskedImage() public view onlyOwner returns (string memory) {
        return maskedImage;
    }

	function getReportType() public view onlyOwner returns (string memory) {
		return reportType;
	}

	function getSignature() public view onlyOwner returns (string memory) {
		return signature;
	}

}