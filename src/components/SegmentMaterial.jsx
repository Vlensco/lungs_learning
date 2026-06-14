import React from 'react';
import { BookOpen, AlertTriangle, ArrowRight, ShieldAlert, X } from 'lucide-react';

export default function SegmentMaterial({ segmentId, lang, onNext, onClose }) {
  
  // Localized materials database
  const materials = {
    'Saluran Napas': {
      title: lang === 'id' ? 'Saluran Napas Utama (Airways)' : 'Main Airways & Conducting Zone',
      subtitle: lang === 'id' ? 'Anatomi Makroskopis Zona Konduksi' : 'Macroscopic Anatomy of the Conducting Zone',
      intro: lang === 'id'
        ? 'Saluran napas konduksi bertugas untuk menyalurkan, menyaring, menghangatkan, dan melembapkan udara sebelum mencapai zona respirasi di alveolus. Dinding saluran napas dilapisi oleh epitel kolumnar berlapis semu bersilia (epitel respiratorius) dengan sel Goblet yang memproduksi mukus untuk menangkap partikel asing.'
        : 'The conducting zone channels, filters, warms, and humidifies air before it reaches the respiratory zone in the alveoli. The airway walls are lined by ciliated pseudostratified columnar epithelium (respiratory epithelium) containing mucus-secreting Goblet cells to trap foreign particles.',
      clinicalTitle: lang === 'id' ? 'KORELASI KLINIS: ASPIRASI BENDA ASING' : 'CLINICAL CORRELATION: FOREIGN BODY ASPIRATION',
      clinicalDesc: lang === 'id'
        ? 'Secara klinis, jika pasien tidak sengaja menghirup benda asing (aspirasi), benda tersebut paling sering tersangkut di Bronkus Utama Kanan. Hal ini disebabkan karena bronkus utama kanan memiliki diameter lebih lebar, lebih pendek, dan jalurnya lebih vertikal/lurus dibandingkan bronkus utama kiri yang lebih mendatar/horizontal karena posisi jantung.'
        : 'Clinically, if a patient accidentally inhales a foreign object, it is much more likely to lodge in the Right Main Bronchus. This is because the right main bronchus is wider, shorter, and runs more vertically than the left main bronchus, which is pushed more horizontally by the heart.',
      organs: [
        {
          name: 'Trakea (Trachea)',
          desc: lang === 'id'
            ? 'Pipa utama sepanjang 10-12 cm yang dilapisi oleh 16-20 cincin kartilago hialin berbentuk huruf C (incomplete). Bagian belakangnya ditutup oleh otot trakealis (otot polos) untuk memfasilitasi jalannya makanan di esofagus yang berada di posteriornya.'
            : 'A 10-12 cm primary tube supported by 16-20 C-shaped (incomplete) hyaline cartilage rings. The posterior aspect is closed by the trachealis muscle (smooth muscle) to accommodate the bolus expansion in the posterior esophagus during swallowing.'
        },
        {
          name: 'Karina (Carina)',
          desc: lang === 'id'
            ? 'Batas kartilago berbentuk kait di ujung bifurkasi trakea (setinggi vertebra T4-T5). Mukosa karina memiliki sensitivitas saraf sensorik tertinggi (dari nervus vagus) sehingga jika ada benda asing menyentuhnya, refleks batuk hebat akan terpicu.'
            : 'A hook-like ridge at the bifurcation of the trachea (level with T4-T5). The carina mucosa is rich in sensory receptors (innervated by the vagus nerve), making it the most sensitive site for triggering the protective cough reflex.'
        },
        {
          name: 'Bronkus Utama (Main Bronchi)',
          desc: lang === 'id'
            ? 'Percabangan pertama trakea. Bronkus utama kanan mengalirkan udara ke paru kanan (3 lobus), sedangkan bronkus utama kiri mengalirkan udara ke paru kiri (2 lobus).'
            : 'The primary tracheal bifurcation. The right main bronchus leads to the right lung (3 lobes), whereas the left main bronchus conducts air to the left lung (2 lobes).'
        },
        {
          name: 'Bronkus Lobaris & Segmentalis (Lobar & Segmental Bronchi)',
          desc: lang === 'id'
            ? 'Bronkus lobaris (sekunder) menyuplai setiap lobus paru. Bronkus segmentalis (tersier) menyuplai segmen bronkopulmonal (unit fungsional terkecil paru yang memiliki pembungkus jaringan ikat sendiri, sehingga dapat dipotong secara bedah secara mandiri).'
            : 'Lobar (secondary) bronchi supply each lung lobe. Segmental (tertiary) bronchi supply bronchopulmonary segments, which are the smallest independent functional lung units wrapped in connective tissue, allowing single surgical resection.'
        }
      ]
    },
    'Lobus Paru': {
      title: lang === 'id' ? 'Lobus Paru (Lung Lobes)' : 'Lung Lobes & Facies',
      subtitle: lang === 'id' ? 'Struktur Makroskopis dan Permukaan Paru' : 'Macroscopic Structure and Lung Surfaces',
      intro: lang === 'id'
        ? 'Paru-paru memiliki bentuk kerucut dengan bagian puncak (apex) yang menonjol di atas kosta pertama dan bagian dasar (basis) yang menempel pada diafragma. Paru kanan dan kiri memiliki perbedaan anatomi yang signifikan untuk mengakomodasi ruang organ jantung di rongga mediastinum dada kiri.'
        : 'The lungs are cone-shaped with an apex projecting above the first rib and a base resting on the diaphragm. The right and left lungs have major anatomical differences to accommodate the heart within the left chest mediastinum cavity.',
      clinicalTitle: lang === 'id' ? 'KORELASI KLINIS: LOBEKTOMI & RADIX PULMONIS' : 'CLINICAL CORRELATION: LOBECTOMY & RADIX PULMONIS',
      clinicalDesc: lang === 'id'
        ? 'Pada kasus tumor paru terlokalisir, ahli bedah melakukan lobektomi (pengangkatan satu lobus). Struktur hilum paru (tempat keluar masuknya bronkus, arteri, dan vena pulmonalis) harus diidentifikasi secara presisi. Di paru kanan, susunan hilum dari superior ke inferior adalah Bronkus-Arteri-Vena (BAV), sedangkan di paru kiri adalah Arteri-Bronkus-Vena (ABV).'
        : 'In localized lung tumors, surgeons perform a lobectomy (resection of one lobe). The structures of the lung root / hilum (where the bronchi, pulmonary arteries, and veins enter/exit) must be carefully isolated. On the right, the arrangement from superior to inferior is Bronchus-Artery-Vein (BAV), while on the left it is Artery-Bronchus-Vein (ABV).',
      organs: [
        {
          name: 'Paru Kanan (Right Lung - 3 Lobes)',
          desc: lang === 'id'
            ? 'Memiliki 3 lobus: Superior, Medius, dan Inferior. Paru kanan lebih besar dan berat, namun lebih pendek karena kubah diafragma kanan didorong ke atas oleh organ hati (hepar).'
            : 'Consists of 3 lobes: Superior, Middle, and Inferior. The right lung is larger and heavier but shorter because the right dome of the diaphragm is pushed upward by the liver.'
        },
        {
          name: 'Paru Kiri (Left Lung - 2 Lobes)',
          desc: lang === 'id'
            ? 'Memiliki 2 lobus: Superior dan Inferior. Paru kiri memiliki cekungan impressio cardiaca dan cardiac notch pada facies mediastinalis untuk menampung apeks jantung. Memiliki Lingula (bagian bawah lobus superior kiri) yang homolog dengan lobus medius kanan.'
            : 'Consists of 2 lobes: Superior and Inferior. The left lung features a cardiac impression and notch on its mediastinal surface to house the heart apex. It has the Lingula (lower projection of the left superior lobe), which is the homologue of the right middle lobe.'
        },
        {
          name: 'Basis & Apex Pulmonis',
          desc: lang === 'id'
            ? 'Apex menonjol ke atas melewati apertura thoracis superior hingga pangkal leher. Basis berbentuk cekung (facies diaphragmatica) menyesuaikan bentuk kubah diafragma di bawahnya.'
            : 'The apex projects superiorly through the superior thoracic aperture into the root of the neck. The base is concave (diaphragmatic surface) conforming to the dome of the diaphragm below.'
        }
      ]
    },
    'Fisura': {
      title: lang === 'id' ? 'Fisura Paru (Fissures)' : 'Anatomical Fissures',
      subtitle: lang === 'id' ? 'Garis Batas Anatomi dan Mekanika Paru' : 'Anatomical Boundaries and Lung Expansion Mechanics',
      intro: lang === 'id'
        ? 'Fisura adalah lipatan pleura viseral yang membagi paru-paru secara anatomi menjadi lobus-lobus terpisah. Fisura ini memungkinkan lobus-lobus paru untuk meluncur satu sama lain saat proses bernapas (mengembang dan mengempis), sehingga mengurangi gesekan mekanis dan membatasi penyebaran penyakit lokalisir.'
        : 'Fissures are double folds of visceral pleura that divide the lungs into lobes. These fissures allow the lobes to slide relative to one another during respiration, minimizing mechanical friction and containing localized infections or disease spread.',
      clinicalTitle: lang === 'id' ? 'KORELASI KLINIS: LANDMARK FISURA & VARIASI FISURA' : 'CLINICAL CORRELATION: FISSURE LANDMARKS & VARIATIONS',
      clinicalDesc: lang === 'id'
        ? 'Secara klinis di permukaan dinding dada, fisura obliqua diproyeksikan mulai dari prosesus spinosus vertebra T3/T4 secara diagonal ke sela iga ke-6 di anterior. Fisura horizontalis diproyeksikan mengikuti kosta ke-4 kanan. Jika terjadi variasi berupa fisura tidak lengkap (incomplete fissure), hal ini dapat memicu kebocoran udara pasca-operasi bedah lobus.'
        : 'Clinically on the chest wall, the oblique fissure is projected from the T3/T4 spinous process diagonally to the 6th costal cartilage anteriorly. The horizontal fissure runs along the right 4th rib. Incomplete fissures (an anatomical variation) can lead to postoperative air leaks during lobar resection.',
      organs: [
        {
          name: 'Fisura Horizontalis (Horizontal Fissure)',
          desc: lang === 'id'
            ? 'Hanya terdapat pada paru kanan. Memisahkan lobus superior kanan dari lobus medius kanan. Berjalan horizontal setinggi kartilago kosta ke-4 di anterior.'
            : 'Found only in the right lung. It separates the superior lobe from the middle lobe. It extends horizontally at the level of the 4th costal cartilage anteriorly.'
        },
        {
          name: 'Fisura Obliqua Kanan (Right Oblique Fissure)',
          desc: lang === 'id'
            ? 'Fisura diagonal panjang pada paru kanan yang memisahkan lobus inferior kanan dari lobus medius dan superior kanan.'
            : 'A long diagonal fissure in the right lung separating the inferior lobe from the superior and middle lobes.'
        },
        {
          name: 'Fisura Obliqua Kiri (Left Oblique Fissure)',
          desc: lang === 'id'
            ? 'Satu-satunya fisura pada paru kiri. Memisahkan lobus superior kiri dari lobus inferior kiri. Berjalan miring dari superior posterior ke inferior anterior.'
            : 'The sole fissure in the left lung, dividing the superior lobe from the inferior lobe. It runs obliquely from superior posterior to inferior anterior.'
        }
      ]
    },
    'Mikro': {
      title: lang === 'id' ? 'Struktur Mikroskopis (Microscopic)' : 'Microscopic Structures & Gas Exchange',
      subtitle: lang === 'id' ? 'Histologi Saluran Napas Kecil dan Alveolus' : 'Histology of Small Airways and Alveoli',
      intro: lang === 'id'
        ? 'Saat saluran napas bercabang melampaui bronkus tersier, mereka bertransisi menjadi bronkiolus yang berdiameter <1 mm dan tidak lagi memiliki kartilago maupun kelenjar mukosa. Dinding bronkiolus didominasi oleh serat elastik dan otot polos. Di ujung bronkiolus terdapat alveolus, unit pertukaran gas utama.'
        : 'As airways branch beyond tertiary bronchi, they transition into bronchioles which measure <1mm in diameter and completely lack cartilage and mucosal glands. Their walls are dominated by elastic fibers and smooth muscle. At the terminal ends are the alveoli, the units of gas exchange.',
      clinicalTitle: lang === 'id' ? 'KORELASI KLINIS: PATOFISIOLOGI ASMA & DEFISIENSI SURFAKTAN (RDS)' : 'CLINICAL CORRELATION: ASTHMA & SURFACTANT DEFICIENCY (RDS)',
      clinicalDesc: lang === 'id'
        ? 'Pada penyakit asma, terjadi hipersensitivitas otot polos bronkiolus yang memicu konstriksi (bronkokonstriksi) akibat stimulasi parasimpatis nervus vagus, mempersempit lumen jalan napas. Di tingkat alveolus, sel pneumosit tipe II mensekresikan surfaktan (DPPC) untuk menurunkan tegangan permukaan. Defisiensi surfaktan pada bayi prematur menyebabkan Respiratory Distress Syndrome (RDS) di mana alveolus kolaps.'
        : 'In asthma, hyperreactive bronchiolar smooth muscles constrict (bronchoconstriction) under parasympathetic vagal stimulation, narrowing the airway lumen. At the alveolar level, Type II pneumocytes secrete surfactant (DPPC) to lower surface tension. Surfactant deficiency in premature infants causes Respiratory Distress Syndrome (RDS) where the alveoli collapse.',
      organs: [
        {
          name: 'Bronkiolus (Bronchioles)',
          desc: lang === 'id'
            ? 'Saluran kecil tanpa kartilago. Epitel berubah dari kolumnar bersilia menjadi kuboid sederhana. Mengandung sel Clara (Club cells) yang memproduksi protein sekretori pelindung dan berfungsi sebagai sel punca jika epitel rusak.'
            : 'Small airways lacking cartilage. Epithelium transitions from ciliated columnar to simple cuboidal. Contains Clara cells (Club cells) that produce protective secretions and act as stem cells for epithelial regeneration.'
        },
        {
          name: 'Otot Polos Bronkiolus (Bronchioral Smooth Muscle)',
          desc: lang === 'id'
            ? 'Mengelilingi lumen bronkiolus secara heliks. Mengatur resistensi aliran udara. Stimulasi simpatis (epinefrin) menyebabkan dilatasi (relaksasi), sedangkan parasimpatis (asetilkolin) menyebabkan konstriksi.'
            : 'Wraps helically around the bronchiolar lumen. Modulates airflow resistance. Sympathetic signals (epinephrine) trigger bronchodilation, while parasympathetic signals (acetylcholine) cause bronchoconstriction.'
        },
        {
          name: 'Alveoli & Sakus Alveolar (Alveolar Sacs)',
          desc: lang === 'id'
            ? 'Kantung anggur mikroskopis tempat terjadinya pertukaran gas melalui difusi pasif. Membran respirasi (blood-air barrier) terdiri dari: surfaktan, epitel sel pneumosit tipe I (sangat tipis), membran basal bersama yang menyatu, dan sel endotel kapiler.'
            : 'Microscopic sacs where respiratory gas exchange occurs via passive diffusion. The respiratory membrane (blood-air barrier) consists of: surfactant, Type I pneumocyte epithelium (ultra-thin), fused basement membrane, and capillary endothelium.'
        }
      ]
    },
    'Mekanisme Bernapas': {
      title: lang === 'id' ? 'Mekanisme Bernapas (Respiratory Mechanics)' : 'Respiratory Mechanics & Pleural Spaces',
      subtitle: lang === 'id' ? 'Fisiologi Ventilasi dan Rongga Pleura' : 'Physiology of Ventilation and Pleural Cavities',
      intro: lang === 'id'
        ? 'Ventilasi adalah proses mekanis keluar masuknya udara ke paru-paru berdasarkan perubahan volume dan tekanan rongga dada (Hukum Boyle). Paru-paru tidak memiliki otot rangka sendiri, sehingga pergerakannya sangat bergantung pada kontraksi otot pernapasan luar dan integritas rongga pleura yang kedap udara.'
        : 'Ventilation is the mechanical movement of air in and out of the lungs driven by changes in thoracic volume and pressure (Boyle\'s Law). The lungs contain no skeletal muscle of their own, depending entirely on respiratory muscle contraction and a sealed pleural space.',
      clinicalTitle: lang === 'id' ? 'KORELASI KLINIS: EFUSI PLEURA, PNEUMOTHORAX & TORAKOSENTESIS' : 'CLINICAL CORRELATION: PLEURAL EFFUSION, PNEUMOTHORAX & THORACOCENTESIS',
      clinicalDesc: lang === 'id'
        ? 'Jika rongga pleura terisi udara (pneumothorax) atau cairan patologis (efusi pleura), tekanan negatif intrapleura akan hilang, menyebabkan paru kolaps (atelektasis). Cairan sering menumpuk di recessus costodiaphragmaticus (titik terendah). Tindakan jarum untuk menyedot cairan tersebut disebut Torakosentesis, dilakukan di sela iga ke-7 hingga ke-9 di atas batas superior iga untuk menghindari berkas saraf-pembuluh darah.'
        : 'If the pleural cavity fills with air (pneumothorax) or fluid (pleural effusion), the negative intrapleural pressure is lost, collapsing the lung (atelectasis). Fluid typically pools in the costodiaphragmatic recess. A needle aspiration procedure called Thoracocentesis is performed at the 7th-9th intercostal spaces along the superior rib border to avoid intercostal neurovascular bundles.',
      organs: [
        {
          name: 'Diafragma (Diaphragm)',
          desc: lang === 'id'
            ? 'Otot skelet berbentuk kubah yang memisahkan rongga dada dan perut. Diinervasi oleh Nervus Phrenicus (C3-C5). Saat inspirasi, diafragma berkontraksi, mendatar, dan turun untuk memperbesar rongga dada secara vertikal, menciptakan tekanan negatif yang menyedot udara masuk.'
            : 'A dome-shaped skeletal muscle separating the thoracic and abdominal cavities. Innervated by the Phrenic Nerve (C3-C5). During inspiration, it contracts and flattens, increasing thoracic vertical volume to create negative pressure that sucks air in.'
        },
        {
          name: 'Pleura Parietalis & Visceralis (Pleura)',
          desc: lang === 'id'
            ? 'Pleura visceralis melapisi permukaan paru secara langsung dan tidak memiliki reseptor nyeri. Pleura parietalis melapisi rongga dada dalam, diinervasi oleh nervus interkostalis dan phrenikus (sangat sensitif terhadap nyeri).'
            : 'Visceral pleura directly covers the lung and lacks pain receptors. Parietal pleura lines the inner chest wall, innervated by intercostal and phrenic nerves (highly sensitive to pain).'
        },
        {
          name: 'Cavitas Pleuralis & Recessus Pleura',
          desc: lang === 'id'
            ? 'Rongga potensial berisi cairan serosa pelumas tipis. Tekanan intrapleura selalu sub-atmosferik (-4 mmHg pada kondisi istirahat) untuk menjaga paru tetap mengembang menempel pada dinding dada.'
            : 'A potential space containing lubricating serous fluid. Intrapleural pressure remains subatmospheric (-4 mmHg at rest) to keep the lungs expanded against the chest wall.'
        }
      ]
    }
  };

  const currentMaterial = materials[segmentId];
  if (!currentMaterial) return null;

  // Localized texts
  const t = {
    nextBtn: lang === 'id' ? 'Mulai Eksplorasi 3D' : 'Start 3D Exploration',
    tableOrganCol: lang === 'id' ? 'Struktur Anatomi' : 'Anatomical Structure',
    tableDescCol: lang === 'id' ? 'Deskripsi & Histologi Medis' : 'Medical Description & Histology',
  };

  return (
    <div className="practice-portal-overlay" style={{ alignItems: 'flex-start', overflowY: 'auto', padding: '40px 20px' }}>
      <div className="material-reading-panel glass-panel">
        
        {/* Title */}
        <div className="material-title-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p>{currentMaterial.subtitle}</p>
            <h3>{currentMaterial.title}</h3>
          </div>
          <button className="practice-close-btn" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Scroll Content */}
        <div className="material-scroll-area">
          
          <p>{currentMaterial.intro}</p>

          {/* Organs Table */}
          <h4>{lang === 'id' ? 'Daftar Detail Struktur Anatomi' : 'Anatomical Structure Breakdown'}</h4>
          <table className="material-organs-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>{t.tableOrganCol}</th>
                <th style={{ width: '70%' }}>{t.tableDescCol}</th>
              </tr>
            </thead>
            <tbody>
              {currentMaterial.organs.map((org, idx) => (
                <tr key={idx}>
                  <td><strong>{org.name}</strong></td>
                  <td>{org.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Clinical Correlation Warning box */}
          <div className="material-clinical-alert">
            <strong>
              <ShieldAlert size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
              {currentMaterial.clinicalTitle}
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#78350f' }}>
              {currentMaterial.clinicalDesc}
            </p>
          </div>

        </div>

        {/* Footer next button */}
        <button className="material-next-btn" onClick={onNext}>
          <span>{t.nextBtn}</span>
          <ArrowRight size={16} />
        </button>

      </div>
    </div>
  );
}
