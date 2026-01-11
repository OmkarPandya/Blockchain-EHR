Write-Host "Starting Blockchain EHR Services..." -ForegroundColor Green

# 1. Start Hardhat Node
Write-Host "Starting Hardhat Node..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'contracts'; npx hardhat node"

# 2. Start Backend
Write-Host "Starting Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend'; npm start"

# 3. Start Frontend
Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev"

Write-Host "All services started!" -ForegroundColor Green
Write-Host "Hardhat: http://127.0.0.1:8545"
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:5173"
