import type { Child } from "../types/child";
import type { GrowthInfo } from "../types/growth";
import type { HealthInfo } from "../types/health";
import { GrowthAssessment } from "../types/growthAssessment";
import type { DailyNote } from "../types/dailyNote";
import type { Reminder } from "../types/reminder";
export const children: Child[] = [
  {
    id: 1,
    code: "RANS-001",
    name: "Aisyah",
    nickname: "Aisyah",
    dateOfBirth: "2023-07-10",
    gender: "Perempuan",
    entryDate: "2024-02-15",
    health: "Perlu Perhatian",
    condition: "Normal",
    caregiver: "Bu Sari",
    background:
      "Ditempatkan dalam pengasuhan Rumah Kasih Ibu sejak Februari 2024.",
    allergies: [],
    specialConditions: [],
  },
  {
    id: 2,
    code: "RANS-002",
    name: "Budi",
    nickname: "Budi",
    dateOfBirth: "2021-08-22",
    gender: "Laki-laki",
    entryDate: "2023-11-10",
    health: "Normal",
    condition: "Normal",
    caregiver: "Pak Andi",
    background:
      "Dalam pengasuhan Rumah Kasih Ibu sejak November 2023.",
    allergies: [],
    specialConditions: [],
  },
  {
    id: 3,
    code: "RANS-003",
    name: "Citra",
    nickname: "Citra",
    dateOfBirth: "2023-01-15",
    gender: "Perempuan",
    entryDate: "2024-04-20",
    health: "Normal",
    condition: "Disabilitas",
    caregiver: "Bu Sari",
    background:
      "Mendapatkan pendampingan khusus sesuai kebutuhan.",
    allergies: ["Tidak diketahui"],
    specialConditions: [
      "Memerlukan pendampingan khusus",
    ],
  },
  {
    id: 4,
    code: "RANS-004",
    name: "Dafa",
    nickname: "Dafa",
    dateOfBirth: "2022-03-05",
    gender: "Laki-laki",
    entryDate: "2023-08-12",
    health: "Normal",
    condition: "Normal",
    caregiver: "Pak Andi",
    background:
      "Dalam pengasuhan Rumah Kasih Ibu sejak Agustus 2023.",
    allergies: [],
    specialConditions: [],
  },
  {
    id: 5,
    code: "RANS-005",
    name: "Eka",
    nickname: "Eka",
    dateOfBirth: "2022-11-18",
    gender: "Perempuan",
    entryDate: "2024-01-08",
    health: "Normal",
    condition: "Normal",
    caregiver: "Bu Rina",
    background:
      "Dalam pengasuhan Rumah Kasih Ibu sejak Januari 2024.",
    allergies: [],
    specialConditions: [],
  },
];

