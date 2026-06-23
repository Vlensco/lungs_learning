import React from 'react';
import { BookOpen, AlertTriangle, ArrowRight, ShieldAlert, X, Rotate3D } from 'lucide-react';

export default function SegmentMaterial({ segmentId, lang, onNext, onClose }) {
  
  // Localized materials database
  const materials = {
    'Trachea': {
      title: lang === 'id' ? 'Trachea (Trakea)' : 'Trachea',
      subtitle: lang === 'id' ? 'Anatomi & Struktur Trakea' : 'Anatomy & Structure of the Trachea',
      intro: lang === 'id'
        ? 'Trakea merupakan saluran udara utama sepanjang ±10–12 cm yang membentang dari batas inferior kartilago cricoidea (C6) hingga bifurcatio tracheae (T4/T5). Trakea terletak di linea mediana, anterior terhadap oesophagus, dan terbagi menjadi pars cervicalis (leher) serta pars thoracica (dada). Dindingnya dilapisi oleh epitel respiratorius bersilia yang berfungsi membersihkan debu.'
        : 'The trachea is the main airway, measuring ±10–12 cm in length, extending from the inferior border of the cricoid cartilage (C6) to the tracheal bifurcation (T4/T5). Located along the midline anterior to the esophagus, it is divided into cervical (pars cervicalis) and thoracic (pars thoracica) parts, lined by ciliated respiratory epithelium.',
      clinicalTitle: lang === 'id' ? 'KORELASI KLINIS: CARINA & REFLEKS BATUK' : 'CLINICAL CORRELATION: CARINA & COUGH REFLEX',
      clinicalDesc: lang === 'id'
        ? 'Pada percabangan trakea (bifurcatio tracheae) terdapat carina tracheae, yaitu tonjolan kartilaginosa intraluminal. Mukosa carina sangat sensitif karena kaya akan reseptor saraf sensorik (nervus vagus). Jika partikel makanan atau benda asing menyentuhnya, refleks batuk hebat akan dipicu sebagai pertahanan tubuh untuk melestarikan jalan napas.'
        : 'At the tracheal bifurcation lies the carina, an internal cartilaginous ridge. The mucosa of the carina is highly sensitive due to rich sensory innervation (vagus nerve). If foreign particles or food touch the carina, it triggers a violent cough reflex to protect the airway and clear the obstruction.',
      sketchfabLinks: [
        {
          url: 'https://skfb.ly/opJAx',
          label: { id: 'Model 3D Trachea (Sketchfab)', en: 'Trachea 3D Model (Sketchfab)' }
        }
      ],
      organs: [
        {
          name: lang === 'id' ? 'Pars Cervicalis & Thoracica' : 'Cervical & Thoracic Parts',
          desc: lang === 'id'
            ? 'Pars cervicalis terletak di regio leher sedangkan pars thoracica masuk ke rongga mediastinum dada. Keduanya menyalurkan udara secara langsung menuju paru.'
            : 'The cervical part lies in the neck region, while the thoracic part extends into the chest mediastinum. Both act as a direct channel to direct air into the lungs.'
        },
        {
          name: 'Cartilagines Tracheales',
          desc: lang === 'id'
            ? 'Dinding trakea diperkuat oleh 16–20 tulang rawan hialin berbentuk huruf C/U. Bagian posterior cincin ini terbuka dan ditutup oleh otot trakealis (otot polos) untuk memberi kelenturan saat esofagus mengembang menelan makanan.'
            : 'Reinforced by 16–20 C-shaped or U-shaped hyaline cartilage rings. The posterior open gap is closed by the trachealis smooth muscle, allowing esophageal expansion during swallowing.'
        },
        {
          name: 'Ligamenta Annularia',
          desc: lang === 'id'
            ? 'Struktur ligamen elastis yang menghubungkan cincin kartilago trakea satu dengan lainnya, menjaga fleksibilitas dan memungkinkan trakea memanjang-memendek selama respirasi.'
            : 'Elastic ligamentous structures connecting adjacent tracheal cartilages, providing flexibility and allowing the trachea to stretch and contract during respiration.'
        },
        {
          name: 'Bifurcatio Trachea',
          desc: lang === 'id'
            ? 'Titik percabangan trakea setinggi angulus sterni (T4-T5) yang memisahkan bronkus utama kanan dan kiri. Di dalam bifurkasi terdapat tonjolan carina tracheae.'
            : 'The branching point of the trachea at the sternal angle level (T4-T5), dividing into the right and left main bronchi. It contains the carina ridge internally.'
        }
      ]
    },
    'Arbor Bronchialis': {
      title: lang === 'id' ? 'Arbor Bronchialis (Cabang Bronkus)' : 'Bronchial Tree (Arbor Bronchialis)',
      subtitle: lang === 'id' ? 'Sistem Percanangan Saluran Napas Intrapulmonal' : 'Intrapulmonary Airway Branching System',
      intro: lang === 'id'
        ? 'Arbor bronchialis adalah percabangan berulang saluran udara dari bronkus utama hingga alveoli. Saluran ini bertambah sempit namun luas permukaannya meningkat drastis. Zona konduksi (bronkus utama, lobaris, segmentalis, dan bronkiolus terminalis) bertugas mengalirkan udara, sedangkan zona respirasi (bronkiolus respiratorius dan alveoli) melakukan pertukaran gas.'
        : 'The bronchial tree is a branching network from the main bronchi down to the alveoli. The airway diameter narrows but the total surface area increases. The conducting zone channels air, while the respiratory zone (respiratory bronchioles, alveolar sacs) is the site of gas exchange.',
      clinicalTitle: lang === 'id' ? 'KORELASI KLINIS: ASPIRASI BENDA ASING & ASMA' : 'CLINICAL CORRELATION: FOREIGN BODY ASPIRATION & ASTHMA',
      clinicalDesc: lang === 'id'
        ? 'Secara anatomi, Bronchus Principalis Dexter (kanan) lebih pendek, lebih lebar, dan lebih vertikal dibanding sinister (kiri). Akibatnya, benda asing yang terhirup paling sering masuk ke paru kanan. Pada asma, otot polos bronkiolus mengalami konstriksi (bronkokonstriksi) akibat hipersensitivitas otonom, mempersempit jalan napas sehingga menyebabkan sesak.'
        : 'Anatomically, the Right Main Bronchus is wider, shorter, and more vertical than the left. Consequently, aspirated foreign bodies lodge more frequently in the right lung. In asthma, the bronchiolar smooth muscle contracts excessively (bronchoconstriction) under parasympathetic stimulation, narrowing the airways.',
      sketchfabLinks: [
        {
          url: 'https://skfb.ly/opJAx',
          label: { id: 'Model 3D Arbor Bronchialis (Sketchfab)', en: 'Bronchial Tree 3D Model (Sketchfab)' }
        }
      ],
      organs: [
        {
          name: 'Bronchi Principales',
          desc: lang === 'id'
            ? 'Bronkus utama kanan bercabang menjadi 3 lobaris (superior, medius, inferior), sedangkan bronkus utama kiri bercabang menjadi 2 lobaris (superior, inferior).'
            : 'The primary bronchi. The right main bronchus splits into 3 lobar bronchi (superior, middle, inferior), while the left main bronchus divides into 2 lobar bronchi.'
        },
        {
          name: 'Bronchi Lobares (Sekunder)',
          desc: lang === 'id'
            ? 'Menyuplai masing-masing lobus paru. Di paru kanan terdapat 3 bronkus lobaris, sedangkan di paru kiri terdapat 2 bronkus lobaris.'
            : 'Secondary bronchi that supply each lobe. There are 3 lobar bronchi in the right lung and 2 lobar bronchi in the left lung.'
        },
        {
          name: 'Bronchi Segmentales (Tersier)',
          desc: lang === 'id'
            ? 'Bercabang dari bronkus lobaris untuk menyuplai segmen bronkopulmonal. Paru kanan memiliki 10 segmen klasik (S1-S10) dan paru kiri memiliki 8-10 segmen.'
            : 'Branches of lobar bronchi supplying bronchopulmonary segments. The right lung has 10 classic segments (S1-S10) and the left lung has 8-10 segments.'
        },
        {
          name: 'Bronkiolus & Alveoli',
          desc: lang === 'id'
            ? 'Bronkiolus merupakan saluran <1 mm tanpa kartilago yang dilapisi otot polos. Ujungnya bermuara di alveoli, kantung udara berdinding tipis tempat difusi O2 dan CO2 terjadi.'
            : 'Bronchioles are <1 mm pathways without cartilage wrapped in smooth muscle. They lead to the alveoli, thin-walled air sacs where O2 and CO2 diffuse.'
        }
      ]
    },
    'Pleura & Cavitas Pleuralis': {
      title: lang === 'id' ? 'Pleura & Cavitas Pleuralis' : 'Pleura & Pleural Cavity',
      subtitle: lang === 'id' ? 'Selaput Pembungkus & Ruang Rongga Dada' : 'Lung Lining & Thoracic Cavity Space',
      intro: lang === 'id'
        ? 'Pleura adalah membran serosa ganda yang melapisi paru-paru dan dinding dada. Di antara kedua lapisan pleura terdapat cavitas pleuralis, sebuah ruang potensial kedap udara yang berisi sedikit cairan serosa pelumas fisiologis. Rongga ini mempertahankan tekanan negatif (-4 mmHg) agar paru tetap mengembang menempel pada dinding dada.'
        : 'The pleura is a double-layered serous membrane lining the lungs and chest wall. Between them lies the pleural cavity, a potential airtight space containing a small amount of lubricating serous fluid. This cavity maintains a subatmospheric negative pressure (-4 mmHg) to keep the lungs inflated.',
      clinicalTitle: lang === 'id' ? 'KORELASI KLINIS: PNEUMOTHORAX & TORAKOSENTESIS' : 'CLINICAL CORRELATION: PNEUMOTHORAX & THORACOCENTESIS',
      clinicalDesc: lang === 'id'
        ? 'Jika dinding dada terluka atau pleura robek (misal kecelakaan), udara masuk ke rongga pleura (pneumothorax). Kehilangan tekanan negatif menyebabkan paru kolaps (atelektasis). Bila terisi cairan patologis (efusi pleura), cairan mengendap di recessus costodiaphragmaticus (sudut terendah). Tindakan jarum penyedotan cairan disebut torakosentesis, dilakukan di sela iga ke-7 hingga ke-9 di atas batas superior iga demi menghindari saraf.'
        : 'If the chest wall is punctured or pleura ruptured, air enters the pleural space (pneumothorax). The loss of negative pressure collapses the lung (atelectasis). Fluid accumulation (pleural effusion) pools in the costodiaphragmatic recess. Thoracocentesis (needle drainage) is done at the 7th-9th intercostal space along the upper rib border to avoid nerves.',
      sketchfabLinks: [],
      organs: [
        {
          name: 'Pleura Parietalis',
          desc: lang === 'id'
            ? 'Lapisan pleura luar yang menempel pada dinding dada dalam, diafragma, dan mediastinum. Dibagi menjadi pars costalis, diaphragmatica, mediastinalis, dan cervicalis. Memiliki persarafan sensorik nyeri somatik (sangat sensitif nyeri).'
            : 'The outer pleural layer lining the inner thoracic wall, diaphragm, and mediastinum. Divided into costal, diaphragmatic, mediastinal, and cervical parts. Somatically innervated and highly sensitive to pain.'
        },
        {
          name: 'Pleura Visceralis',
          desc: lang === 'id'
            ? 'Lapisan pleura dalam yang melekat erat langsung pada parenkim paru dan berlanjut ke dalam fisura pulmonis. Lapisan ini tidak sensitif terhadap rangsang nyeri.'
            : 'The inner pleural layer adhering tightly to the lung parenchyma and extending into the fissures. It is insensitive to somatic pain receptors.'
        },
        {
          name: 'Cavitas Pleuralis',
          desc: lang === 'id'
            ? 'Rongga potensial kedap udara di antara pleura viseral dan parietal yang diisi cairan serosa tipis. Berfungsi mencegah friksi serta memelihara hisapan elastis paru.'
            : 'The airtight potential space containing serous fluid. Prevents friction and maintains the elastic suction that keeps the lungs expanded.'
        }
      ]
    },
    'Pulmo': {
      title: lang === 'id' ? 'Pulmo (Paru-Paru)' : 'Lungs (Pulmo)',
      subtitle: lang === 'id' ? 'Struktur Makroskopis Organ Paru' : 'Macroscopic Anatomy of the Lungs',
      intro: lang === 'id'
        ? 'Paru-paru adalah organ utama pernapasan berbentuk kerucut yang mengisi rongga dada. Paru kanan (pulmo dexter) memiliki 3 lobus yang dipisahkan oleh fisura horizontal dan obliqua. Paru kiri (pulmo sinister) memiliki 2 lobus yang dipisahkan oleh fisura obliqua. Perbedaan ini memberikan ruang bagi organ jantung di rongga mediastinum dada kiri.'
        : 'The lungs are the primary organs of respiration, filling the thoracic cavity. The right lung has 3 lobes separated by horizontal and oblique fissures. The left lung has 2 lobes separated by an oblique fissure. This anatomical asymmetry provides space for the heart in the left mediastinum cavity.',
      clinicalTitle: lang === 'id' ? 'KORELASI KLINIS: SUSUNAN HILUM & LOBEKTOMI' : 'CLINICAL CORRELATION: HILUM ARRANGEMENT & LOBECTOMY',
      clinicalDesc: lang === 'id'
        ? 'Pada tindakan bedah pengangkatan lobus paru (lobektomi), pembedah wajib mengisolasi pembuluh darah di radix pulmonis secara presisi pada hilum (gerbang masuk). Pada hilum kanan, susunan dari superior ke inferior adalah Bronkus-Arteri-Vena (BAV), sedangkan pada hilum kiri susunannya adalah Arteri-Bronkus-Vena (ABV) dengan arteri pulmonalis berada paling superior.'
        : 'During surgical resection of a lung lobe (lobectomy), the surgeon must precisely isolate structures at the hilum (root gateway). On the right hilum, the superior-to-inferior order is Bronchus-Artery-Vein (BAV), while on the left it is Artery-Bronchus-Vein (ABV) with the pulmonary artery being the most superior structure.',
      sketchfabLinks: [
        {
          url: 'https://skfb.ly/oFHLs',
          label: { id: 'Model 3D Pulmo Dextra (Referensi 1)', en: 'Right Lung 3D Model (Ref 1)' }
        },
        {
          url: 'https://skfb.ly/6VoLH',
          label: { id: 'Model 3D Pulmo Dextra (Referensi 2)', en: 'Right Lung 3D Model (Ref 2)' }
        },
        {
          url: 'https://skfb.ly/oFIIp',
          label: { id: 'Model 3D Pulmo Sinistra (Referensi 1)', en: 'Left Lung 3D Model (Ref 1)' }
        },
        {
          url: 'https://skfb.ly/6VoLQ',
          label: { id: 'Model 3D Pulmo Sinistra (Referensi 2)', en: 'Left Lung 3D Model (Ref 2)' }
        }
      ],
      organs: [
        {
          name: lang === 'id' ? 'Pulmo Dexter (Paru Kanan - 3 Lobus)' : 'Right Lung (3 Lobes)',
          desc: lang === 'id'
            ? 'Terdiri atas Lobus Superior, Medius, dan Inferior yang dipisahkan oleh Fissura Horizontalis dan Fissura Obliqua. Paru kanan lebih besar namun lebih pendek akibat desakan hati (hepar).'
            : 'Consists of Superior, Middle, and Inferior lobes separated by Horizontal and Oblique fissures. It is larger but shorter due to the liver pushing up the diaphragm.'
        },
        {
          name: lang === 'id' ? 'Pulmo Sinister (Paru Kiri - 2 Lobus)' : 'Left Lung (2 Lobes)',
          desc: lang === 'id'
            ? 'Terdiri atas Lobus Superior dan Inferior yang dipisahkan Fissura Obliqua. Memiliki lekukan jantung (Incisura Cardiaca) dan Lingula Pulmonis yang dianggap homolog dengan lobus medius kanan.'
            : 'Consists of Superior and Inferior lobes separated by the Oblique fissure. Features the Cardiac Notch and the Lingula, which is homologous to the right middle lobe.'
        },
        {
          name: 'Apex & Basis Pulmonis',
          desc: lang === 'id'
            ? 'Apex pulmonis adalah puncak paru yang menonjol di atas kosta 1 ke basis leher. Basis pulmonis adalah permukaan bawah yang cekung menyesuaikan kubah diafragma.'
            : 'The apex is the rounded top projecting above the 1st rib into the neck. The base is the concave lower surface resting on the dome of the diaphragm.'
        },
        {
          name: 'Radix, Hilum & Margines',
          desc: lang === 'id'
            ? 'Radix adalah berkas struktur yang menghubungkan paru ke mediastinum, masuk melalui hilum. Paru memiliki Margo Anterior yang tajam, Margo Posterior yang tumpul membulat, dan Margo Inferior.'
            : 'The radix is the bundle of structures connecting the lung to the mediastinum, entering at the hilum. The lung has a sharp Anterior Border, a rounded Posterior Border, and an Inferior Border.'
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

          {/* Sketchfab 3D Model Reference Section */}
          {currentMaterial.sketchfabLinks && currentMaterial.sketchfabLinks.length > 0 && (
            <div className="material-clinical-alert" style={{ background: '#f0f9ff', borderColor: '#bae6fd', borderLeftColor: '#0284c7', color: '#0369a1' }}>
              <strong style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Rotate3D size={14} />
                {lang === 'id' ? 'REFERENSI MODEL 3D SKETCHFAB' : 'SKETCHFAB 3D MODEL REFERENCES'}
              </strong>
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentMaterial.sketchfabLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      color: '#0284c7',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0284c7';
                      e.currentTarget.style.background = '#f0f6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <span>🔗 {link.label[lang]}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

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
