const prisma = require('./src/config/db');

async function debug() {
    console.log('=== DEBUG: Attendance Issue ===\n');

    // 1. Check all attendance records
    const attendances = await prisma.attendance.findMany();
    console.log(`Total Attendance Records: ${attendances.length}`);

    if (attendances.length > 0) {
        console.log('\nAttendance data:');
        attendances.forEach((a, i) => {
            console.log(`\n[${i + 1}]`);
            console.log(`  ID: ${a.id}`);
            console.log(`  User ID: ${a.userId}`);
            console.log(`  Date (stored): ${a.date}`);
            console.log(`  Date (ISO): ${a.date.toISOString()}`);
            console.log(`  Check-in Time: ${a.checkInTime}`);
        });
    }

    // 2. Show what getTodayDate returns
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    console.log(`\n=== Date Analysis ===`);
    console.log(`Current time (local): ${now}`);
    console.log(`UTC time: ${now.toISOString()}`);
    console.log(`getTodayDate() returns: "${todayStr}"`);
    console.log(`new Date(todayStr): ${new Date(todayStr)}`);
    console.log(`new Date(todayStr).toISOString(): ${new Date(todayStr).toISOString()}`);

    // 3. Test the query that getToday uses
    console.log(`\n=== Query Analysis ===`);
    const testDate = new Date(todayStr);
    console.log(`Query date object: ${testDate}`);
    console.log(`Query date ISO: ${testDate.toISOString()}`);

    // 4. Get a sample user
    const student = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
        include: { class: true }
    });

    if (student) {
        console.log(`\n=== Sample Student ===`);
        console.log(`ID: ${student.id}`);
        console.log(`Name: ${student.name}`);

        // Check if there's any attendance for this student
        const studentAtt = await prisma.attendance.findFirst({
            where: { userId: student.id }
        });

        if (studentAtt) {
            console.log(`\n=== Student's Attendance ===`);
            console.log(`Stored date: ${studentAtt.date}`);
            console.log(`Stored date ISO: ${studentAtt.date.toISOString()}`);
            console.log(`Query date ISO: ${new Date(todayStr).toISOString()}`);
            console.log(`Are they equal? ${studentAtt.date.toISOString() === new Date(todayStr).toISOString()}`);
        } else {
            console.log(`\nNo attendance record found for this student.`);
        }
    }
}

debug()
    .catch(e => console.error('Error:', e))
    .finally(() => prisma.$disconnect());