export const healthData: Record<number, HealthInfo> = {
  1: {
    status: "Perlu Perhatian",

    allergies: [],

    specialConditions: [],

    lastCheckup: {
      id: 101,
      childId: 1,
      recordedAt: "2026-09-13",
      status: "Perlu Perhatian",
      title: "Pemeriksaan rutin",
      summary:
        "Kondisi umum cukup baik, namun terdapat perubahan nafsu makan yang perlu dipantau.",
      notes:
        "Pengurus diminta memantau pola makan dan kondisi anak dalam beberapa hari ke depan.",
      recordedBy: "Bu Sari",
    },

    history: [
      {
        id: 101,
        childId: 1,
        recordedAt: "2026-09-13",
        status: "Perlu Perhatian",
        title: "Pemeriksaan rutin",
        summary:
          "Kondisi umum cukup baik, namun terdapat perubahan nafsu makan yang perlu dipantau.",
        notes:
          "Pengurus diminta memantau pola makan dan kondisi anak dalam beberapa hari ke depan.",
        recordedBy: "Bu Sari",
      },
      {
        id: 102,
        childId: 1,
        recordedAt: "2026-08-20",
        status: "Perlu Perhatian",
        title: "Keluhan",
        summary:
          "Nafsu makan menurun dibandingkan beberapa hari sebelumnya.",
        notes:
          "Perlu pemantauan lebih lanjut terhadap pola makan.",
        recordedBy: "Bu Sari",
      },
      {
        id: 103,
        childId: 1,
        recordedAt: "2026-07-12",
        status: "Normal",
        title: "Pemeriksaan rutin",
        summary:
          "Kondisi umum baik dan anak aktif mengikuti kegiatan.",
        recordedBy: "Pak Andi",
      },
    ],
  },

  2: {
    status: "Normal",

    allergies: [],

    specialConditions: [],

    lastCheckup: {
      id: 201,
      childId: 2,
      recordedAt: "2026-09-12",
      status: "Normal",
      title: "Pemeriksaan rutin",
      summary:
        "Kondisi umum baik dan anak aktif mengikuti kegiatan.",
      recordedBy: "Pak Andi",
    },

    history: [
      {
        id: 201,
        childId: 2,
        recordedAt: "2026-09-12",
        status: "Normal",
        title: "Pemeriksaan rutin",
        summary:
          "Kondisi umum baik dan anak aktif mengikuti kegiatan.",
        recordedBy: "Pak Andi",
      },
      {
        id: 202,
        childId: 2,
        recordedAt: "2026-08-10",
        status: "Normal",
        title: "Pemeriksaan rutin",
        summary:
          "Tidak terdapat catatan khusus.",
        recordedBy: "Bu Rina",
      },
    ],
  },

  3: {
    status: "Normal",

    allergies: ["Tidak diketahui"],

    specialConditions: [
      "Memerlukan pendampingan khusus",
    ],

    lastCheckup: {
      id: 301,
      childId: 3,
      recordedAt: "2026-09-11",
      status: "Normal",
      title: "Pemeriksaan rutin",
      summary:
        "Kondisi umum stabil. Anak mendapatkan pendampingan sesuai kebutuhan.",
      recordedBy: "Bu Sari",
    },

    history: [
      {
        id: 301,
        childId: 3,
        recordedAt: "2026-09-11",
        status: "Normal",
        title: "Pemeriksaan rutin",
        summary:
          "Kondisi umum stabil. Anak mendapatkan pendampingan sesuai kebutuhan.",
        recordedBy: "Bu Sari",
      },
      {
        id: 302,
        childId: 3,
        recordedAt: "2026-07-25",
        status: "Normal",
        title: "Evaluasi pendampingan",
        summary:
          "Pendampingan berjalan sesuai kebutuhan anak.",
        recordedBy: "Bu Sari",
      },
    ],
  },

  4: {
    status: "Normal",

    allergies: [],

    specialConditions: [],

    lastCheckup: {
      id: 401,
      childId: 4,
      recordedAt: "2026-09-10",
      status: "Normal",
      title: "Pemeriksaan rutin",
      summary:
        "Kondisi umum baik dan anak aktif.",
      recordedBy: "Pak Andi",
    },

    history: [
      {
        id: 401,
        childId: 4,
        recordedAt: "2026-09-10",
        status: "Normal",
        title: "Pemeriksaan rutin",
        summary:
          "Kondisi umum baik dan anak aktif.",
        recordedBy: "Pak Andi",
      },
    ],
  },

  5: {
    status: "Normal",

    allergies: [],

    specialConditions: [],

    lastCheckup: {
      id: 501,
      childId: 5,
      recordedAt: "2026-09-09",
      status: "Normal",
      title: "Pemeriksaan rutin",
      summary:
        "Kondisi umum baik dan tidak terdapat catatan khusus.",
      recordedBy: "Bu Rina",
    },

    history: [
      {
        id: 501,
        childId: 5,
        recordedAt: "2026-09-09",
        status: "Normal",
        title: "Pemeriksaan rutin",
        summary:
          "Kondisi umum baik dan tidak terdapat catatan khusus.",
        recordedBy: "Bu Rina",
      },
    ],
  },
};

