const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/screens/LearnScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

const targetStr = `      if (fetched && fetched.length > 0) {
        setBlogs(fetched);
      } else {`;

const replacementStr = `      if (fetched && fetched.length > 0) {
        const specialFallbacks = fallbackArticles.filter(b => {
          if (!b.id.startsWith('special-')) return false;
          const matchTopic = activeTopic === t('topicAllTopics') || t(\`topic\${b.category.replace(/\\s+/g, '')}\`) === activeTopic || b.category === activeTopic;
          const matchSearch = !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()) || (b.subtitle && b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchTopic && matchSearch;
        });
        setBlogs([...fetched, ...specialFallbacks]);
      } else {`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('LearnScreen successfully patched!');
} else {
    console.log('Target string NOT FOUND in LearnScreen.tsx. Check indentation or exact string match.');
}
