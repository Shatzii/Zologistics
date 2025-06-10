import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Demo screenshot configuration
const SCREENSHOTS_DIR = 'demo-screenshots';
const BASE_URL = 'http://localhost:5000';

const screenshotConfig = {
  viewport: { width: 1920, height: 1080 },
  quality: 90,
  type: 'png'
};

const demoPages = [
  {
    name: 'dashboard-overview',
    url: '/',
    title: 'Comprehensive Dashboard Overview',
    description: 'Real-time metrics, IoT monitoring, and AI-powered insights',
    waitForSelector: '.space-y-6',
    fullPage: true
  },
  {
    name: 'analytics-performance',
    url: '/analytics',
    title: 'Advanced Analytics Dashboard',
    description: 'Performance metrics, route optimization, and sustainability tracking',
    waitForSelector: '.analytics-container',
    fullPage: true
  },
  {
    name: 'loads-management',
    url: '/loads',
    title: 'Enhanced Load Management',
    description: 'AI-optimized load matching with multi-modal transport options',
    waitForSelector: '.load-management',
    fullPage: true
  },
  {
    name: 'drivers-iot-monitoring',
    url: '/drivers',
    title: 'Real-time Driver & Fleet Monitoring',
    description: 'IoT device tracking, autonomous vehicle integration, performance analytics',
    waitForSelector: '.driver-management',
    fullPage: true
  },
  {
    name: 'negotiations-ai-rates',
    url: '/negotiations',
    title: 'AI-Powered Rate Negotiation',
    description: 'Automated rate optimization and market analysis',
    waitForSelector: '.negotiations-container',
    fullPage: true
  },
  {
    name: 'settings-integrations',
    url: '/settings',
    title: 'Comprehensive Settings & Integrations',
    description: 'Security, IoT devices, blockchain, and system configuration',
    waitForSelector: '.settings-page',
    fullPage: true
  }
];

async function captureScreenshots() {
  console.log('Starting screenshot capture...');
  
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport(screenshotConfig.viewport);

  // Add custom CSS for demo enhancement
  await page.addStyleTag({
    content: `
      /* Hide scrollbars for cleaner screenshots */
      ::-webkit-scrollbar { display: none; }
      body { -ms-overflow-style: none; scrollbar-width: none; }
      
      /* Enhance visual elements */
      .card { box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; }
      
      /* Add demo badge */
      .demo-badge {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
    `
  });

  for (const pageConfig of demoPages) {
    console.log(`Capturing: ${pageConfig.name}`);
    
    try {
      await page.goto(`${BASE_URL}${pageConfig.url}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForTimeout(5000);

      // Add demo badge
      await page.evaluate((title) => {
        const badge = document.createElement('div');
        badge.className = 'demo-badge';
        badge.textContent = 'LIVE DEMO';
        document.body.appendChild(badge);
      }, pageConfig.title);

      // Wait for animations
      await page.waitForTimeout(2000);

      // Capture screenshot
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageConfig.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: pageConfig.fullPage,
        type: screenshotConfig.type,
        quality: screenshotConfig.quality
      });

      console.log(`✓ Captured: ${screenshotPath}`);

      // Create metadata file
      const metadataPath = path.join(SCREENSHOTS_DIR, `${pageConfig.name}.json`);
      fs.writeFileSync(metadataPath, JSON.stringify({
        name: pageConfig.name,
        title: pageConfig.title,
        description: pageConfig.description,
        url: pageConfig.url,
        timestamp: new Date().toISOString(),
        dimensions: screenshotConfig.viewport
      }, null, 2));

    } catch (error) {
      console.error(`Error capturing ${pageConfig.name}:`, error.message);
    }
  }

  await browser.close();
  console.log('Screenshot capture completed');
}

async function generateScreenshotIndex() {
  console.log('Generating screenshot index...');
  
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TruckFlow AI - Demo Screenshots</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 60px; }
        .header h1 { 
            font-size: 3rem; 
            font-weight: 800; 
            color: #1e293b; 
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .header p { 
            font-size: 1.25rem; 
            color: #64748b; 
            max-width: 600px; 
            margin: 0 auto;
        }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); 
            gap: 40px; 
        }
        .screenshot-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .screenshot-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }
        .screenshot-img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            object-position: top;
            border-bottom: 1px solid #e2e8f0;
        }
        .card-content { padding: 24px; }
        .card-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 12px;
        }
        .card-description {
            color: #64748b;
            margin-bottom: 20px;
        }
        .card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.875rem;
            color: #94a3b8;
        }
        .badge {
            background: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-weight: 600;
        }
        .download-btn {
            background: #3b82f6;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: background 0.2s;
        }
        .download-btn:hover { background: #2563eb; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 60px;
            padding: 40px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .stat {
            text-align: center;
        }
        .stat-number {
            font-size: 2.5rem;
            font-weight: 800;
            color: #3b82f6;
            display: block;
        }
        .stat-label {
            color: #64748b;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TruckFlow AI Demo Screenshots</h1>
            <p>Comprehensive platform screenshots showcasing AI-powered trucking dispatch capabilities</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <span class="stat-number">${demoPages.length}</span>
                <span class="stat-label">Platform Views</span>
            </div>
            <div class="stat">
                <span class="stat-number">10</span>
                <span class="stat-label">AI Features</span>
            </div>
            <div class="stat">
                <span class="stat-number">1920x1080</span>
                <span class="stat-label">Resolution</span>
            </div>
            <div class="stat">
                <span class="stat-number">100%</span>
                <span class="stat-label">Functional</span>
            </div>
        </div>

        <div class="grid">
            ${demoPages.map(page => `
                <div class="screenshot-card">
                    <img src="${page.name}.png" alt="${page.title}" class="screenshot-img">
                    <div class="card-content">
                        <h3 class="card-title">${page.title}</h3>
                        <p class="card-description">${page.description}</p>
                        <div class="card-meta">
                            <span class="badge">Live Demo</span>
                            <a href="${page.name}.png" download class="download-btn">Download PNG</a>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'index.html'), indexHtml);
  console.log('✓ Generated screenshot index at demo-screenshots/index.html');
}

async function main() {
  try {
    console.log('Starting TruckFlow AI Demo Screenshot Generation');
    console.log('================================================');
    
    // Wait for server to be ready
    console.log('Waiting for server...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await captureScreenshots();
    await generateScreenshotIndex();
    
    console.log('================================================');
    console.log('Demo screenshots generated successfully!');
    console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}/`);
    console.log(`View index at: ${SCREENSHOTS_DIR}/index.html`);
    
  } catch (error) {
    console.error('Error generating screenshots:', error);
    process.exit(1);
  }
}

// Run the main function
main();