export const growthData: Record<number, GrowthInfo> = {
  1: {
    history: [
      {
        id: 1001,
        childId: 1,
        recordedAt: "2026-09-13",
        weight: 14.2,
        height: 94,
        notes:
          "Pertumbuhan perlu dipantau berdasarkan hasil pengukuran berkala.",
        recordedBy: "Bu Sari",
      },
      {
        id: 1002,
        childId: 1,
        recordedAt: "2026-08-10",
        weight: 14.0,
        height: 93,
        recordedBy: "Bu Sari",
      },
      {
        id: 1003,
        childId: 1,
        recordedAt: "2026-07-08",
        weight: 13.8,
        height: 92,
        recordedBy: "Pak Andi",
      },
      {
        id: 1004,
        childId: 1,
        recordedAt: "2026-06-05",
        weight: 13.5,
        height: 91,
        recordedBy: "Pak Andi",
      },
    ],
  },

  2: {
    history: [
      {
        id: 2001,
        childId: 2,
        recordedAt: "2026-09-12",
        weight: 18.5,
        height: 108,
        recordedBy: "Pak Andi",
      },
      {
        id: 2002,
        childId: 2,
        recordedAt: "2026-08-10",
        weight: 18.2,
        height: 107,
        recordedBy: "Bu Rina",
      },
      {
        id: 2003,
        childId: 2,
        recordedAt: "2026-07-08",
        weight: 17.9,
        height: 106,
        recordedBy: "Pak Andi",
      },
    ],
  },

  3: {
    history: [
      {
        id: 3001,
        childId: 3,
        recordedAt: "2026-09-11",
        weight: 16.1,
        height: 101,
        notes:
          "Pengukuran dilakukan dengan pendampingan.",
        recordedBy: "Bu Sari",
      },
      {
        id: 3002,
        childId: 3,
        recordedAt: "2026-08-09",
        weight: 15.8,
        height: 100,
        recordedBy: "Bu Sari",
      },
      {
        id: 3003,
        childId: 3,
        recordedAt: "2026-07-07",
        weight: 15.5,
        height: 99,
        recordedBy: "Bu Sari",
      },
    ],
  },

  4: {
    history: [
      {
        id: 4001,
        childId: 4,
        recordedAt: "2026-09-10",
        weight: 20.2,
        height: 112,
        recordedBy: "Pak Andi",
      },
      {
        id: 4002,
        childId: 4,
        recordedAt: "2026-08-08",
        weight: 19.8,
        height: 111,
        recordedBy: "Pak Andi",
      },
      {
        id: 4003,
        childId: 4,
        recordedAt: "2026-07-06",
        weight: 19.5,
        height: 110,
        recordedBy: "Pak Andi",
      },
    ],
  },

  5: {
    history: [
      {
        id: 5001,
        childId: 5,
        recordedAt: "2026-09-09",
        weight: 17.3,
        height: 105,
        recordedBy: "Bu Rina",
      },
      {
        id: 5002,
        childId: 5,
        recordedAt: "2026-08-07",
        weight: 17.0,
        height: 104,
        recordedBy: "Bu Rina",
      },
      {
        id: 5003,
        childId: 5,
        recordedAt: "2026-07-05",
        weight: 16.7,
        height: 103,
        recordedBy: "Bu Rina",
      },
    ],
  },
};
export const growthAssessmentData: Record<
  number,
  GrowthAssessment
