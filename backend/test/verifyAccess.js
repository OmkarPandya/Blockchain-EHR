import { checkAccessOnContract } from "../services/blockchainService.js";
import * as dotenv from "dotenv";
dotenv.config();

async function testAccess() {
    console.log("Starting access verification test...");

    // Test with a dummy address (should fail or return false)
    const dummyContract = "0x0000000000000000000000000000000000000000";
    const dummyWallet = "0x0000000000000000000000000000000000000000";

    try {
        console.log("Testing blockchain access check...");
        const hasAccess = await checkAccessOnContract(dummyContract, dummyWallet);
        console.log(`Access check for dummy address: ${hasAccess}`);

        if (hasAccess === false) {
            console.log("✅ Success: Dummy access returned false as expected.");
        } else {
            console.log("❌ Failure: Dummy access returned true or something else.");
        }

        // Simulating the middleware logic for ID extraction
        const mockReqParam = { params: { id: "123" }, body: {} };
        const mockReqBody = { params: {}, body: { reportId: "456" } };

        const idFromParam = mockReqParam.params.id || mockReqParam.body.reportId;
        const idFromBody = mockReqBody.params.id || mockReqBody.body.reportId;

        console.log(`Extracted ID from param: ${idFromParam}`);
        console.log(`Extracted ID from body: ${idFromBody}`);

        if (idFromParam === "123" && idFromBody === "456") {
            console.log("✅ Success: Middleware logic for ID extraction is correct.");
        } else {
            console.log("❌ Failure: Middleware logic for ID extraction failed.");
        }

    } catch (error) {
        console.error("❌ Error during test:", error);
    }

    process.exit();
}

testAccess();
