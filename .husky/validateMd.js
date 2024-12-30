const { execSync } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml'); // YAML 파싱을 위해 js-yaml 패키지 사용

const CATEGORY = ['Journaling', 'Diary'];

try {
  // Get the list of staged Markdown files
  const output = execSync('git diff --cached --name-only --diff-filter=ACMR | grep \\.md$ || true', { encoding: 'utf8' }).trim();
  const files = output ? output.split('\n') : [];

  if (files.length === 0) {
    console.log('No Markdown files changed. Skipping checks.');
    process.exit(0); // Exit successfully if no Markdown files
  }

  files.forEach((file) => {
    // Check if the file exists
    if (!fs.existsSync(file)) {
      console.log(`Skipping validation for '${file}' as it does not exist.`);
      return;
    }

    console.log(`Checking file: ${file}`);
    const content = fs.readFileSync(file, 'utf8');

    // Extract Front Matter
    const match = content.match(/^---\n([\s\S]+?)\n---/);
    if (match) {
      const frontMatter = yaml.load(match[1]);
      const category = frontMatter.category;

      // Validate the category
      if (!CATEGORY.includes(category)) {
        console.error(`Error: Invalid category '${category}' in ${file}. Allowed values are ${CATEGORY.join(', ')}.`);
        process.exit(1); // Fail if category is invalid
      }
    } else {
      console.error(`Error: Missing Front Matter in ${file}.`);
      process.exit(1); // Fail if Front Matter is missing
    }
  });

  console.log('All checks passed!');
} catch (err) {
  console.error('Error during validation:', err.message);
  process.exit(1);
}
