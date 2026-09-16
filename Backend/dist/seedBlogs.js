"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
// Load environment variables from the root .env or Backend/.env
dotenv_1.default.config({ path: __dirname + '/../.env' });
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const sampleBlogs = [
    {
        title: 'Understanding Childhood Immunizations',
        subtitle: 'A comprehensive guide for parents on the recommended vaccine schedule, benefits, and what to expect.',
        category: 'Vaccinations',
        cover_image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?q=80&w=1000&auto=format&fit=crop',
        author_name: 'Dr. Sarah Jenkins',
        author_role: 'Pediatric Specialist',
        read_time: '6 min read',
        content_blocks: [
            { id: crypto_1.default.randomUUID(), type: 'heading', text: 'Why are vaccines important?' },
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'Vaccines protect your child from serious diseases like polio, measles, and whooping cough. By vaccinating your child, you are not only protecting them but also helping to keep your community safe through herd immunity.' },
            { id: crypto_1.default.randomUUID(), type: 'heading', text: 'The National Immunization Schedule' },
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'The Ministry of Health provides a structured immunization schedule for all children. It starts right from birth with the BCG vaccine and continues through early childhood. Ensure you follow the dates provided in your CHDR (Child Health Development Record) book.' },
            { id: crypto_1.default.randomUUID(), type: 'subtitle', text: 'Common Side Effects' },
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'It is normal for babies to experience mild side effects after a vaccination. These can include a slight fever, redness or swelling at the injection site, and mild irritability. These usually subside within a day or two.' }
        ]
    },
    {
        title: 'The Essential Breastfeeding Guide for New Mothers',
        subtitle: 'Everything you need to know about providing the best nutrition for your newborn.',
        category: 'Nutrition',
        cover_image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?q=80&w=1000&auto=format&fit=crop',
        author_name: 'Nurse Chathurika Perera',
        author_role: 'Public Health Midwife',
        read_time: '5 min read',
        content_blocks: [
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'Exclusive breastfeeding is recommended for the first six months of your baby\'s life. Breast milk provides the ideal nutrition for infants, containing a perfect mix of vitamins, protein, and fat.' },
            { id: crypto_1.default.randomUUID(), type: 'heading', text: 'Benefits for the Baby' },
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'Breast milk contains antibodies that help your baby fight off viruses and bacteria. It lowers your baby\'s risk of having asthma or allergies. Plus, babies who are breastfed exclusively for the first 6 months have fewer ear infections, respiratory illnesses, and bouts of diarrhea.' },
            { id: crypto_1.default.randomUUID(), type: 'heading', text: 'Tips for a Good Latch' },
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'A good latch is crucial for comfortable breastfeeding. Ensure your baby\'s mouth covers a large part of the areola, not just the nipple. Your baby\'s chin should be touching your breast, and their lips should be flared outward.' }
        ]
    },
    {
        title: 'Supporting Your Child\'s Mental Wellbeing',
        subtitle: 'Practical tips to foster emotional resilience and a healthy mindset in growing children.',
        category: 'Mental Health',
        cover_image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1000&auto=format&fit=crop',
        author_name: 'Dr. Amila Perera',
        author_role: 'Child Psychologist',
        read_time: '7 min read',
        content_blocks: [
            { id: crypto_1.default.randomUUID(), type: 'heading', text: 'Creating a Safe Space' },
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'Children need to feel that their emotions are valid. Create a home environment where they feel safe expressing their feelings without judgment. Listen to them actively and validate their experiences.' },
            { id: crypto_1.default.randomUUID(), type: 'heading', text: 'Encouraging Healthy Coping Mechanisms' },
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'Teach your child how to handle stress. This could involve deep breathing exercises, drawing, talking about their feelings, or engaging in physical activities. Helping them identify their emotions is the first step.' }
        ]
    },
    {
        title: 'Milestones: What to Expect in the First Year',
        subtitle: 'A month-by-month guide to your baby\'s developmental milestones.',
        category: 'Child Development',
        cover_image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1000&auto=format&fit=crop',
        author_name: 'CareMate Team',
        author_role: 'Health Educators',
        read_time: '8 min read',
        content_blocks: [
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'The first year of your baby\'s life is filled with rapid growth and incredible milestones. From their first smile to their first steps, every moment is special.' },
            { id: crypto_1.default.randomUUID(), type: 'heading', text: 'Months 1-3: Early Discoveries' },
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'During this time, your baby will start making eye contact, smiling deliberately (the social smile), and gaining more control over their head and neck movements.' },
            { id: crypto_1.default.randomUUID(), type: 'heading', text: 'Months 4-6: Reaching Out' },
            { id: crypto_1.default.randomUUID(), type: 'text', text: 'Your baby will begin to roll over, reach for objects, and babble. This is an exciting time as they become more interactive with their surroundings.' }
        ]
    }
];
async function seedBlogs() {
    try {
        console.log('Connecting to database...');
        for (const blog of sampleBlogs) {
            const query = `
        INSERT INTO blogs (title, subtitle, category, cover_image, author_name, author_role, read_time, content_blocks, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
      `;
            const values = [
                blog.title,
                blog.subtitle,
                blog.category,
                blog.cover_image,
                blog.author_name,
                blog.author_role,
                blog.read_time,
                JSON.stringify(blog.content_blocks),
                'published'
            ];
            const result = await pool.query(query, values);
            console.log(`Successfully inserted blog: "${blog.title}" with ID: ${result.rows[0].id}`);
        }
        console.log('Database seeding completed successfully!');
    }
    catch (error) {
        console.error('Error seeding blogs:', error);
    }
    finally {
        await pool.end();
    }
}
seedBlogs();
//# sourceMappingURL=seedBlogs.js.map