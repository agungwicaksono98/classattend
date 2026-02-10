const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Admin users
    const admin1 = await prisma.user.upsert({
        where: { email: 'admin@classattend.com' },
        update: {},
        create: {
            email: 'admin@classattend.com',
            passwordHash: await bcrypt.hash('admin123', 10),
            name: 'Administrator',
            role: 'ADMIN'
        }
    });

    const admin2 = await prisma.user.upsert({
        where: { email: 'admin2@classattend.com' },
        update: {},
        create: {
            email: 'admin2@classattend.com',
            passwordHash: await bcrypt.hash('admin123', 10),
            name: 'Admin Dua',
            role: 'ADMIN'
        }
    });

    console.log('✅ Created admins:', admin1.name, admin2.name);

    // Create Teachers
    const teachers = [];
    for (let i = 1; i <= 5; i++) {
        const teacher = await prisma.user.upsert({
            where: { email: `guru${i}@classattend.com` },
            update: {},
            create: {
                email: `guru${i}@classattend.com`,
                passwordHash: await bcrypt.hash('guru123', 10),
                name: `Guru ${i}`,
                role: 'TEACHER'
            }
        });
        teachers.push(teacher);
    }
    console.log('✅ Created 5 teachers');

    // Create Classes with default geofence (Jakarta coordinates as example)
    const class1 = await prisma.class.upsert({
        where: { id: 'class-10a' },
        update: {},
        create: {
            id: 'class-10a',
            name: 'Kelas 10A',
            teacherId: teachers[0].id,
            geofenceLat: -6.200000,
            geofenceLng: 106.816666,
            geofenceRadius: 100
        }
    });

    const class2 = await prisma.class.upsert({
        where: { id: 'class-10b' },
        update: {},
        create: {
            id: 'class-10b',
            name: 'Kelas 10B',
            teacherId: teachers[1].id,
            geofenceLat: -6.200000,
            geofenceLng: 106.816666,
            geofenceRadius: 100
        }
    });

    console.log('✅ Created 2 classes:', class1.name, class2.name);

    // Create Students (15 per class = 30 total)
    for (let i = 1; i <= 15; i++) {
        await prisma.user.upsert({
            where: { email: `siswa10a${i.toString().padStart(2, '0')}@classattend.com` },
            update: {},
            create: {
                email: `siswa10a${i.toString().padStart(2, '0')}@classattend.com`,
                passwordHash: await bcrypt.hash('siswa123', 10),
                name: `Siswa 10A-${i}`,
                nis: `2024A${i.toString().padStart(3, '0')}`,
                role: 'STUDENT',
                classId: class1.id
            }
        });
    }

    for (let i = 1; i <= 15; i++) {
        await prisma.user.upsert({
            where: { email: `siswa10b${i.toString().padStart(2, '0')}@classattend.com` },
            update: {},
            create: {
                email: `siswa10b${i.toString().padStart(2, '0')}@classattend.com`,
                passwordHash: await bcrypt.hash('siswa123', 10),
                name: `Siswa 10B-${i}`,
                nis: `2024B${i.toString().padStart(3, '0')}`,
                role: 'STUDENT',
                classId: class2.id
            }
        });
    }

    console.log('✅ Created 30 students (15 per class)');

    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   Admin: admin@classattend.com / admin123');
    console.log('   Guru: guru1@classattend.com / guru123');
    console.log('   Siswa: siswa10a01@classattend.com / siswa123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
