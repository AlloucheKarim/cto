import { db } from './index';
import { artists } from './schema';

async function main() {
  console.log('Seeding artists...');
  
  const mockArtists = [
    {
      name: 'Alex Rivera',
      email: 'alex@tattoo.com',
      bio: 'Specializing in traditional and blackwork.',
      specialties: ['Traditional', 'Blackwork'],
    },
    {
      name: 'Sarah Ink',
      email: 'sarah@tattoo.com',
      bio: 'Loves realism and fine line work.',
      specialties: ['Realism', 'Fine Line'],
    },
    {
      name: 'Kai Zen',
      email: 'kai@tattoo.com',
      bio: 'Expert in Japanese and Neo Traditional styles.',
      specialties: ['Japanese', 'Neo Traditional'],
    },
  ];

  for (const artist of mockArtists) {
    await db.insert(artists).values(artist).onConflictDoNothing();
  }

  console.log('Seeding finished.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
