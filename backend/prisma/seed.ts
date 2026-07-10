import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding expanded healthcare database...');

  // Clean DB in order of relations
  await prisma.recommendation.deleteMany({});
  await prisma.healthMetric.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.patientProfile.deleteMany({});
  await prisma.doctorProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('adminpassword', salt);
  const doctorPassword = await bcrypt.hash('doctorpassword', salt);
  const patientPassword = await bcrypt.hash('patientpassword', salt);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'PulseCare Central Admin',
      email: 'admin@pulsecare.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`- Created Admin: ${admin.email}`);

  // 2. Create 2 Doctors
  const doc1 = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@pulsecare.com',
      password: doctorPassword,
      role: 'DOCTOR',
      doctorProfile: {
        create: {
          specialization: 'Cardiology',
          licenseNumber: 'LIC-774411',
          consultationFee: 180,
          bio: 'Dr. Sarah Jenkins is an expert in preventive cardiology, cardiovascular wellness, and hypertension management. She has over 12 years of experience leading cardiac care programs.',
        },
      },
    },
  });
  console.log(`- Created Doctor: ${doc1.email} (Cardiologist)`);

  const doc2 = await prisma.user.create({
    data: {
      name: 'Dr. Michael Chen',
      email: 'michael.chen@pulsecare.com',
      password: doctorPassword,
      role: 'DOCTOR',
      doctorProfile: {
        create: {
          specialization: 'Family Medicine & Pediatrics',
          licenseNumber: 'LIC-882255',
          consultationFee: 120,
          bio: 'Dr. Michael Chen is passionate about family health, childhood wellness, annual wellness examinations, and metabolic health tracking.',
        },
      },
    },
  });
  console.log(`- Created Doctor: ${doc2.email} (Family Medicine)`);

  // 3. Define 5 Patients data with complete biometrics profiles
  const patientsData = [
    {
      name: 'Alice Johnson',
      email: 'patient.alice@pulsecare.com',
      profile: {
        dateOfBirth: '1995-03-12',
        gender: 'FEMALE',
        bloodType: 'A+',
        height: 168.0,
        weight: 62.5,
        allergies: 'Dairy products, Bee stings',
        medicalHistory: 'Mild iron deficiency anemia, managed with diet.',
      },
      vitalsConfig: {
        bpSystolicBase: 118,
        bpDiastolicBase: 76,
        hrBase: 68,
        sleepBase: 7.8,
        stepsBase: 9500,
        weightBase: 62.5,
      },
      recommendation: {
        doctor: doc1,
        title: 'Cardiovascular Fitness & Anemia Management',
        description: '1. Walk at least 10,000 steps daily to build cardiovascular stamina.\n2. Ensure rich dietary iron intake (spinach, lentils, red meat) combined with Vitamin C.\n3. Log heart rate immediately after morning walks.\n4. Limit caffeine intake to 1 cup daily.',
      },
      appointment: {
        doctor: doc1,
        daysOffset: 2,
        reason: 'Review progress on cardiovascular stamina and blood test results.',
      },
    },
    {
      name: 'Bob Smith',
      email: 'patient.bob@pulsecare.com',
      profile: {
        dateOfBirth: '1978-11-20',
        gender: 'MALE',
        bloodType: 'B+',
        height: 178.0,
        weight: 86.4,
        allergies: 'Penicillin, Dust mites',
        medicalHistory: 'Essential Hypertension diagnosed in 2023. Taking Lisinopril.',
      },
      vitalsConfig: {
        bpSystolicBase: 135,
        bpDiastolicBase: 86,
        hrBase: 76,
        sleepBase: 6.2,
        stepsBase: 5500,
        weightBase: 86.4,
      },
      recommendation: {
        doctor: doc1,
        title: 'Hypertension and Sodium Reduction Plan',
        description: '1. Reduce daily sodium intake to less than 1,500 mg.\n2. Engage in moderate aerobic exercise (e.g., brisk walking) for 30 minutes, 5 days a week.\n3. Record blood pressure twice daily: once in the morning and once in the evening.\n4. Sleep hygiene: Aim for at least 7 hours of sleep to assist blood pressure regulation.',
      },
      appointment: {
        doctor: doc1,
        daysOffset: 3,
        reason: 'Monthly hypertension medication review and blood pressure log check.',
      },
    },
    {
      name: 'Charlie Brown',
      email: 'patient.charlie@pulsecare.com',
      profile: {
        dateOfBirth: '2001-07-04',
        gender: 'MALE',
        bloodType: 'O-',
        height: 172.0,
        weight: 71.0,
        allergies: 'None declared',
        medicalHistory: 'Seasonal pollen allergies, manages with over-the-counter antihistamines.',
      },
      vitalsConfig: {
        bpSystolicBase: 120,
        bpDiastolicBase: 78,
        hrBase: 64,
        sleepBase: 8.2,
        stepsBase: 11000,
        weightBase: 71.0,
      },
      recommendation: {
        doctor: doc2,
        title: 'Athletic Conditioning & Hydration Guidelines',
        description: '1. Maintain high water intake (at least 3.5 liters/day) during heavy training days.\n2. Ensure step counts stay above 10,000 to maintain baseline endurance.\n3. Integrate daily stretching and active recovery to prevent muscle fatigue.\n4. Take Vitamin D3 supplements during winter months.',
      },
      appointment: {
        doctor: doc2,
        daysOffset: 5,
        reason: 'Sports physical checkup and annual wellness overview.',
      },
    },
    {
      name: 'Diana Prince',
      email: 'patient.diana@pulsecare.com',
      profile: {
        dateOfBirth: '1990-09-25',
        gender: 'FEMALE',
        bloodType: 'AB+',
        height: 175.0,
        weight: 66.8,
        allergies: 'Sulfa drugs, Latex',
        medicalHistory: 'Mild exercise-induced asthma, prescribed Albuterol inhaler.',
      },
      vitalsConfig: {
        bpSystolicBase: 115,
        bpDiastolicBase: 74,
        hrBase: 70,
        sleepBase: 7.4,
        stepsBase: 8800,
        weightBase: 66.8,
      },
      recommendation: {
        doctor: doc2,
        title: 'Asthma Control & Physical Wellness Guidelines',
        description: '1. Use prescribed Albuterol inhaler 15 minutes before high-intensity workouts.\n2. Monitor heart rate recovery times post-cardio.\n3. Keep indoor air clean to minimize environmental triggers.\n4. Maintain consistent sleep schedule to support immune health.',
      },
      appointment: {
        doctor: doc2,
        daysOffset: 1,
        reason: 'Evaluate asthma management plan and inhaler usage frequency.',
      },
    },
    {
      name: 'Evan Wright',
      email: 'patient.evan@pulsecare.com',
      profile: {
        dateOfBirth: '1965-12-05',
        gender: 'MALE',
        bloodType: 'O+',
        height: 180.0,
        weight: 94.5,
        allergies: 'Shellfish',
        medicalHistory: 'Prediabetes diagnosed in late 2024. Fatty liver indicators.',
      },
      vitalsConfig: {
        bpSystolicBase: 128,
        bpDiastolicBase: 82,
        hrBase: 74,
        sleepBase: 6.8,
        stepsBase: 6200,
        weightBase: 94.5,
      },
      recommendation: {
        doctor: doc2,
        title: 'Metabolic Support & Weight Control Plan',
        description: '1. Strictly avoid processed sugars and refined carbohydrates.\n2. Focus on high-fiber diets and lean proteins.\n3. Increase steps count to at least 8,000 steps daily.\n4. Log weight every Saturday morning. Target 0.5kg reduction per week.',
      },
      appointment: {
        doctor: doc2,
        daysOffset: 4,
        reason: 'Review HbA1c blood sugar levels and weight loss progress.',
      },
    },
  ];

  // 4. Generate Users, Profiles, Vitals History, Appointments & Recommendations for each patient
  for (const patientObj of patientsData) {
    // Create User & Profile
    const createdUser = await prisma.user.create({
      data: {
        name: patientObj.name,
        email: patientObj.email,
        password: patientPassword,
        role: 'PATIENT',
        patientProfile: {
          create: {
            dateOfBirth: patientObj.profile.dateOfBirth,
            gender: patientObj.profile.gender,
            bloodType: patientObj.profile.bloodType,
            height: patientObj.profile.height,
            weight: patientObj.profile.weight,
            allergies: patientObj.profile.allergies,
            medicalHistory: patientObj.profile.medicalHistory,
          },
        },
      },
    });
    console.log(`- Created Patient: ${createdUser.email}`);

    // Generate Vitals History over the last 5 days
    const config = patientObj.vitalsConfig;
    const metricsToCreate = [];

    for (let day = 0; day < 5; day++) {
      // Calculate a timestamp for each day
      const recordedAt = new Date();
      recordedAt.setDate(recordedAt.getDate() - day);
      recordedAt.setHours(8, 0, 0, 0); // Morning readings

      // 1. Blood Pressure: variance of +- 5
      const sysOffset = Math.floor(Math.random() * 9) - 4; // -4 to +4
      const diaOffset = Math.floor(Math.random() * 7) - 3; // -3 to +3
      const bpVal = `${config.bpSystolicBase + sysOffset}/${config.bpDiastolicBase + diaOffset}`;
      metricsToCreate.push({
        patientId: createdUser.id,
        type: 'BLOOD_PRESSURE',
        value: bpVal,
        unit: 'mmHg',
        recordedAt,
      });

      // 2. Heart Rate: variance of +- 6
      const hrOffset = Math.floor(Math.random() * 11) - 5; // -5 to +5
      const hrVal = String(config.hrBase + hrOffset);
      metricsToCreate.push({
        patientId: createdUser.id,
        type: 'HEART_RATE',
        value: hrVal,
        unit: 'bpm',
        recordedAt,
      });

      // 3. Sleep: variance of +- 1.5 hours
      const sleepOffset = (Math.random() * 3) - 1.5; // -1.5 to +1.5
      const sleepVal = (config.sleepBase + sleepOffset).toFixed(1);
      metricsToCreate.push({
        patientId: createdUser.id,
        type: 'SLEEP',
        value: sleepVal,
        unit: 'hours',
        recordedAt,
      });

      // 4. Steps: variance of +- 2000 steps
      const stepsOffset = Math.floor(Math.random() * 4001) - 2000; // -2000 to +2000
      const stepsVal = String(config.stepsBase + stepsOffset);
      metricsToCreate.push({
        patientId: createdUser.id,
        type: 'STEPS',
        value: stepsVal,
        unit: 'steps',
        recordedAt,
      });

      // 5. Weight: variance of +- 0.4 kg
      const weightOffset = (Math.random() * 0.8) - 0.4; // -0.4 to +0.4
      const weightVal = (config.weightBase + weightOffset).toFixed(1);
      metricsToCreate.push({
        patientId: createdUser.id,
        type: 'WEIGHT',
        value: weightVal,
        unit: 'kg',
        recordedAt,
      });
    }

    await prisma.healthMetric.createMany({
      data: metricsToCreate,
    });
    console.log(`  * Generated 25 historical logs (BP, HR, Sleep, Steps, Weight) for ${createdUser.name}`);

    // Create Upcoming Appointment
    const apptDate = new Date();
    apptDate.setDate(apptDate.getDate() + patientObj.appointment.daysOffset);
    apptDate.setHours(10, 0, 0, 0); // 10:00 AM

    await prisma.appointment.create({
      data: {
        patientId: createdUser.id,
        doctorId: patientObj.appointment.doctor.id,
        dateTime: apptDate,
        status: 'APPROVED',
        reason: patientObj.appointment.reason,
      },
    });
    console.log(`  * Created upcoming appointment with ${patientObj.appointment.doctor.name}`);

    // Create Doctor Recommendation
    await prisma.recommendation.create({
      data: {
        patientId: createdUser.id,
        doctorId: patientObj.recommendation.doctor.id,
        title: patientObj.recommendation.title,
        description: patientObj.recommendation.description,
      },
    });
    console.log(`  * Created clinical recommendation from ${patientObj.recommendation.doctor.name}`);
  }

  console.log('🌱 Seeding expanded database successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