> = {
  1: {
    status: "Perlu Perhatian",
    assessedAt: "2026-09-13",
    indicators: [
      {
        type: "Berat menurut usia",
        status: "Perlu Perhatian",
        value: 14.2,
        unit: "kg",
        interpretation:
          "Indikator memerlukan pemantauan lebih lanjut berdasarkan hasil assessment.",
      },
      {
        type: "Tinggi menurut usia",
        status: "Normal",
        value: 94,
        unit: "cm",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
      {
        type: "Berat menurut tinggi",
        status: "Normal",
        value: 14.2,
        unit: "kg",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
    ],
    summary:
      "Terdapat indikator pertumbuhan yang perlu dipantau lebih lanjut. Pengurus dapat memperhatikan pola pengukuran berikutnya dan melakukan peninjauan apabila terdapat perubahan.",
    disclaimer:
      "Hasil ini merupakan indikator pemantauan dan bukan diagnosis medis. Jika terdapat kekhawatiran, lakukan peninjauan lebih lanjut oleh tenaga kesehatan.",
  },

  2: {
    status: "Normal",
    assessedAt: "2026-09-12",
    indicators: [
      {
        type: "Berat menurut usia",
        status: "Normal",
        value: 18.5,
        unit: "kg",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
      {
        type: "Tinggi menurut usia",
        status: "Normal",
        value: 108,
        unit: "cm",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
      {
        type: "Berat menurut tinggi",
        status: "Normal",
        value: 18.5,
        unit: "kg",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
    ],
    summary:
      "Hasil assessment saat ini tidak menunjukkan indikator yang memerlukan perhatian aktif.",
    disclaimer:
      "Hasil ini merupakan indikator pemantauan dan bukan diagnosis medis. Jika terdapat kekhawatiran, lakukan peninjauan lebih lanjut oleh tenaga kesehatan.",
  },

  3: {
    status: "Normal",
    assessedAt: "2026-09-11",
    indicators: [
      {
        type: "Berat menurut usia",
        status: "Normal",
        value: 16.1,
        unit: "kg",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
      {
        type: "Tinggi menurut usia",
        status: "Normal",
        value: 101,
        unit: "cm",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
      {
        type: "Berat menurut tinggi",
        status: "Normal",
        value: 16.1,
        unit: "kg",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
    ],
    summary:
      "Hasil assessment saat ini tidak menunjukkan indikator yang memerlukan perhatian aktif.",
    disclaimer:
      "Hasil ini merupakan indikator pemantauan dan bukan diagnosis medis. Jika terdapat kekhawatiran, lakukan peninjauan lebih lanjut oleh tenaga kesehatan.",
  },

  4: {
    status: "Normal",
    assessedAt: "2026-09-10",
    indicators: [
      {
        type: "Berat menurut usia",
        status: "Normal",
        value: 20.2,
        unit: "kg",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
      {
        type: "Tinggi menurut usia",
        status: "Normal",
        value: 112,
        unit: "cm",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
      {
        type: "Berat menurut tinggi",
        status: "Normal",
        value: 20.2,
        unit: "kg",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
    ],
    summary:
      "Hasil assessment saat ini tidak menunjukkan indikator yang memerlukan perhatian aktif.",
    disclaimer:
      "Hasil ini merupakan indikator pemantauan dan bukan diagnosis medis. Jika terdapat kekhawatiran, lakukan peninjauan lebih lanjut oleh tenaga kesehatan.",
  },

  5: {
    status: "Normal",
    assessedAt: "2026-09-09",
    indicators: [
      {
        type: "Berat menurut usia",
        status: "Normal",
        value: 17.3,
        unit: "kg",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
      {
        type: "Tinggi menurut usia",
        status: "Normal",
        value: 105,
        unit: "cm",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
      {
        type: "Berat menurut tinggi",
        status: "Normal",
        value: 17.3,
        unit: "kg",
        interpretation:
          "Indikator tidak menunjukkan perhatian aktif pada assessment saat ini.",
      },
    ],
    summary:
      "Hasil assessment saat ini tidak menunjukkan indikator yang memerlukan perhatian aktif.",
    disclaimer:
      "Hasil ini merupakan indikator pemantauan dan bukan diagnosis medis. Jika terdapat kekhawatiran, lakukan peninjauan lebih lanjut oleh tenaga kesehatan.",
  },
};

export const dailyNotes: DailyNote[] = [
  {
    id: 10001,
    childId: 1,
    recordedAt: "2026-09-13",
    category: "Makan",
    title: "Sarapan pagi",
    content:
      "Aisyah menghabiskan sekitar setengah porsi sarapan dan terlihat kurang bersemangat dibandingkan biasanya.",
    recordedBy: "Bu Sari",
  },
  {
    id: 10002,
    childId: 1,
    recordedAt: "2026-09-12",
    category: "Aktivitas",
    title: "Kegiatan bermain",
    content:
      "Aisyah mengikuti kegiatan bermain bersama anak lain selama kurang lebih 30 menit.",
    recordedBy: "Bu Sari",
  },
  {
    id: 10003,
    childId: 1,
    recordedAt: "2026-09-11",
    category: "Perilaku",
    title: "Kondisi pagi",
    content:
      "Aisyah terlihat lebih tenang dari biasanya dan membutuhkan beberapa kali ajakan untuk mengikuti kegiatan.",
    recordedBy: "Pak Andi",
  },

  {
    id: 20001,
    childId: 2,
    recordedAt: "2026-09-12",
    category: "Aktivitas",
    title: "Bermain di luar",
    content:
      "Budi aktif mengikuti kegiatan bermain di luar bersama anak-anak lainnya.",
    recordedBy: "Pak Andi",
  },
  {
    id: 20002,
    childId: 2,
    recordedAt: "2026-09-11",
    category: "Makan",
    title: "Makan siang",
    content:
      "Budi menghabiskan porsi makan siang dan meminta tambahan makanan.",
    recordedBy: "Bu Rina",
  },

  {
    id: 30001,
    childId: 3,
    recordedAt: "2026-09-11",
    category: "Aktivitas",
    title: "Kegiatan bersama",
    content:
      "Citra mengikuti kegiatan bersama dengan pendamping dan dapat mengikuti aktivitas sesuai kebutuhannya.",
    recordedBy: "Bu Sari",
  },
  {
    id: 30002,
    childId: 3,
    recordedAt: "2026-09-10",
    category: "Perilaku",
    title: "Pendampingan",
    content:
      "Citra membutuhkan pendampingan selama kegiatan dan merespons dengan baik terhadap arahan pengasuh.",
    recordedBy: "Bu Sari",
  },

  {
    id: 40001,
    childId: 4,
    recordedAt: "2026-09-10",
    category: "Aktivitas",
    title: "Kegiatan pagi",
    content:
      "Dafa mengikuti kegiatan pagi dengan aktif dan bermain bersama anak lainnya.",
    recordedBy: "Pak Andi",
  },
  {
    id: 40002,
    childId: 4,
    recordedAt: "2026-09-09",
    category: "Tidur",
    title: "Tidur siang",
    content:
      "Dafa tidur siang dengan baik dan bangun dalam kondisi aktif.",
    recordedBy: "Pak Andi",
  },

  {
    id: 50001,
    childId: 5,
    recordedAt: "2026-09-09",
    category: "Makan",
    title: "Makan pagi",
    content:
      "Eka menghabiskan sarapan dengan baik dan tidak terdapat catatan khusus.",
    recordedBy: "Bu Rina",
  },
  {
    id: 50002,
    childId: 5,
    recordedAt: "2026-09-08",
    category: "Aktivitas",
    title: "Kegiatan bermain",
    content:
      "Eka mengikuti kegiatan bermain dan berinteraksi dengan anak lainnya.",
    recordedBy: "Bu Rina",
  },
];

export const reminders: Reminder[] = [
  {
    id: 1,
    childId: 1,
    title: "Pantau kondisi makan Aisyah",
    description:
      "Perhatikan pola makan Aisyah dan catat perkembangannya.",
    type: "Penting",
    dueDate: "2026-09-14",
    dueTime: "09:00",
    repeat: "Tidak berulang",
    completed: false,
    createdAt: "2026-09-13",
  },

  {
    id: 2,
    childId: 1,
    title: "Pengukuran pertumbuhan Aisyah",
    description:
      "Lakukan pengukuran berat dan tinggi secara berkala.",
    type: "Rutin",
    dueDate: "2026-09-20",
    dueTime: "09:00",
    repeat: "Setiap bulan",
    completed: false,
    createdAt: "2026-08-20",
  },

  {
    id: 3,
    childId: 2,
    title: "Pemeriksaan rutin Budi",
    description:
      "Lakukan pemeriksaan rutin dan catat hasilnya.",
    type: "Rutin",
    dueDate: "2026-09-15",
    dueTime: "10:00",
    repeat: "Setiap bulan",
    completed: false,
    createdAt: "2026-08-15",
  },

  {
    id: 4,
    childId: 3,
    title: "Evaluasi pendampingan Citra",
    description:
      "Tinjau kembali kebutuhan pendampingan Citra.",
    type: "Penting",
    dueDate: "2026-09-16",
    dueTime: "13:00",
    repeat: "Tidak berulang",
    completed: false,
    createdAt: "2026-09-13",
  },

  {
    id: 5,
    title: "Periksa stok perlengkapan anak",
    description:
      "Periksa ketersediaan perlengkapan yang digunakan bersama.",
    type: "Rutin",
    dueDate: "2026-09-18",
    dueTime: "08:30",
    repeat: "Setiap minggu",
    completed: false,
    createdAt: "2026-09-11",
  },

  {
    id: 6,
    childId: 4,
    title: "Catat pengukuran pertumbuhan Dafa",
    description:
      "Pastikan hasil pengukuran terbaru tercatat di sistem.",
    type: "Rutin",
    dueDate: "2026-09-25",
    dueTime: "09:00",
    repeat: "Setiap bulan",
    completed: false,
    createdAt: "2026-08-25",
  },

  {
    id: 7,
    childId: 5,
    title: "Pemeriksaan rutin Eka",
    description:
      "Lakukan pemeriksaan rutin dan perbarui catatan kesehatan.",
    type: "Rutin",
    dueDate: "2026-09-28",
    dueTime: "10:00",
    repeat: "Setiap bulan",
    completed: false,
    createdAt: "2026-08-28",
  },
];
