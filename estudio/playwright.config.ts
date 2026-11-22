import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./e2e',
  timeout:45000,
  workers:1,
  use:{baseURL:'http://127.0.0.1:4200',launchOptions:{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']},reducedMotion:'reduce'},
  webServer:{command:'pnpm dev',url:'http://127.0.0.1:4200',reuseExistingServer:true,timeout:120000},
  reporter:'list'
});
