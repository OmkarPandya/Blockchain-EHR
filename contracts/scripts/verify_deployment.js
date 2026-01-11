const hre = require("hardhat");

async function main() {
    console.log("Starting verification...");

    // Get the ContractFactory
    const ImageReport = await hre.ethers.getContractFactory("ImageReport");

    // Define test data
    const user = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // default hardhat account 0
    const doctor = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // default hardhat account 1
    const reportType = "Brain Tumor Report";
    const originalImage = "QmOriginalHash";
    const maskedImage = "QmMaskedHash";
    const diagnosis = "Positive";
    const analysis = "Detailed analysis text";
    const signature = "DoctorSignature";

    console.log("Deploying ImageReport with args:", {
        user, doctor, reportType, originalImage, maskedImage, diagnosis, analysis, signature
    });

    // Deploy
    const report = await ImageReport.deploy(
        user,
        doctor,
        reportType,
        originalImage,
        maskedImage,
        diagnosis,
        analysis,
        signature
    );

    await report.deployed();

    console.log("ImageReport deployed to:", report.address);

    // Verify fields
    const savedDiagnosis = await report.getDiagnosis();
    const savedAnalysis = await report.getAnalysis();
    const savedSignature = await report.getSignature();

    console.log("Diagnosis:", savedDiagnosis);
    console.log("Analysis:", savedAnalysis);
    console.log("Signature:", savedSignature);

    if (savedDiagnosis !== diagnosis) throw new Error("Diagnosis mismatch");
    if (savedAnalysis !== analysis) throw new Error("Analysis mismatch");
    if (savedSignature !== signature) throw new Error("Signature mismatch");

    // Check locking
    // We can't access public var 'isEditable' directly if it's not public getter? 
    // It was declared `bool isEditable = true;` without public. 
    // But `setData` should fail.

    // Note: ImageReport.sol defined `bool isEditable = true;` - default visibility is internal.
    // We can try calling setData and expect revert.

    try {
        await report.setData("New Analysis", "New Diagnosis", "New Sig");
        console.error("❌ Error: setData should have reverted!");
        process.exit(1);
    } catch (e) {
        console.log("✅ Verified: setData reverted as expected (Report is locked).");
    }

    console.log("Verification Successful!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
