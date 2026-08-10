# Install dependencies and start the React frontend
Set-Location "$PSScriptRoot\frontend"

Write-Host "Installing npm dependencies..." -ForegroundColor Green
npm install

Write-Host "Starting frontend on http://localhost:5173" -ForegroundColor Green
npm run dev
