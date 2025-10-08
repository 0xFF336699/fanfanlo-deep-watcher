const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取所有示例项目
const examplesDir = path.join(__dirname, 'examples');
const examples = fs.readdirSync(examplesDir).filter(dir => {
  return fs.statSync(path.join(examplesDir, dir)).isDirectory();
});

console.log('Setting up examples...');

// 为每个示例项目设置依赖
for (const example of examples) {
  const examplePath = path.join(examplesDir, example);
  const packageJsonPath = path.join(examplePath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    console.log(`\nSetting up ${example}...`);
    
    try {
      // 安装依赖
      console.log('Installing dependencies...');
      execSync('npm install', { cwd: examplePath, stdio: 'inherit' });
      
      console.log(`✅ ${example} setup completed!`);
    } catch (error) {
      console.error(`❌ Failed to setup ${example}:`, error.message);
    }
  }
}

console.log('\nAll examples have been set up!');
