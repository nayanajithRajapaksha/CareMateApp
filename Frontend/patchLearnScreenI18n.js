const fs = require('fs');

let content = fs.readFileSync('src/screens/LearnScreen.tsx', 'utf8');

// 1. Remove the existing fallbackArticles definition
content = content.replace(/const fallbackArticles: Blog\[\] = \[\s*\{[\s\S]*?\];\s*/, '');

// 2. Insert the fallbackArticles inside the component using useMemo
const fallbackArticlesHook = `
  const { t } = useLanguage();
  
  const fallbackArticles = React.useMemo<Blog[]>(() => [
    {
      id: 'f1',
      category: 'Nutrition',
      title: 'The Essential Breastfeeding Guide for New Mothers',
      subtitle: 'Learn optimal positioning, latching techniques, and nutrition advice for newborn care.',
      read_time: '5 min read',
      author_name: 'Dr. Perera (MOH)',
      author_role: 'moh',
      cover_image: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&q=80',
      status: 'published',
      content_blocks: [
        { id: 'b1', type: 'subtitle', text: 'Why Breastfeeding is Vital' },
        { id: 'b2', type: 'text', text: 'Breast milk provides the ideal balance of nutrients for your baby. It has antibodies that help your baby fight off viruses and bacteria.' },
        { id: 'b3', type: 'image', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', caption: 'Balanced mother & child nutrition meal' }
      ]
    },
    {
      id: 'f2',
      category: 'General Health',
      title: 'Managing Common Fevers in Toddlers at Home',
      subtitle: 'Recognizing high fever warning signs and safe home care remedies.',
      read_time: '4 min read',
      author_name: 'CareMate Health Team',
      author_role: 'admin',
      cover_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
      status: 'published',
      content_blocks: [
        { id: 'b1', type: 'subtitle', text: 'When to Treat a Fever' },
        { id: 'b2', type: 'text', text: 'A fever is usually a sign that your child’s body is fighting off an infection. Keep your child hydrated and well-rested.' }
      ]
    },
    {
      id: 'special-VaccineMilestones',
      category: 'Vaccinations',
      title: t('vaccineMilestonesTitle') || 'Vaccination Milestones',
      subtitle: t('vaccineMilestonesIntro') || 'A comprehensive guide for your child\\'s first 5 years of immunizations.',
      read_time: '5 min read',
      author_name: 'CareMate',
      author_role: 'admin',
      cover_image: 'https://images.unsplash.com/photo-1631815587646-b85a1bb02246?w=600&q=80',
      status: 'published',
      content_blocks: []
    },
    {
      id: 'special-EssentialVaccines',
      category: 'Vaccinations',
      title: t('essentialVaccinesTitle') || 'Essential Vaccinations for Under 5s',
      subtitle: t('essentialVaccinesIntro') || 'An overview of the key vaccines required for early childhood immunity.',
      read_time: '4 min read',
      author_name: 'CareMate',
      author_role: 'admin',
      cover_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
      status: 'published',
      content_blocks: []
    },
    {
      id: 'special-WhyImmunize',
      category: 'Vaccinations',
      title: t('whyImmunizeTitle') || 'Why Immunize?',
      subtitle: t('whyImmunizeIntro') || 'Understanding the importance of vaccines for direct and community defense.',
      read_time: '3 min read',
      author_name: 'CareMate',
      author_role: 'admin',
      cover_image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&q=80',
      status: 'published',
      content_blocks: []
    },
    {
      id: 'special-AfterVaccine',
      category: 'Vaccinations',
      title: t('afterVaccineTitle') || 'After the Vaccine',
      subtitle: t('afterVaccineIntro') || 'A practical guide on managing post-vaccination side effects.',
      read_time: '4 min read',
      author_name: 'CareMate',
      author_role: 'admin',
      cover_image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80',
      status: 'published',
      content_blocks: []
    }
  ], [t]);
`;

content = content.replace("  const { t } = useLanguage();", fallbackArticlesHook);

// Also make sure handleOpenBlog navigates for special articles
if (!content.includes('navigation.navigate(screenName)')) {
  const handleOpenBlogReplacement = \`
  const navigation = useNavigation<any>();

  const handleOpenBlog = (blog: Blog) => {
    if (blog.id.startsWith('special-')) {
      const screenName = blog.id.replace('special-', '');
      navigation.navigate(screenName);
    } else {
      setSelectedBlog(blog);
      setIsModalVisible(true);
    }
  };
\`;

  // Remove existing useNavigation call if any
  content = content.replace(/\\s*const navigation = useNavigation<any>\\(\\);/g, "");

  content = content.replace(
    /\\s*const handleOpenBlog = \\(blog: Blog\\) => \\{\\s*setSelectedBlog\\(blog\\);\\s*setIsModalVisible\\(true\\);\\s*\\};/,
    handleOpenBlogReplacement
  );
}


fs.writeFileSync('src/screens/LearnScreen.tsx', content);
console.log('LearnScreen patched with i18n support for special articles!');
