const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({channel:'chrome'});
 for (const url of process.argv.slice(2).length ? process.argv.slice(2) : ['http://127.0.0.1:4173']) {
  const results=[];
  for(let i=0;i<3;i++) {
   const context=await browser.newContext({viewport:{width:390,height:844}});
   const page=await context.newPage();
   const client=await context.newCDPSession(page);
   await client.send('Network.enable');
   await client.send('Network.setCacheDisabled',{cacheDisabled:true});
   await client.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
   await client.send('Emulation.setCPUThrottlingRate',{rate:4});
   let bytes=0; client.on('Network.loadingFinished',e=>bytes+=e.encodedDataLength);
   await page.addInitScript(()=>{window.lcp=0;new PerformanceObserver(l=>{window.lcp=l.getEntries().at(-1).startTime}).observe({type:'largest-contentful-paint',buffered:true});window.cls=0;new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.cls+=e.value})).observe({type:'layout-shift',buffered:true});});
   await page.goto(url,{waitUntil:'networkidle'});
   await page.waitForTimeout(1500);
   results.push({...await page.evaluate(()=>({fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,lcp:window.lcp,cls:window.cls})),bytes});
   await context.close();
  }
  console.log(JSON.stringify({url,results}));
 }
 await browser.close();
})();
